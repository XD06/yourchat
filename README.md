# MyChat - Vue.js AI Chat Application

MyChat 是一个基于 Vue.js 的AI聊天应用程序，支持多种大型语言模型，并提供自定义API设置、暗黑模式和移动端适配等功能。

<p align="center">
  <img src="public/logo.svg" alt="MyChat Logo" width="180" />
</p>

## 功能特点

- 🤖 支持多种AI语言模型 (openai及其兼容等)
- 🌓 支持黑暗模式 / 明亮模式
- 📱 完全响应式设计，移动端友好
- 🔑 安全的API密钥处理，支持环境变量或自定义值
- 🌊 流式响应支持
- 💬 聊天消息管理
- markdown渲染，代码块高亮
- 🎭 内置AI角色选择
- 📊 Token用量统计

## 快速开始

### 环境要求

- Node.js 16+ 

### 安装与运行

1. 克隆仓库

```bash
git clone https://github.com/XD06/mychat.git
cd mychat
```

2. 安装依赖

```bash
npm install
```

3. 设置环境变量 (可选)

创建 `.env.local` 文件在项目根目录，添加以下内容:

```
VITE_API_KEY=your_api_key_here
VITE_API_URL=https://api.openai.com/v1/chat/completions
VITE_DEFAULT_MODEL=gpt-3.5-turbo
```

4. 启动开发服务器

```bash
npm run dev
```

5. 构建生产版本

```bash
npm run build
```

## 部署

### Vercel 部署

1. Fork 本仓库或将代码推送到您自己的GitHub仓库

2. 在 Vercel 中导入您的GitHub项目

3. 配置环境变量 (可选)
   - `VITE_API_KEY`
   - `VITE_API_URL`
   - `VITE_DEFAULT_MODEL`

4. 部署!

## 环境变量说明

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| VITE_API_KEY | API密钥 | - |
| VITE_API_URL | API端点 | https://api.openai.com/v1/chat/completions |
| VITE_DEFAULT_MODEL | 默认模型 | THUDM/GLM-4-9B-0414 |
| VITE_MODELS | 可用模型列表,格式:`model1:显示名1,model2:显示名2` | - |

## 贡献指南

欢迎贡献代码、报告问题或提出建议!

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个Pull Request

## 许可证

MIT License

## 相关
- [AIchat](https://github.com/wjc7jx/AIchat)
- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [OpenAI API](https://openai.com/)

