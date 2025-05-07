# 变更日志

## 最新改进 (2023-12-01)

### 1. 滚动到底部按钮功能

- 实现了聊天界面的滚动到底部按钮，在用户向上滚动时显示
- 添加了平滑滚动效果和动画反馈
- 优化了按钮定位，使其在移动端和桌面端都有良好体验
- 添加了滚动状态检测，自动隐藏/显示按钮
- 改进了悬停和点击效果

### 2. 界面优化

- 调整了按钮样式，移除背景使其更加简洁
- 更改了按钮定位为固定位置，确保在所有滚动状态下可见
- 修复了在不同设备上的字体设置，添加了Microsoft YaHei等字体优化移动设备阅读体验
- 优化了聊天区域布局，提升整体用户体验

### 3. 技术文档更新

- 更新项目技术文档，添加最新功能描述
- 完善README.md，包含新增功能说明
- 更新CHANGES.md变更日志
- 调整了移动端适配策略

## 主要改进和修复

### 1. 修复API设置问题

- 解决了环境变量中的API URL和Key在界面配置中被暴露的问题
- 实现了新的getters和计算属性机制来处理环境变量与用户输入值
- 添加了`userCustomizedAPI`标志，使用户输入可以覆盖环境变量
- 增强了API设置的安全性和灵活性

### 2. 改进重新生成消息功能

- 修复了重新生成消息时"result is not defined"的错误
- 优化了变量作用域问题，确保正确初始化

### 3. 界面改进

- 创建了新的应用程序Logo组件
- 增强了ChatInput组件的暗黑模式支持
- 改进了移动端适配，优化了界面布局和元素大小

### 4. 项目部署支持

- 添加了GitHub和Vercel部署指南
- 创建了创建无历史记录仓库的脚本(Linux/Mac和Windows版本)
- 添加了Vercel配置文件，优化部署设置

### 5. 项目文档

- 更新了README.md，提供了更详细的项目说明
- 创建了DEPLOY.md部署指南
- 添加了CHANGES.md变更日志

## 新增文件

- `src/components/AppLogo.vue` - 新的Logo组件
- `public/logo.svg` - 应用Logo的SVG文件
- `setup-clean-repo.sh` - Linux/Mac清理仓库历史脚本
- `setup-clean-repo.bat` - Windows清理仓库历史脚本
- `DEPLOY.md` - 详细的部署指南
- `vercel.json` - Vercel部署配置
- `CHANGES.md` - 变更日志

## 修改文件

- `src/views/ChatView.vue` - 添加滚动到底部按钮功能，改进移动端适配
- `src/stores/settings.js` - 修复API设置问题
- `src/components/ChatInput.vue` - 改进暗黑模式和移动端适配
- `src/App.vue` - 添加应用程序Logo
- `package.json` - 更新项目名称和添加脚本
- `README.md` - 更新项目文档

## 下一步计划

- 继续优化移动端用户体验
- 改进聊天历史记录管理功能
- 添加更多AI模型支持
- 探索消息搜索功能
- 添加聊天导出功能 