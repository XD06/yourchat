# MyChat - Vue.js AI Chat Application

MyChat 是一个基于 Vue.js 的AI聊天应用程序，支持多种大型语言模型，并提供自定义API设置、暗黑模式和移动端适配等功能。

<p align="center">
  <img src="public/logo.svg" alt="MyChat Logo" width="180" />
</p>

## 功能特点

- 🤖 支持多种AI语言模型 (OpenAI及其兼容模型等)
- 🌓 优雅的黑暗模式 / 明亮模式切换
- 📱 完全响应式设计，移动端友好
- 🎨 时尚现代的用户界面，符合最新设计趋势
- 🔑 安全的API密钥处理，支持环境变量或自定义值
- 🌊 实时流式响应支持，体验流畅
- 💬 高效的聊天消息管理
- 📝 完整的Markdown渲染，代码块高亮
- 🎭 内置AI角色选择
- 📊 Token用量统计
- 💾 本地历史记录保存和恢复

## 界面特色

- 现代化且用户友好的UI设计
- 实时显示会话状态和统计信息
- 优化的消息布局，桌面端和移动端均有良好体验
- 流畅的动画和交互效果
- 精美的图标和视觉反馈

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

### Netlify 部署

1. 在 Netlify 中导入您的GitHub项目

2. 构建设置:
   - 构建命令: `npm run build`
   - 构建输出目录: `dist`

3. 配置环境变量同上

## 环境变量说明

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| VITE_API_KEY | API密钥 | - |
| VITE_API_URL | API端点 | https://api.openai.com/v1/chat/completions |
| VITE_DEFAULT_MODEL | 默认模型 | THUDM/GLM-4-9B-0414 |
| VITE_MODELS | 可用模型列表,格式:`model1:显示名1,model2:显示名2` | - |

## 最近更新

- 优化了聊天界面头部设计，增加了会话统计和状态指示
- 改进了消息布局，使桌面端聊天更加居中
- 添加了动态脉动效果，提升视觉体验
- 优化了暗黑模式的整体视觉效果

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

