// 获取可用模型列表的 Netlify 函数
const https = require('https');

// 使用原生 https 模块创建请求，避免使用 node-fetch
const makeRequest = (url, options) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.setEncoding('utf-8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: () => Promise.resolve(parsedData) });
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

// 使用 CommonJS 导出
exports.handler = async function(event, context) {
  // 只接受 GET 请求
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: '只允许 GET 请求' }) 
    };
  }

  try {
    const apiKey = process.env.API_KEY; // 从环境变量获取 API 密钥
    const apiUrl = process.env.API_URL || 'https://api.openai.com/v1';

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
    
    // 构建模型列表 API URL
    const modelUrl = `${apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl}`;
    const modelsEndpoint = `${modelUrl}/models`;
    
    // 使用URL对象解析endpoint
    const url = new URL(modelsEndpoint);
    
    // 调用外部 API 获取模型列表 (使用 https 模块)
    const response = await makeRequest(modelsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // 如果 API 返回错误，原样返回给客户端，包含状态码
    if (!response.ok) {
      return { 
        statusCode: response.status, 
        body: JSON.stringify({
          ...data,
          statusCode: response.status,
          apiUrl: modelsEndpoint
        }) 
      };
    }
    
    // 检查响应格式，提取模型 ID
    if (!data || !data.data || !Array.isArray(data.data)) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({
          error: 'API 响应格式无效',
          message: '无法从 API 响应中提取模型列表',
          rawData: process.env.NODE_ENV === 'development' ? data : undefined
        }) 
      };
    }
    
    // 提取模型 ID 并排序
    const models = data.data.map(model => model.id).sort();
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({
        models,
        source: 'backend-api-netlify',
        endpoint: modelsEndpoint
      }) 
    };
  } catch (error) {
    console.error('获取模型列表错误:', error);
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