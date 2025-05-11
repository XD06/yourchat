import { promptTemplates } from '../config/promptTemplates'

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
        // 使用更短的输出间隔确保平滑体验，调整到更平衡的值
        const CHAR_OUTPUT_INTERVAL = 1; // 减少到1ms，加快初始输出速度
        const MAX_RETRIES = 3;
        const TIMEOUT_DURATION = 5000;
        
        // 添加调试变量
        let totalCharsReceived = 0;
        let totalCharsOutput = 0;
        let lastLogTime = Date.now();
        let isEndingStream = false;

        // 添加代码块和图表检测变量
        const CODE_BLOCK_START = "```";
        const CODE_BLOCK_END = "```";
        const MERMAID_START = "```mermaid";
        let inCodeBlock = false;
        let codeBlockBuffer = "";
        let currentCodeLang = "";
        let codeBlocksReceived = 0;
        let mermaidBlocksReceived = 0;

        let retryCount = 0;
            let full_content = '';
            let full_reasonResponse = '';
        let isStreaming = true;
        let lastSuccessfulUpdate = Date.now();
        let isStopped = false;
        let lastTokenCount = 0;
        
        // 创建字符缓冲区，用于平滑输出
        let charBuffer = [];
        let isOutputtingChars = false;
        
        // 创建计时器id，用于在需要时清除
        let outputTimerId = null;
        
        // 监控输出状态
        let lastOutputLength = 0;
        let outputStallCount = 0;
        
        // 检测并处理特殊内容的辅助函数
        const checkForSpecialContent = (char) => {
            // 检测是否处于代码块中
            if (!inCodeBlock && charBuffer.join('').endsWith(CODE_BLOCK_START)) {
                // 检测到代码块开始
                inCodeBlock = true;
                currentCodeLang = "";
                codeBlockBuffer = CODE_BLOCK_START;
                console.log("检测到代码块开始");
            } else if (inCodeBlock) {
                codeBlockBuffer += char;

                // 检测语言类型
                if (codeBlockBuffer.length === 4 && codeBlockBuffer === "```m") {
                    console.log("可能是mermaid图表");
                }
                
                // 检测代码块结束
                if (codeBlockBuffer.endsWith(CODE_BLOCK_END) && 
                    // 确保不是只有开始标记
                    codeBlockBuffer.length > (CODE_BLOCK_START.length + CODE_BLOCK_END.length)) {
                    inCodeBlock = false;
                    
                    // 检查是否是mermaid图表
                    if (codeBlockBuffer.startsWith(MERMAID_START)) {
                        mermaidBlocksReceived++;
                        console.log(`检测到完整的mermaid图表，当前共${mermaidBlocksReceived}个`);
                    } else {
                        codeBlocksReceived++;
                        console.log(`检测到完整的代码块，当前共${codeBlocksReceived}个`);
                    }
                    
                    codeBlockBuffer = "";
                    currentCodeLang = "";
                }
            }
        };
        
        // 输出字符的核心函数，一个字符一个字符地输出
        const outputBufferedChars = () => {
            if (charBuffer.length === 0 || isOutputtingChars || isStopped) return;
            
            isOutputtingChars = true;
            
            // 清除任何现有的定时器
            if (outputTimerId) {
                clearInterval(outputTimerId);
            }
            
            // 定期输出状态日志
            const logStatus = () => {
                const now = Date.now();
                if (now - lastLogTime > 2000) { // 每2秒记录一次
                    console.log(`输出状态: 缓冲区大小=${charBuffer.length}, 已输出=${totalCharsOutput}/${totalCharsReceived} 字符, 代码块=${codeBlocksReceived}, 图表=${mermaidBlocksReceived}`);
                    lastLogTime = now;
                }
            };
            
            outputTimerId = setInterval(() => {
                if (charBuffer.length === 0) {
                    // 如果这是流的结束，并且我们已经清空了缓冲区
                    if (isEndingStream) {
                        console.log(`输出完成: 共输出 ${totalCharsOutput} 个字符, 包含 ${codeBlocksReceived} 个代码块和 ${mermaidBlocksReceived} 个图表`);
                    }
                    
                    clearInterval(outputTimerId);
                    isOutputtingChars = false;
                    return;
                }
                
                if (isStopped) {
                    console.log('输出被手动终止');
                    clearInterval(outputTimerId);
                    isOutputtingChars = false;
                    return;
                }
                
                // 一次处理多个字符，根据缓冲区大小动态调整
                const batchSize = Math.min(
                    // 如果缓冲区很大，一次处理更多字符
                    charBuffer.length > 500 ? 10 : 
                    charBuffer.length > 200 ? 5 : 
                    charBuffer.length > 50 ? 3 : 1,
                    charBuffer.length // 确保不超过缓冲区大小
                );
                
                let batchContent = '';
                for (let i = 0; i < batchSize; i++) {
                    const char = charBuffer.shift();
                    batchContent += char;
                    // 检查特殊内容
                    checkForSpecialContent(char);
                }
                
                full_content += batchContent;
                totalCharsOutput += batchContent.length;
                
                // 将当前内容更新到UI
                updateMessage({
                    content: full_content,
                    thinkingContent: full_reasonResponse
                });
                
                // 监控是否存在停滞
                if (full_content.length === lastOutputLength) {
                    outputStallCount++;
                    
                    // 如果检测到输出停滞，自动释放一批字符（更积极地释放）
                    if (outputStallCount > 3 && charBuffer.length > 0) {
                        console.log(`检测到输出停滞，释放一批字符 (${Math.min(20, charBuffer.length)}个)`);
                        const batchSize = Math.min(20, charBuffer.length);
                        const batch = charBuffer.splice(0, batchSize).join('');
                        
                        // 在释放批次字符前，检查它们是否含有代码块或图表的开始/结束标记
                        let tempContent = full_content;
                        for (let i = 0; i < batch.length; i++) {
                            tempContent += batch[i];
                            checkForSpecialContent(batch[i]);
                        }
                        
                        full_content = tempContent;
                        totalCharsOutput += batch.length;
                        
                        updateMessage({
                            content: full_content,
                            thinkingContent: full_reasonResponse
                        });
                        
                        outputStallCount = 0;
                    }
                } else {
                    lastOutputLength = full_content.length;
                    outputStallCount = 0;
                }
                
                // 记录状态
                logStatus();
                
            }, CHAR_OUTPUT_INTERVAL); // 使用更短的间隔加快输出速度
        };

        // 添加刷新缓冲区的函数，确保缓冲区不会太大
        const flushBufferIfNeeded = () => {
            // 如果缓冲区超过特定大小，强制开始输出
            if (charBuffer.length > 100 && !isOutputtingChars) {
                console.log(`缓冲区达到阈值(${charBuffer.length}个字符)，开始输出`);
                outputBufferedChars();
            } else if (charBuffer.length > 1000) {
                // 如果缓冲区非常大，释放一半以避免内存问题
                console.log(`缓冲区极大(${charBuffer.length}个字符)，释放一半`);
                const releaseCount = Math.floor(charBuffer.length / 2);
                const releasedChars = charBuffer.splice(0, releaseCount).join('');
                full_content += releasedChars;
                totalCharsOutput += releasedChars.length;
                
                updateMessage({
                    content: full_content,
                    thinkingContent: full_reasonResponse
                });
            }
        };

        // 全部内容更新函数（仅在结束时使用）
        const immediateFullUpdate = (content, thinkingContent) => {
            if (isStopped) return;
            
            // 强制清除所有定时器
            if (outputTimerId) {
                clearInterval(outputTimerId);
                outputTimerId = null;
            }
            
            console.log(`强制最终更新: 内容长度=${content.length}, 缓冲区=${charBuffer.length}`);
            
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
                        console.log('收到流结束标记 [DONE]');
                        isStreaming = false;
                        isEndingStream = true;
                            continue;
                    }

                    try {
                        const jsData = JSON.parse(jsonStr);
                        let contentUpdated = false;
                        
                        if (jsData.choices[0].delta.reasoning_content) {
                            // 修改：将思考内容也添加到字符缓冲区，实现逐字显示
                            const newThinkingContent = jsData.choices[0].delta.reasoning_content;
                            
                            // 将新的思考内容添加到全局变量，用于最终更新
                            full_reasonResponse += newThinkingContent;
                            
                            // 同样每次更新UI，实现逐字显示
                            updateMessage({
                                content: full_content,
                                thinkingContent: full_reasonResponse
                            });
                            
                            contentUpdated = true;
                        }
                        
                        if (jsData.choices[0].delta.content) {
                            const newContent = jsData.choices[0].delta.content;
                            totalCharsReceived += newContent.length;
                            
                            // 将每个字符添加到缓冲区
                            for (let i = 0; i < newContent.length; i++) {
                                charBuffer.push(newContent[i]);
                            }
                            
                            // 如果没有正在输出，则开始输出字符
                            if (!isOutputtingChars) {
                                outputBufferedChars();
                            }
                            
                            // 定期检查缓冲区是否需要刷新
                            flushBufferIfNeeded();
                            
                            contentUpdated = true;
                        }

                        if (contentUpdated) {
                            hasUpdate = true;
                            
                            // 计算token数量（包括将要显示的内容）
                            const newTokenCount = this.countTokens(full_content + charBuffer.join(''));
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
                
                return hasUpdate;
            } catch (error) {
                console.error('处理数据块失败:', error);
                throw error;
            }
        };

        const processStream = async () => {
            console.log('开始处理流式响应');
            try {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (isStreaming) {
                    try {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            console.log('读取器报告流已结束');
                            if (buffer.length > 0) {
                                await processChunk(buffer);
                            }
                            
                            // 在流结束时刷新所有缓冲区字符
                            isEndingStream = true;
                            console.log(`流结束，剩余 ${charBuffer.length} 个字符在缓冲区`);
                            
                            if (outputTimerId) {
                                clearInterval(outputTimerId);
                                outputTimerId = null;
                            }
                            
                            // 确保所有缓冲区字符都添加到最终输出中
                            if (charBuffer.length > 0) {
                                console.log(`将剩余的 ${charBuffer.length} 个字符添加到最终输出`);
                                full_content += charBuffer.join('');
                                totalCharsOutput += charBuffer.length;
                                charBuffer = [];
                            }
                            
                            // 最终更新以确保显示完整内容
                            immediateFullUpdate(full_content, full_reasonResponse);
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        
                        // 使用更保守的分块方法
                        const chunks = [];
                        let startIdx = 0;
                        let endIdx;
                        
                        while ((endIdx = buffer.indexOf('\n\n', startIdx)) !== -1) {
                            chunks.push(buffer.substring(startIdx, endIdx + 2));
                            startIdx = endIdx + 2;
                        }
                        
                        if (startIdx < buffer.length) {
                            buffer = buffer.substring(startIdx);
                        } else {
                            buffer = '';
                        }

                        for (const chunk of chunks) {
                            if (chunk.trim()) {
                                await processChunk(chunk);
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
                // 清理所有定时器
                if (outputTimerId) {
                    clearInterval(outputTimerId);
                    outputTimerId = null;
                }
                
                // 确保缓冲区中的任何剩余字符都被添加到输出中
                if (charBuffer.length > 0) {
                    console.log(`在finally块中处理剩余的 ${charBuffer.length} 个字符`);
                    full_content += charBuffer.join('');
                    totalCharsOutput += charBuffer.length;
                    charBuffer = [];
                }
                
                // 更新最终内容
                if (full_content) {
                    immediateFullUpdate(full_content, full_reasonResponse);
                }
                
                console.log(`流处理完成: 共收到 ${totalCharsReceived} 个字符，输出 ${totalCharsOutput} 个字符`);
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

    // 发送消息到API，支持流式和同步响应
    async sendMessage(messages, apiKey, apiEndpoint, apiOptions, onUpdate, isRegeneration = false) {
        const controller = new AbortController();
        const signal = controller.signal;
        
        const {
            model = 'gpt-3.5-turbo',
            temperature = 0.7,
            max_tokens = 1000,
            stream = true
        } = apiOptions;
        
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
    },

    /**
     * 优化用户的提示词
     * @param {string} promptText - 需要优化的提示词文本
     * @param {string} apiKey - API密钥
     * @param {string} apiEndpoint - API端点URL
     * @param {Object} apiOptions - API选项（模型、温度等）
     * @returns {Promise<Object>} - 返回包含优化后内容的对象
     */    
    optimizePrompt: async function(promptText, apiKey, apiEndpoint, apiOptions) {
        try {
            if (!promptText || !apiKey) {
                throw new Error('缺少必要参数');
            }

            // 使用较低的温度以获得更可靠的结果
            const options = {
                ...apiOptions,
                temperature: 0.5,
                stream: false  // 不使用流式响应
            };

            // 准备请求体 - 提示词本身已经包含了指令，不需要额外的系统消息
            const requestBody = {
                model: options.model,
                messages: [
                    {
                        role: 'system',
                        content: promptTemplates.optimizer
                    },
                    {
                        role: 'user',
                        content: promptText
                    }
                ],
                temperature: options.temperature,
                max_tokens: options.max_tokens || 2000,
                top_p: options.top_p || 1,
                frequency_penalty: 0,
                presence_penalty: 0
            };

            // 发送请求
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            console.log('提示词优化请求体:', requestBody);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            }

            const data = await response.json();
            
            if (!data.choices || data.choices.length === 0) {
                throw new Error('API返回无效响应');
            }

            return {
                content: data.choices[0].message.content,
                success: true
            };
        } catch (error) {
            console.error('提示词优化失败:', error);
            throw error;
        }
    },

    // 添加一个新方法，使用后端 API 发送消息
    async sendMessageViaBackend(messages, apiOptions, onUpdate, isRegeneration = false) {
        const controller = new AbortController();
        const signal = controller.signal;
        
        const {
            model = 'gpt-3.5-turbo',
            temperature = 0.7,
            max_tokens = 1000,
            stream = true
        } = apiOptions;
        
        // 构建基本payload
        const payload = {
            model,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content || ''
            })),
            temperature,
            max_tokens
        };
        
        // 删除可能导致错误的null值
        Object.keys(payload).forEach(key => {
            if (payload[key] === null) {
                delete payload[key];
            }
        });
        
        try {
            // 获取当前环境的 API 基础 URL
            const apiBaseUrl = window.location.hostname.includes('netlify.app') 
                ? '/.netlify/functions/chat'
                : '/api/chat';
            
            console.log('准备发送后端 API 请求:', { 
                endpoint: apiBaseUrl,
                model: model,
                messagesCount: messages.length
            });

            const headers = {
                'Content-Type': 'application/json'
            };
            
            console.log('请求体:', payload);

            const response = await fetch(apiBaseUrl, {
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

            // 处理 API 响应
            const data = await response.json();
            
            // 提取 AI 回复内容
            const aiReply = data.choices && data.choices[0] && data.choices[0].message 
                ? data.choices[0].message.content 
                : '无法获取回复内容';
            
            // 调用回调函数更新消息
            onUpdate(aiReply, true);
            
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
    },

    // 集成sendMessage方法到messageHandler对象
}; 