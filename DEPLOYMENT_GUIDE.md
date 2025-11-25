# Cloudflare Workers 部署指南

## 项目概述
BlogJetCPP - 基于 Cloudflare Workers 构建的现代化博客系统

## 部署步骤

### 1. 准备项目文件
确保项目中包含以下文件：
- `index.html` - 前台博客页面
- `admin.html` - 管理后台页面
- `_worker.js` - Cloudflare Worker 主文件
- `wrangler.toml` - Wrangler 配置文件

### 2. 安装 Wrangler
```bash
npm install -g wrangler
```

### 3. 登录 Cloudflare
```bash
wrangler login
```

### 4. 配置 wrangler.toml
确保 `wrangler.toml` 文件配置正确：
```toml
name = "blog"
compatibility_date = "2025-11-25"
main = "_worker.js"
```

### 5. 部署项目
```bash
wrangler deploy
```

### 6. 设置环境变量（可选）
在 wrangler.toml 中或通过命令行设置环境变量：

```bash
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put CLOUDFLARE_ZONE_ID
wrangler secret put GITHUB_TOKEN
```

## 管理功能

### 访问管理后台
- 访问部署后的 Worker 域名下的 `/admin` 路径
- 使用管理员密码 `DZY@013520` 登录

### 功能特性
- 现代化 UI 界面，带动画效果
- 文章管理（创建、编辑、删除）
- 分类管理（软件、系统、教程）
- Markdown 编辑器
- 图片上传
- 缓存清理
- 数据备份/恢复

### API 端点
- `GET /api/admin/posts` - 获取文章列表
- `POST /api/admin/posts` - 保存文章列表
- `POST /api/sync` - 同步到 GitHub
- `POST /api/clear-cache` - 清理缓存

## 配置选项

### 自定义配置
在 `_worker.js` 文件中修改配置以自定义以下选项：
- `CLOUDFLARE_API_TOKEN` - Cloudflare API 令牌
- `CLOUDFLARE_ZONE_ID` - Cloudflare Zone ID
- `GITHUB_TOKEN` - GitHub 个人访问令牌

### 主题定制
在 `index.html` 和 `admin.html` 中修改 CSS 变量来自定义颜色主题：
```css
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
}
```

## 故障排除

### 常见问题
1. **部署失败**:
   - 检查 `wrangler.toml` 配置是否正确
   - 确保 `main` 字段指向正确的 Worker 文件

2. **API 请求失败**:
   - 检查管理员身份验证令牌
   - 确认环境变量已正确设置

3. **GitHub 同步失败**:
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

### 更新系统
1. 修改项目文件
2. 运行 `wrangler deploy` 重新部署
3. 检查部署状态确保正常

## 支持

如需技术支持：
1. 检查项目文档
2. 查看浏览器控制台错误信息
3. 联系 Cloudflare 支持 (如涉及平台问题)

## 许可证

基于 MIT 许可证开源
版权所有 (c) 2025 JetCPP