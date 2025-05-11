# 本地开发环境变量示例 (.env.local)

# 将此文件复制为 .env.local 并填入实际的值
# .env.local 文件会被 Git 忽略，不会提交到版本控制系统

# 公共配置变量（前端可访问）
# 以 VITE_ 开头的变量会在构建时被注入到前端代码中
VITE_DEFAULT_MODEL=THUDM/GLM-4-9B-0414
VITE_DEFAULT_MAX_TOKENS=1000
VITE_MODELS=THUDM/GLM-4-9B-0414:GLM-4-9B,Qwen/Qwen3-8B:Qwen3-8B

# 敏感信息（仅服务器端可访问）
# 不带 VITE_ 前缀的变量不会被注入到前端代码中
# 在本地开发时，这些变量会被 Vite 的开发服务器传递给 API 路由

# API密钥 - 用于服务器端调用AI API
API_KEY=sk-your-api-key-here

# 网站访问密码 - 如果设置，用户需要输入此密码才能访问网站
WEBSITE_CODE=your-access-password-here

# 注意：本地开发时，需要重启开发服务器才能使环境变量生效 