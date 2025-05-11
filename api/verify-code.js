// 验证访问密码的 API 路由
export default function handler(req, res) {
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许 POST 请求' });
  }

  const { code } = req.body;
  const websiteCode = process.env.WEBSITE_CODE; // 从环境变量获取密码
  
  // 验证访问码
  if (code === websiteCode) {
    return res.status(200).json({ valid: true });
  }
  
  // 密码错误
  return res.status(200).json({ valid: false });
} 