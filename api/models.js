// 获取可用模型列表的 API 路由
export default async function handler(req, res) {
  // 只接受 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只允许 GET 请求' });
  }

  try {
    const apiKey = process.env.API_KEY; // 从环境变量获取 API 密钥
    const apiUrl = process.env.API_URL || 'https://api.openai.com/v1';

    // 检查是否有API密钥
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API_KEY 未配置', 
        needsApiKey: true,
        message: '请在服务器环境变量中配置有效的 API_KEY'
      });
    }
    
    // 构建模型列表 API URL
    const modelUrl = `${apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl}`;
    const modelsEndpoint = `${modelUrl}/models`;
    
    // 调用外部 API 获取模型列表
    const response = await fetch(modelsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const data = await response.json();
    
    // 如果 API 返回错误，原样返回给客户端，包含状态码
    if (!response.ok) {
      return res.status(response.status).json({
        ...data,
        statusCode: response.status,
        apiUrl: modelsEndpoint
      });
    }
    
    // 检查响应格式，提取模型 ID
    if (!data || !data.data || !Array.isArray(data.data)) {
      return res.status(500).json({
        error: 'API 响应格式无效',
        message: '无法从 API 响应中提取模型列表',
        rawData: process.env.NODE_ENV === 'development' ? data : undefined
      });
    }
    
    // 提取模型 ID 并排序
    const models = data.data.map(model => model.id).sort();
    
    return res.status(200).json({
      models,
      source: 'backend-api',
      endpoint: modelsEndpoint
    });
  } catch (error) {
    console.error('获取模型列表错误:', error);
    return res.status(500).json({ 
      error: '服务器错误', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 