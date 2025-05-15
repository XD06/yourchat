# Netlify Functions 目录

这个目录包含 Netlify Serverless Functions，用于处理需要在服务器端执行的操作。

## 功能列表

- `chat.js` - 处理 AI 聊天请求，支持流式输出
- `models.js` - 获取可用的 AI 模型列表
- `verify-code.js` - 验证网站访问密码

## 环境变量

这些函数需要以下环境变量：

- `API_KEY` - 你的 OpenAI API 密钥
- `API_URL` (可选) - 自定义 API 端点，默认为 OpenAI 的端点
- `WEBSITE_CODE` (可选) - 网站访问密码

## 注意事项

- 这些函数使用原生 Node.js `https` 模块发送请求，避免 ES Module 兼容性问题
- 函数支持流式响应，适用于 OpenAI 的 Stream API
- 错误处理已经过优化，提供详细的错误消息
- Netlify Functions 使用 CommonJS 模块系统，确保 exports 语法正确 