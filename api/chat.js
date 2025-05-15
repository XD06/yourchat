// 处理 AI 聊天请求的 API 路由
import https from 'https';

// 自定义 fetch 函数，使用原生 https 模块，支持流式输出
const customFetch = (url, options, onChunk = null) => {
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
                text: () => Promise.resolve(data)
              });
            } else {
              resolve({ 
                ok: res.statusCode >= 200 && res.statusCode < 300, 
                status: res.statusCode, 
                statusText: res.statusMessage,
                json: () => Promise.resolve({}),
                text: () => Promise.resolve('')
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

// 处理流式响应的特殊函数
const handleStreamRequest = async (req, res, apiKey, apiUrl) => {
  // 创建支持流式输出的响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  // 确保请求体包含 stream: true
  const payload = {
    ...req.body,
    stream: true
  };
  
  // 向客户端发送一部分数据
  const forwardChunk = (chunk, isDone) => {
    if (isDone) {
      res.end();
      return;
    }
    
    try {
      res.write(chunk);
    } catch (err) {
      console.error('写入响应流出错:', err);
      res.end();
    }
  };
  
  try {
    // 使用支持流的自定义 fetch
    await customFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      isStream: true
    }, forwardChunk);
  } catch (error) {
    console.error('流式请求处理错误:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: '服务器错误',
        message: error.message
      });
    } else {
      res.end(`data: ${JSON.stringify({error: error.message})}\n\n`);
    }
  }
};

export default async function handler(req, res) {
  // 检查请求路径，如果是流式请求则使用特殊处理
  const isStreamRequest = req.url.includes('/chat-stream') || (req.body && req.body.stream === true);
  
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许 POST 请求' });
  }

  try {
    const apiKey = process.env.API_KEY; // 从环境变量获取 API 密钥
    const apiUrl = process.env.API_URL || 'https://api.openai.com/v1/chat/completions'; // 从环境变量获取 API URL
    
    // 检查是否有API密钥
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API_KEY 未配置', 
        needsApiKey: true,
        message: '请在服务器环境变量中配置有效的 API_KEY'
      });
    }
    
    // 如果是流式请求，使用特殊的流处理
    if (isStreamRequest) {
      return handleStreamRequest(req, res, apiKey, apiUrl);
    }
    
    // 非流式请求的常规处理
    const { model, messages, temperature, max_tokens } = req.body;
    
    // 使用自定义 fetch 函数调用外部 API
    const response = await customFetch(apiUrl, {
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
        stream: false
      })
    });
    
    const data = await response.json();
    
    // 如果 API 返回错误，原样返回给客户端，包含状态码
    if (!response.ok) {
      return res.status(response.status).json({
        ...data,
        statusCode: response.status,
        apiUrl: apiUrl // 在调试时方便检查使用的是哪个API端点
      });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('API 调用错误:', error);
    return res.status(500).json({ 
      error: '服务器错误', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 