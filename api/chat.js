// 处理 AI 聊天请求的 API 路由
export default async function handler(req, res) {
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许 POST 请求' });
  }

  try {
    const apiKey = process.env.API_KEY; // 从环境变量获取 API 密钥
    const apiUrl = process.env.API_URL || 'https://api.openai.com/v1/chat/completions'; // 从环境变量获取 API URL
    const { model, messages, temperature, max_tokens } = req.body;
    
    // 检查是否有API密钥
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API_KEY 未配置', 
        needsApiKey: true,
        message: '请在服务器环境变量中配置有效的 API_KEY'
      });
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