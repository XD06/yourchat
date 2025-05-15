# YourChat

简洁、强大的AI聊天应用，支持多种模型和丰富的内容渲染功能。

<!-- 待添加应用截图 -->

## ✨ 核心功能

### 💬 聊天体验

- 🚀 **流式响应** - 实时展示AI回复，支持打字机效果
- ⚡ **快速响应** - 减少首字符显示时间，提升交互体验
- ⏸️ **生成控制** - 随时暂停和继续AI响应生成
- 🔄 **重新生成** - 一键重新生成AI回复
- 📱 **全设备适配** - 完美支持桌面和移动设备

### 📊 内容展示

- 📝 **完整Markdown** - 支持各种Markdown语法元素
- 🎨 **代码高亮** - 多种编程语言的语法高亮
- 📊 **图表可视化** - 支持Mermaid图表（流程图、时序图、饼图等）
- 🧮 **数学公式** - 优雅渲染行内和块级数学公式
- 📋 **表格增强** - 美观的表格样式与响应式设计
- ℹ️ **提示框** - 支持info、warning、error等提示样式
- 🌓 **双主题模式** - 自动或手动切换深色/浅色主题

### 💾 数据管理

- 📚 **会话历史** - 自动保存聊天记录，随时恢复
- 📤 **多格式导出** - 支持Markdown、HTML、TXT和JSON格式导出
- 📥 **会话导入** - 从文件导入历史会话

### ⚙️ 高级设置

- 🔌 **多模型支持** - 兼容OpenAI、Anthropic等多种API
- 🧩 **自定义模型** - 添加自定义模型到下拉菜单
- 🎛️ **参数调整** - 灵活设置温度、最大令牌数等参数
- 🔑 **API管理** - 安全配置API密钥和端点
- 👤 **角色系统** - 设置AI角色和系统提示词

## 📦 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/XD06/yourchat.git
cd yourchat
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
# 查看环境变量配置示例
cat ENV-EXAMPLE.md

# 创建本地环境变量文件
touch .env.local
# 编辑.env.local文件，添加你的API密钥和其他配置
```

> **重要安全说明**：敏感信息（如API密钥和访问密码）不应使用 `VITE_` 前缀，以防止它们被打包到前端代码中。详细说明请参阅 `ENV-EXAMPLE.md` 文件。

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

### 使用 Docker

本项目支持使用 Docker 进行部署，提供了多容器设置的 Docker Compose 配置。

#### 前提条件

- [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/) 已安装

#### 使用 Docker Compose 部署

1. 构建并启动容器：

```bash
docker-compose up -d
```

2. 应用将在 http://localhost:3000 上运行

3. 停止容器：

```bash
docker-compose down
```

#### 仅使用 Docker 部署

1. 构建 Docker 镜像：

```bash
docker build -t yourchat .
```

2. 运行容器：

```bash
docker run -d -p 3000:80 --name yourchat-app yourchat
```

3. 应用将在 http://localhost:3000 上运行

4. 停止容器：

```bash
docker stop yourchat-app
docker rm yourchat-app
```

## 📄 许可证

本项目采用MIT许可证

## 📬 联系方式

项目链接: [https://github.com/XD06/yourchat](https://github.com/XD06/yourchat)

