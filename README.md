# BlogJetCPP

一个基于 Cloudflare Workers 的轻量级博客系统，支持 Markdown 编辑和管理员功能。

## 特性

- 🚀 基于 Cloudflare Workers，无需服务器
- 📝 支持 Markdown 编辑和实时预览
- 🔐 管理员账户系统
- 📦 单文件部署，便于维护
- 🌐 响应式设计，支持移动端
- 📥 支持 GitHub 文件导入
- 💾 基于 Cloudflare KV 数据持久化

## 技术栈

- **运行环境**: Cloudflare Workers
- **数据存储**: Cloudflare KV
- **前端框架**: Bootstrap 5
- **Markdown 解析**: Marked.js
- **编辑器**: 原生 textarea + 实时预览

## 快速开始

### 前置要求

1. Cloudflare 账号
2. 自定义域名（可选）

### 部署步骤

1. **创建 Cloudflare Workers**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Workers & Pages" 页面
   - 点击 "Create Application"
   - 选择 "Workers" 然后点击 "Create Worker"

2. **配置代码**
   - 复制 `blog.js` 文件的内容到 Worker 编辑器
   - 点击 "Save and Deploy"

3. **配置 KV 存储**
   - 在 Workers 页面，点击 "Settings" 标签
   - 找到 "KV Namespace" 部分
   - 点击 "Create namespace"
   - 命名空间 ID: `blogjetcpp`
   - 绑定变量名: `BLOG_KV`

4. **设置环境变量**
   - 在 Settings 中找到 "Environment Variables"
   - 添加以下变量：
     ```
     KV_NAMESPACE = blogjetcpp
     ADMIN_PASSWORD = 你的管理员密码
     GITHUB_TOKEN = 你的GitHub token（可选）
     SITE_NAME = 你的博客名称
     SITE_DESCRIPTION = 你的博客描述
     ```

5. **绑定自定义域名**（可选）
   - 在 Workers 设置中，点击 "Triggers"
   - 在 "Custom Domains" 部分添加你的域名

### 配置说明

在 `blog.js` 文件的顶部，你可以修改以下配置：

```javascript
const CONFIG = {
  KV_NAMESPACE: 'blogjetcpp',        // KV 命名空间
  ADMIN_PASSWORD: 'admin123',        // 管理员密码（请修改）
  GITHUB_TOKEN: '',                  // GitHub API token（可选）
  SITE_NAME: 'BlogJetCPP',           // 网站名称
  SITE_DESCRIPTION: '基于 Cloudflare Workers 的轻量级博客系统',
  POSTS_PER_PAGE: 10                 // 每页文章数
};
```

## 使用指南

### 管理博客

1. **访问管理后台**
   - 访问 `https://your-domain.com/admin`
   - 输入管理员密码登录

2. **创建文章**
   - 点击 "新建文章"
   - 填写标题、摘要和内容
   - 支持 Markdown 语法
   - 实时预览功能
   - 点击 "发布文章"

3. **编辑文章**
   - 在管理面板中点击 "编辑"
   - 修改内容后点击 "更新文章"

4. **删除文章**
   - 在管理面板中点击 "删除"
   - 确认删除操作

### GitHub 导入

1. **获取 GitHub Token**（可选）
   - 访问 GitHub Settings > Developer settings > Personal access tokens
   - 创建新的 token，选择 `public_repo` 权限

2. **导入文件**
   - 在编辑器中输入 GitHub 文件路径：`用户名/仓库/文件路径`
   - 点击 "导入" 按钮
   - 系统会自动获取文件内容并填充到编辑器

### Markdown 语法

支持标准 Markdown 语法，包括：

- 标题：`# 一级标题` 到 `###### 六级标题`
- 粗体：`**粗体文本**`
- 斜体：`*斜体文本*`
- 链接：`[链接文本](https://example.com)`
- 图片：`![图片描述](https://example.com/image.jpg)`
- 代码块：```javascript\n代码内容\n```
- 列表：`- 项目1` 或 `1. 项目1`

## 常见问题

### Q: 如何修改管理员密码？
A: 在 `blog.js` 文件中修改 `CONFIG.ADMIN_PASSWORD` 的值，然后重新部署。

### Q: 如何备份博客数据？
A: Cloudflare KV 提供了数据导出功能，可以在 Cloudflare Dashboard 中导出数据。

### Q: 支持多用户吗？
A: 当前版本只支持单个管理员账户。

### Q: 如何自定义样式？
A: 可以修改 `HTML_TEMPLATES` 中的 CSS 样式部分。

## 开发

### 本地开发

可以使用 [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 进行本地开发：

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 本地运行
wrangler dev
```

### 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

版权所有 (c) 2025 JetCPP

## 支持

如果你觉得这个项目有用，请给个 ⭐️！

遇到问题可以提交 [Issue](https://github.com/dongzheyu/cfblog-plus/issues)。