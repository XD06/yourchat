# YourChat

一个现代化的AI聊天应用，基于Vue 3构建，支持多种模型和丰富的Markdown渲染功能。

<!-- 待添加应用截图 -->

## ✨ 主要特性

- 🚀 **流式响应** - 实时展示AI回复，支持打字机效果
- 📝 **Markdown支持** - 完整渲染Markdown，包括代码高亮
- 📊 **图表生成** - 内置Mermaid支持，可视化各类图表
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🌓 **深色/浅色模式** - 自动或手动切换主题
- 🧮 **数学公式** - 通过KaTeX支持数学公式渲染
- 💾 **会话管理** - 保存、导出和恢复聊天历史
- 🔌 **多模型支持** - 兼容各种AI模型API
- ⚙️ **自定义配置** - 灵活设置API密钥和端点

## 🛠️ 技术栈

- **前端框架**: Vue 3, Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **Markdown渲染**: markdown-it
- **代码高亮**: highlight.js
- **数学公式**: KaTeX
- **图表**: Mermaid

## 📦 安装与使用

### 环境要求

- Node.js 16+
- npm 或 yarn

### 快速开始

1. 克隆仓库
```bash
git clone https://github.com/XD06/yourchat.git
cd yourchat
```

2. 安装依赖
```bash
npm install
# 或
yarn
```

3. 配置环境变量
```bash
# 创建.env文件
cp .env.example .env
# 编辑.env文件，添加你的API密钥
```

4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

5. 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 🔧 配置选项

YourChat支持多种配置选项，可以通过设置界面进行调整：

- **API提供商**: 支持OpenAI、Anthropic等多种API
- **模型选择**: 可选择不同的AI模型
- **温度参数**: 控制AI响应的创造性
- **最大令牌数**: 设置响应长度限制
- **自定义模型**: 添加自定义模型支持

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 详情请参阅[LICENSE](LICENSE)文件

## 📬 联系方式

项目链接: [https://github.com/XD06/yourchat](https://github.com/XD06/yourchat)

