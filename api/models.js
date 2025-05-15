// 获取可用模型列表的 API 路由
import https from 'https';

// 自定义 fetch 函数，使用原生 https 模块
const customFetch = (url, options) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = https.request(requestOptions, (res) => {
      let data = '';
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
    
    // 调用外部 API 获取模型列表 (使用自定义 fetch)
    const response = await customFetch(modelsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
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
      source: 'backend-api-vercel',
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