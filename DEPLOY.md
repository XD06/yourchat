# 部署指南

本文档提供了如何将MyChat应用部署到Vercel的详细步骤。

## 部署到Vercel

### 准备工作

1. 创建[GitHub账号](https://github.com/signup)（如果没有）
2. 创建[Vercel账号](https://vercel.com/signup)（建议使用GitHub账号登录）

### 步骤1：将代码推送到GitHub

如果您已经在本地修改了代码，需要将其推送到自己的GitHub仓库：

1. 创建一个新的GitHub仓库
2. 按照以下命令将代码推送到您的仓库：

```bash
# 如果您的项目不是git仓库，先初始化
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到GitHub
git push -u origin main
```

或者，如果您想创建一个没有历史记录的全新仓库，可以使用提供的脚本：

- Linux/Mac: `./setup-clean-repo.sh`
- Windows: `setup-clean-repo.bat`

### 步骤2：在Vercel中导入项目

1. 登录[Vercel](https://vercel.com)
2. 点击"Add New..."，然后选择"Project"
3. 选择您刚刚创建的GitHub仓库
4. 配置项目设置：
   - Framework Preset: 选择"Vue.js"（如果自动检测不正确）
   - Build Command: 保持默认 `npm run build`
   - Output Directory: 保持默认 `dist`

### 步骤3：配置环境变量

在Vercel部署界面中，找到"Environment Variables"部分，添加以下环境变量：

- `API_KEY`: 您的API密钥（**不带** `VITE_` 前缀，安全存储在服务器端）
- `WEBSITE_CODE`: 访问密码（**不带** `VITE_` 前缀，安全存储在服务器端）
- `VITE_DEFAULT_MODEL`: 默认使用的AI模型（可选）
- `VITE_DEFAULT_MAX_TOKENS`: 默认最大token数量（可选，默认为1000）
- `VITE_MODELS`: 自定义模型列表（可选，格式：`model1:显示名1,model2:显示名2`）

> **重要安全说明**：
> 
> - 敏感信息（如API密钥和访问密码）**不应使用** `VITE_` 前缀，这样它们就不会被打包到前端代码中
> - 带有 `VITE_` 前缀的环境变量会在构建时被注入到前端代码中，可能被用户查看
> - 不带 `VITE_` 前缀的环境变量只能在服务器端（API路由）中访问，更加安全

### 环境变量工作原理

在本项目中，我们使用了两种类型的环境变量：

1. **前端环境变量**（以 `VITE_` 开头）
   - 这些变量在构建时被注入到前端代码中
   - 可以在浏览器中通过 `import.meta.env.VITE_XXX` 访问
   - 适用于非敏感配置，如默认模型名称、UI配置等

2. **后端环境变量**（不以 `VITE_` 开头）
   - 这些变量只在服务器端（API路由）中可用
   - 通过 `process.env.XXX` 访问
   - 适用于敏感信息，如API密钥、访问密码等

本项目使用 Vercel/Netlify 的无服务器函数（API路由）来安全地处理敏感信息，确保它们不会暴露在前端代码中。详细配置示例请参考项目根目录下的 `ENV-EXAMPLE.md` 文件。

### 步骤4：部署

点击"Deploy"按钮开始部署过程。部署完成后，Vercel会提供一个唯一的URL以访问您的应用。

### 自定义域名（可选）

如果您想使用自己的域名：

1. 在项目仪表板中，点击"Domains"选项卡
2. 输入您想要使用的域名
3. 按照Vercel提供的说明配置您的DNS设置

## 部署更新

当您对代码进行更改并推送到GitHub时，Vercel会自动重新部署您的应用。

## 查看构建日志

如果部署过程中遇到问题，您可以在Vercel仪表板中查看构建日志：

1. 进入您的项目
2. 点击最近的部署
3. 在"Source"选项卡中查看构建日志

## 其他信息

- Vercel提供免费计划，适合个人项目
- 构建过程通常只需要几分钟
- 部署后的应用会自动有HTTPS支持 