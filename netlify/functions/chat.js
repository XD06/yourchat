// 处理 AI 聊天请求的 Netlify 函数
const https = require('https');

// 使用原生 https 模块创建请求，支持流式响应
const makeRequest = (url, options, onChunk = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = https.request(requestOptions, (res) => {
      // 如果提供了 onChunk 回调并且请求设置了流式响应，则使用流处理
      if (onChunk && options.isStream) {
        // 创建一个支持流式响应的对象
        const streamResponse = {
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: {
            getReader() {
              let isCancelled = false;
              return {
                read() {
                  return new Promise((resolve) => {
                    if (isCancelled) {
                      resolve({ done: true, value: undefined });
                      return;
                    }
                    
                    // 流已结束的标志将通过 onChunk 回调处理
                    // 这里只需返回一个空值以继续流处理循环
                    resolve({ done: false, value: new Uint8Array(0) });
                  });
                },
                cancel() {
                  isCancelled = true;
                  return Promise.resolve();
                }
              };
            }
          }
        };
        
        // 设置响应编码为 utf-8，避免乱码
        res.setEncoding('utf-8');
        
        // 处理数据块
        res.on('data', (chunk) => {
          // 将数据传递给回调
          onChunk(chunk, false);
        });
        
        // 处理结束
        res.on('end', () => {
          // 通知流已结束
          onChunk('[DONE]', true);
          resolve(streamResponse);
        });
        
        // 处理错误
        res.on('error', (err) => {
          reject(err);
        });
      } else {
        // 非流式响应的常规处理
        let data = '';
        
        // 设置响应编码为 utf-8，避免乱码
        res.setEncoding('utf-8');
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (data) {
              const parsedData = JSON.parse(data);
              resolve({ 
                ok: res.statusCode >= 200 && res.statusCode < 300, 
                status: res.statusCode, 
                statusText: res.statusMessage,
                json: () => Promise.resolve(parsedData),
                text: () => Promise.resolve(data),
                headers: res.headers
              });
            } else {
              resolve({ 
                ok: res.statusCode >= 200 && res.statusCode < 300, 
                status: res.statusCode, 
                statusText: res.statusMessage,
                json: () => Promise.resolve({}),
                text: () => Promise.resolve(''),
                headers: res.headers
              });
            }
          } catch (e) {
            reject(new Error(`解析响应失败: ${e.message}`));
          }
        });
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
};

// 使用 CommonJS 导出
exports.handler = async function(event, context) {
  // 检查请求路径，如果有特定的流处理路径则设置流式响应标志
  const isStreamRequest = event.rawUrl && event.rawUrl.includes('/chat-stream');
  
  // 只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: '只允许 POST 请求' }) 
    };
  }

  try {
    const apiKey = process.env.API_KEY;
    const apiUrl = process.env.API_URL || 'https://api.openai.com/v1/chat/completions';
    const body = JSON.parse(event.body);
    const { model, messages, temperature, max_tokens } = body;
    
    // 检查是否有API密钥
    if (!apiKey) {
      return { 
        statusCode: 401, 
        body: JSON.stringify({ 
          error: 'API_KEY 未配置', 
          needsApiKey: true,
          message: '请在服务器环境变量中配置有效的 API_KEY'
        }) 
      };
    }

    // 如果是流式请求，使用特殊的响应处理
    if (isStreamRequest || body.stream === true) {
      // 流式响应的负载中必须包含 stream: true
      const streamPayload = {
        model,
        messages,
        temperature,
        max_tokens,
        stream: true
      };
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        body: await new Promise((resolve, reject) => {
          let responseText = '';
          
          makeRequest(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(streamPayload),
            isStream: true
          }, (chunk, isDone) => {
            if (isDone) {
              // 流结束，返回完整响应
              resolve(responseText);
            } else {
              // 累积响应文本
              responseText += chunk;
            }
          }).catch(err => {
            reject(err);
          });
        })
      };
    }
    
    // 非流式请求的常规处理
    const response = await makeRequest(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: false // 确保非流式请求
      })
    });
    
    const data = await response.json();
    
    // 如果 API 返回错误，原样返回给客户端
    if (!response.ok) {
      return { 
        statusCode: response.status, 
        body: JSON.stringify({
          ...data,
          statusCode: response.status,
          apiUrl: apiUrl // 在调试时方便检查使用的是哪个API端点
        }) 
      };
    }
    
    return { 
      statusCode: 200, 
      body: JSON.stringify(data) 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: '服务器错误', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }) 
    };
  }
}; 