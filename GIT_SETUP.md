# Git仓库设置指南

以下是将您的MyChat项目提交到Git仓库并推送到GitHub的步骤。

## 提交现有更改

如果您想保留现有的Git历史记录，请按照以下步骤操作：

```bash
# 添加所有更改到暂存区
git add .

# 提交更改
git commit -m "修复API设置、增强暗黑模式、添加Logo和部署支持"

# 关联到GitHub仓库（假设您已经创建）
git remote add origin https://github.com/用户名/mychat.git

# 推送到GitHub
git push -u origin main
```

## 创建全新仓库（无历史记录）

如果您想创建一个干净的仓库，没有任何历史记录，请使用我们创建的脚本：

### Windows系统

1. 在资源管理器中，右键点击`setup-clean-repo.bat`，选择"以管理员身份运行"
2. 或者在PowerShell/命令提示符中运行：
   ```
   .\setup-clean-repo.bat
   ```
3. 根据提示操作

### Linux/Mac系统

1. 打开终端，进入项目目录
2. 确保脚本有执行权限：
   ```
   chmod +x setup-clean-repo.sh
   ```
3. 运行脚本：
   ```
   ./setup-clean-repo.sh
   ```
4. 根据提示操作

### 或使用npm脚本运行：

```bash
# Windows
npm run clean-repo:win

# Linux/Mac
npm run clean-repo
```

## 脚本执行完成后：

1. 现在您有了一个干净的仓库，只有一个初始提交
2. 关联到GitHub仓库：
   ```
   git remote add origin https://github.com/用户名/mychat.git
   ```
3. 推送到GitHub：
   ```
   git push -f origin main
   ```

注意：使用`-f`（强制推送）是因为我们在创建新的历史记录时需要覆盖远程仓库中的任何现有历史。

## 验证设置

提交完成后，您可以验证设置：

```bash
# 检查远程仓库
git remote -v

# 检查分支
git branch -a

# 检查提交历史
git log --oneline
```

## 后续步骤

成功推送到GitHub后，您可以按照`DEPLOY.md`中的说明部署到Vercel。 