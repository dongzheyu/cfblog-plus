# Cloudflare Pages 部署指南

## 项目概述
BlogJetCPP - 基于 Cloudflare Pages 构建的现代化博客系统

## 部署步骤

### 1. 准备 GitHub 仓库
1. Fork 本仓库到您的 GitHub 账户
2. 确保仓库中包含以下文件：
   - `index.html` - 前台博客页面
   - `admin.html` - 管理后台页面
   - `_worker.js` - Cloudflare Pages Functions
   - `wrangler.toml` - 配置文件

### 2. 在 Cloudflare Pages 上创建项目
1. 登录 Cloudflare Dashboard
2. 转到 "Workers & Pages" 部分
3. 点击 "Pages" 选项卡
4. 点击 "Create a project"
5. 选择 "Connect to Git" 
6. 选择您 fork 的仓库

### 3. 配置构建设置
- **构建命令**: `echo 'No build required for static site'`
- **构建输出目录**: `.`
- **环境变量**: 
  - `CLOUDFLARE_API_TOKEN` (可选): 用于缓存清理
  - `GITHUB_TOKEN` (可选): 用于 GitHub 同步

### 4. 设置环境变量
在 Cloudflare Pages 项目的 "Settings" > "Environment Variables" 中设置:

```
CLOUDFLARE_API_TOKEN=您的CloudflareAPI令牌
CLOUDFLARE_ZONE_ID=您的ZoneID
GITHUB_TOKEN=您的GitHub个人访问令牌
```

### 5. GitHub 令牌设置
为实现自动同步功能，您需要在 GitHub 上创建个人访问令牌：
1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 点击 "Tokens (classic)"
3. 点击 "Generate new token"
4. 选择适当的权限（至少需要 repo 权限）
5. 保存令牌并在 Cloudflare Pages 中使用

### 6. 部署
1. 点击 "Save and Deploy"
2. 等待构建完成

## 管理功能

### 访问管理后台
- 访问 `https://your-domain.pages.dev/admin`
- 使用管理员密码 `DZY@013520` 登录

### 功能特性
- 现代化 UI 界面，带动画效果
- 文章管理（创建、编辑、删除）
- 分类管理（软件、系统、教程）
- Markdown 编辑器
- 图片上传
- 缓存清理
- 数据备份/恢复

### 数据同步
- 文章数据默认保存在浏览器 LocalStorage
- 可通过管理后台手动同步到 GitHub
- 支持 JSON 格式备份/恢复

## 配置选项

### 自定义配置
在 HTML 文件中修改 `CONFIG` 对象以自定义以下选项：
- `ADMIN_PASSWORD` - 管理员密码
- `CATEGORIES` - 文章分类
- `CLOUDFLARE_API_TOKEN` - Cloudflare API 令牌
- `CLOUDFLARE_ZONE_ID` - Cloudflare Zone ID

### 主题定制
可通过修改 CSS 变量来自定义颜色主题：
```css
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
}
```

## 故障排除

### 常见问题
1. **无法访问管理后台**:
   - 检查管理员密码是否正确
   - 确保在正确的页面尝试登录

2. **图片上传失败**:
   - 检查图片格式和大小限制（最大 5MB）
   - 确认网络连接正常

3. **缓存清理失败**:
   - 确认已正确设置 Cloudflare API 令牌和 Zone ID
   - 检查令牌权限是否足够

4. **GitHub 同步失败**:
   - 验证 GitHub 令牌权限
   - 确认仓库路径正确

### 性能优化
- 启用 Cloudflare 的自动压缩
- 使用 CDN 缓存静态资源
- 优化图片大小和格式

## 维护

### 定期任务
1. 定期备份文章数据
2. 监控部署状态
3. 更新安全令牌

### 数据备份
1. 在管理后台使用"备份数据"功能
2. 下载 JSON 格式的备份文件
3. 存储在安全位置

### 更新系统
1. 在 GitHub 仓库中更新文件
2. Cloudflare Pages 会自动重新部署
3. 检查部署状态确保正常

## 支持

如需技术支持：
1. 检查项目文档
2. 查看浏览器控制台错误信息
3. 联系 Cloudflare 支持 (如涉及平台问题)

## 许可证

基于 MIT 许可证开源
版权所有 (c) 2025 JetCPP