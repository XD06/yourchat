// 处理 AI 聊天请求的 Netlify 函数
let fetch;

export const handler = async function(event, context) {
  // 动态导入 node-fetch
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }
  
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
    
    // 调用外部 API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
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