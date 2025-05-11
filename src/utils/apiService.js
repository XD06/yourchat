// API 服务工具函数

/**
 * 获取当前环境的 API 基础 URL
 * @returns {string} API 基础 URL
 */
const getApiBaseUrl = () => {
  // 检测当前部署环境
  if (window.location.hostname.includes('netlify.app')) {
    return '/.netlify/functions';
  }
  // 默认为 Vercel 或本地开发环境
  return '/api';
};

/**
 * 验证访问密码
 * @param {string} code 用户输入的密码
 * @returns {Promise<{valid: boolean}>} 验证结果
 */
export const verifyAccessCode = async (code) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    return await response.json();
  } catch (error) {
    console.error('验证密码错误:', error);
    return { valid: false, error: error.message };
  }
};

/**
 * 发送聊天消息到 AI API
 * @param {Array} messages 消息数组
 * @param {string} model 模型名称
 * @param {number} temperature 温度参数
 * @param {number} maxTokens 最大 token 数量
 * @returns {Promise<Object>} API 响应
 */
export const sendChatMessage = async (messages, model, temperature, maxTokens) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens: maxTokens
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('发送消息错误:', error);
    throw error;
  }
}; 