export const messageHandler = {
    formatMessage(role, content) {
        const hasImage = content.includes('![') && content.includes('](data:image/')
        
        return {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            role,
            content,
            thinkingContent: '',
            hasImage,
            loading: false,
            isRegenerationPlaceholder: false
        };
    },

    /**
     * 计算文本的token数量
     * @param {string} text - 要计算的文本
     * @returns {number} token数量
     */
    countTokens(text) {
        // 处理null或undefined
        if (!text) return 0;
        
        // 确保text是字符串
        text = String(text);
        
        // 简单的估算模式
        const patterns = {
            cjk: /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g,
            emoji: /[\p{Extended_Pictographic}]/gu,
            punctuation: /[^\w\s\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g,
            whitespace: /\s+/g,
            number: /\d+(\.\d+)?/g,
            latinWord: /[a-zA-Z]+([-'][a-zA-Z]+)*/g
        };
        
        // 预处理文本
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        
        // 文本分段处理
        const segments = [];
        let currentPos = 0;
        
        // 处理代码块
        const codeBlockRegex = /```[\s\S]*?```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(normalizedText)) !== null) {
            if (match.index > currentPos) {
                segments.push({
                    type: 'text',
                    content: normalizedText.substring(currentPos, match.index)
                });
            }
            
            segments.push({
                type: 'code_block',
                content: match[0]
            });
            
            currentPos = match.index + match[0].length;
        }
        
        if (currentPos < normalizedText.length) {
            segments.push({
                type: 'text',
                content: normalizedText.substring(currentPos)
            });
        }
        
        // 计算token
        let totalTokens = 0;
        
        segments.forEach(segment => {
            if (segment.type === 'code_block') {
                const code = segment.content.replace(/```[\w]*\n?|\n?```$/g, '');
                const codeTokens = code.split(/(\s+|[{}()\[\].,;:=<>!&|^+\-*/%~#]+)/)
                    .filter(Boolean)
                    .length;
                totalTokens += codeTokens + 3; // 3 tokens for code block markers
            } else {
                const text = segment.content;
                
                // 计算中文和其他CJK字符
                const cjkChars = (text.match(patterns.cjk) || []).length;
                
                // 计算拉丁文单词
                let wordTokens = 0;
                const words = text.match(patterns.latinWord) || [];
                words.forEach(word => {
                    if (word.length <= 2) {
                        wordTokens += 1;
                    } else if (word.length <= 6) {
                        wordTokens += Math.ceil(word.length / 2.5);
                    } else {
                        wordTokens += Math.ceil(word.length / 2);
                    }
                });
                
                // 计算数字token
                const numbers = text.match(patterns.number) || [];
                const numberTokens = numbers.reduce((sum, num) => {
                    if (num.length <= 2) return sum + 1;
                    return sum + Math.ceil(num.length / 2);
                }, 0);
                
                // 计算其他token
                const punctuationCount = (text.match(patterns.punctuation) || []).length;
                const whitespaceCount = (text.match(patterns.whitespace) || []).length;
                const emojiCount = (text.match(patterns.emoji) || []).length * 2;
                
                // 计算URL token
                const urlMatches = text.match(/https?:\/\/\S+/g) || [];
                const urlTokens = urlMatches.reduce((sum, url) => sum + Math.ceil(url.length / 4), 0);
                
                totalTokens += cjkChars + wordTokens + numberTokens + punctuationCount + 
                             whitespaceCount + emojiCount + urlTokens;
            }
        });
        
        // 添加系统指令开销
        const modelOverhead = 3;
        return Math.round(totalTokens + modelOverhead);
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        return function(...args) {
            const context = this;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    },

    /**
     * 处理流式响应
     * @param {Response} response - 响应对象
     * @param {Object} options - 处理选项
        * @param {Function} options.updateMessage - 更新消息内容的回调
        * @param {Function} options.updateTokenCount - 更新token使用量的回调
     * @param {Function} options.onError - 错误处理回调
     * @param {Function} options.onComplete - 完成处理回调
     * @param {boolean} options.isRegeneration - 是否为重新生成操作
     */
    async processStreamResponse(response, { updateMessage, updateTokenCount, onError, onComplete, isRegeneration = false }) {
        // 重新生成时使用更短的节流时间和更小的缓冲区
        const RENDER_THROTTLE_MS = isRegeneration ? 50 : 150; 
        const BUFFER_CHUNK_SIZE = isRegeneration ? 2 : 5;
        const MAX_RETRIES = 3;
        const TIMEOUT_DURATION = 5000;

        let retryCount = 0;
            let full_content = '';
            let full_reasonResponse = '';
        let isStreaming = true;
        let lastSuccessfulUpdate = Date.now();
        let isStopped = false;
        let lastTokenCount = 0;
        let bufferChunks = [];

        // 创建节流版的更新函数
        const throttledUpdate = this.throttle((content, thinkingContent) => {
            if (isStopped) return;
            updateMessage({
                content: content,
                thinkingContent: thinkingContent
            });
        }, RENDER_THROTTLE_MS);

        // 立即更新函数，用于重要节点（特别是重新生成时）
        const immediateUpdate = (content, thinkingContent) => {
            if (isStopped) return;
            updateMessage({
                content: content,
                thinkingContent: thinkingContent
            });
        };

        const processChunk = async (chunk) => {
            try {
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                let hasUpdate = false;
                
                for (const line of lines) {
                    if (!line.includes('data: ')) continue;
                    
                        const jsonStr = line.replace('data: ', '');
                        if (jsonStr === '[DONE]') {
                        isStreaming = false;
                            continue;
                    }

                    try {
                        const jsData = JSON.parse(jsonStr);
                        // 减少控制台输出，仅在DEBUG模式下打印
                        // console.log(jsData);
                        let contentUpdated = false;
                        
                        if (jsData.choices[0].delta.reasoning_content) {
                            //console.log("思考部分",full_reasonResponse);
                            full_reasonResponse += jsData.choices[0].delta.reasoning_content;
                            contentUpdated = true;
                        }
                        
                        if (jsData.choices[0].delta.content) {
                            full_content += jsData.choices[0].delta.content;
                            contentUpdated = true;
                        }

                        if (contentUpdated) {
                            hasUpdate = true;
                            
                            // 如果是重新生成，或者内容很短（开始阶段），则立即更新
                            if (isRegeneration || full_content.length < 50) {
                                // 减少日志输出
                               // console.log("立即更新");
                                immediateUpdate(full_content, full_reasonResponse);
                            } else {
                                // 正常情况下使用节流更新
                              //  console.log("节流更新");
                                throttledUpdate(full_content, full_reasonResponse);
                            }
                            
                            // 计算新的token数量
                            const newTokenCount = this.countTokens(full_content);
                            if (newTokenCount !== lastTokenCount) {
                                updateTokenCount({
                                    prompt_tokens: 0,
                                    completion_tokens: newTokenCount,
                                    total_tokens: newTokenCount
                                });
                                lastTokenCount = newTokenCount;
                            }

                            lastSuccessfulUpdate = Date.now();
                        }
                    } catch (e) {
                        console.warn('解析JSON失败:', e);
                        continue;
                    }
                }
                
                // 如果这个数据块有更新且是重新生成，确保界面已更新
                if (hasUpdate && isRegeneration) {
                    return true; // 告知调用者有更新
                }
                return false;
            } catch (error) {
                console.error('处理数据块失败:', error);
                throw error;
            }
        };

        const processStream = async () => {
            try {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (isStreaming) {
                    try {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            if (buffer.length > 0) {
                                await processChunk(buffer);
                            }
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        
                        // 更积极地拆分和处理数据块
                        let chunks = buffer.split('\n\n');
                        // 如果不是完整的数据块，保留最后一个
                        if (!buffer.endsWith('\n\n') && chunks.length > 1) {
                            buffer = chunks.pop();
                        } else {
                            buffer = '';
                        }

                        // 处理完整的数据块
                        for (const chunk of chunks) {
                            if (chunk.trim()) {
                                await processChunk(chunk + '\n\n');
                            }
                        }

                        // 检查超时
                        if (Date.now() - lastSuccessfulUpdate > TIMEOUT_DURATION) {
                            console.warn('流式响应超时，尝试重新连接...');
                            if (retryCount < MAX_RETRIES) {
                                retryCount++;
                                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                                continue;
                            } else {
                                throw new Error('流式响应超时');
                            }
                        }
                    } catch (error) {
                        if (retryCount < MAX_RETRIES) {
                            retryCount++;
                            console.warn(`重试第 ${retryCount} 次...`);
                            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                            continue;
                        }
                        throw error;
                }
            }
        } catch (error) {
            console.error('流处理错误:', error);
                if (onError) onError(error);
            throw error;
            } finally {
                // 确保在结束时最后一次更新内容
                if (full_content || full_reasonResponse) {
                    immediateUpdate(full_content, full_reasonResponse);
                }
                if (onComplete) onComplete();
            }
        };

        await processStream();
    },

    async processSyncResponse(response, onUpdate) {
        try {
            if (!response || !response.choices) {
                throw new Error('无效的响应格式');
            }

            const content = response.choices[0]?.message?.content || '';
            onUpdate(content);

            // 使用新的token计算方法
            const tokenCount = this.countTokens(content);
            return {
                content,
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: tokenCount,
                    total_tokens: tokenCount
                }
            };
        } catch (error) {
            console.error('同步响应处理错误:', error);
            throw error;
        }
    },

    // 集成sendMessage方法到messageHandler对象
    async sendMessage(messages, apiKey, apiEndpoint, options = {}, onUpdate = () => {}) {
        const controller = new AbortController();
        const signal = controller.signal;
        
        const {
            model = 'gpt-3.5-turbo',
            temperature = 0.7,
            max_tokens = 1000,
            stream = true
        } = options;
        
        // 检查API Key是否有效
        if (!apiKey) {
            console.error('错误: 没有提供有效的API Key');
            onUpdate('API Key未提供。请在设置中配置您的API Key。', true);
            return { success: false, error: 'No API Key provided' };
        }
        
        // 构建基本payload
        const payload = {
            model,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content || ''
            })),
            temperature,
            max_tokens,
            stream: true,  // 确保stream设置为true
            // 添加必需的字段以兼容SiliconFlow API
           // top_p: 0.7,
          //  top_k: 50,
           // n: 1,
           // frequency_penalty: 0,
           // presence_penalty: 0
        };

        // SiliconFlow API可能需要特定的模型格式
        if (apiEndpoint.includes('siliconflow.cn')) {
            // 确保模型名称是SiliconFlow支持的
            if (!model.includes('GLM') && !model.includes('THUDM') && !model.includes('Qwen')) {
                console.warn('模型可能不被SiliconFlow支持, 原始值:', model);
                // 使用安全的默认值
                payload.model = 'THUDM/GLM-4-9B-0414';
            } else {
                // SiliconFlow可能需要不同的模型格式，例如THUDM/GLM-4-9B-0414而不是GLM-4-9B-0414
                // 或者可能需要去掉THUDM/前缀
                if (model.includes('THUDM/')) {
                    // 尝试移除THUDM/前缀
                    const modelWithoutPrefix = model.replace('THUDM/', '');
                    console.log('尝试使用不带前缀的模型名:', modelWithoutPrefix);
                    payload.model = modelWithoutPrefix;
                }
            }
            
            // 调整其他参数
            delete payload.stream_options; // 移除可能导致问题的参数
            payload.stream = true; // 确保stream为true
            
            console.log('已针对SiliconFlow API调整payload:', payload);
        }

        // 删除可能导致错误的null值
        Object.keys(payload).forEach(key => {
            if (payload[key] === null) {
                delete payload[key];
            }
        });
        
        try {
            // console.log('准备发送API请求:', { 
            //     endpoint: apiEndpoint,
            //     model: model,
            //     messagesCount: messages.length,
            //     messagesExample: messages.length > 0 ? JSON.stringify(messages[0]) : 'No messages'
            // });

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // 直接使用传入的 apiKey 参数
            };
            
            console.log('请求体:', payload);

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
                signal // 添加信号用于中断
            });

            console.log('收到API响应:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorText = '';
                let errorJson = null;
                
                try {
                    // 尝试解析为JSON
                    const errorContent = await response.text();
                    console.error('API错误原始内容:', errorContent);
                    
                    try {
                        errorJson = JSON.parse(errorContent);
                        console.error('API错误JSON解析:', errorJson);
                        // 尝试找出具体缺少了哪个字段
                        if (errorJson.message && errorJson.message.includes('Field required')) {
                            console.error('可能缺少的字段:', errorJson.message);
                        }
                        errorText = errorContent;
                    } catch (e) {
                        console.error('错误内容不是有效的JSON:', e);
                        errorText = errorContent;
                    }
                } catch (e) {
                    console.error('无法读取错误响应内容:', e);
                    errorText = `Status: ${response.status}, StatusText: ${response.statusText}`;
                }
                
                throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
            }

            if (!response.body) {
                throw new Error('API响应没有可读取的流');
            }

            console.log('使用processStreamResponse处理流响应');
            
            // 使用processStreamResponse方法处理流式响应
            await this.processStreamResponse(response, {
                updateMessage: (messageData) => {
                    // 将内部的消息对象格式转换为onUpdate回调所需的参数
                    onUpdate(messageData, messageData.content !== '');
                },
                updateTokenCount: () => {}, // 如果需要可以传递
                onError: (error) => {
                    console.error('流处理错误:', error);
                },
                onComplete: () => {
                    console.log('流处理完成');
                },
                isRegeneration: false
            });
            
            return { success: true, controller };
        } catch (error) {
            // 如果是中断错误，不需要抛出异常
            if (error.name === 'AbortError') {
                console.log('请求被用户中断');
                return { success: false, aborted: true };
            }
            console.error('API请求失败:', error);
            throw error;
        }
    }
}; 