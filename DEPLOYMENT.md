# BlogJetCPP 部署指南

本指南将帮助你快速部署 BlogJetCPP 到 Cloudflare Workers。

## 准备工作

### 1. 注册 Cloudflare 账号
- 访问 [Cloudflare 官网](https://www.cloudflare.com/)
- 注册免费账号
- 验证邮箱

### 2. 准备自定义域名（可选）
- 如果你有自己的域名，可以将其添加到 Cloudflare
- 如果没有，可以使用 Cloudflare 提供的 `.workers.dev` 子域名

## 部署步骤

### 第一步：创建 Worker

1. **登录 Cloudflare Dashboard**
   - 打开 [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
   - 使用你的账号登录

2. **进入 Workers 页面**
   - 在左侧菜单中找到 "Workers & Pages"
   - 点击进入

3. **创建新的 Worker**
   - 点击 "Create Application" 按钮
   - 选择 "Workers" 选项
   - 点击 "Create Worker"

4. **命名 Worker**
   - 输入 Worker 名称（例如：blogjetcpp）
   - 点击 "Deploy"

### 第二步：配置代码

1. **编辑代码**
   - 在 Worker 页面，点击 "Edit code"
   - 删除默认代码
   - 复制 `blog.js` 文件的全部内容
   - 粘贴到编辑器中

2. **修改配置**
   - 在代码顶部找到 `CONFIG` 对象
   - 修改以下配置：
     ```javascript
     const CONFIG = {
       KV_NAMESPACE: 'blogjetcpp',        // 保持不变
       ADMIN_PASSWORD: 'your_secure_password', // 修改为安全密码
       GITHUB_TOKEN: '',                  // 可选：添加 GitHub token
       SITE_NAME: '你的博客名称',           // 修改为你的博客名称
       SITE_DESCRIPTION: '你的博客描述',   // 修改为你的博客描述
       POSTS_PER_PAGE: 10                 // 可调整
     };
     ```

3. **保存并部署**
   - 点击 "Save and Deploy"
   - 等待部署完成

### 第三步：配置 KV 存储

1. **创建 KV 命名空间**
   - 在 Worker 页面，点击 "Settings" 标签
   - 找到 "KV Namespace" 部分
   - 点击 "Create namespace"

2. **配置命名空间**
   - 输入命名空间名称：`blogjetcpp`
   - 点击 "Add"
   - 记录生成的命名空间 ID

3. **绑定 KV 命名空间**
   - 在 "KV namespace bindings" 部分
   - 点击 "Add binding"
   - Variable name: `BLOG_KV`
   - KV namespace: 选择刚创建的 `blogjetcpp`
   - 点击 "Add"

### 第四步：设置环境变量

1. **添加环境变量**
   - 在 Settings 中找到 "Environment Variables"
   - 点击 "Add variable"

2. **配置变量**
   添加以下环境变量：
   ```
   Variable name: KV_NAMESPACE
   Value: blogjetcpp
   
   Variable name: ADMIN_PASSWORD  
   Value: 你的管理员密码
   
   Variable name: SITE_NAME
   Value: 你的博客名称
   
   Variable name: SITE_DESCRIPTION
   Value: 你的博客描述
   ```

3. **保存设置**
   - 点击 "Save"
   - 等待保存完成

### 第五步：配置自定义域名（可选）

1. **添加自定义域名**
   - 在 Worker 页面，点击 "Triggers" 标签
   - 在 "Custom Domains" 部分
   - 点击 "Add custom domain"

2. **输入域名**
   - 输入你的域名（例如：blog.yourdomain.com）
   - 点击 "Add custom domain"

3. **配置 DNS**
   - 按照提示配置 DNS 记录
   - 等待 SSL 证书生成

## 验证部署

### 1. 访问博客
- 打开浏览器
- 访问你的 Worker 域名或自定义域名
- 应该能看到博客首页

### 2. 测试管理功能
- 访问 `https://your-domain.com/admin`
- 输入管理员密码登录
- 尝试创建和编辑文章

### 3. 测试 GitHub 导入
- 在编辑器中测试 GitHub 文件导入功能
- 验证 Markdown 渲染是否正常

## 常见问题解决

### 问题 1：KV 存储无法访问
**解决方案：**
- 检查 KV 命名空间是否正确绑定
- 确认环境变量设置正确
- 重新部署 Worker

### 问题 2：管理员无法登录
**解决方案：**
- 检查 `ADMIN_PASSWORD` 环境变量是否设置正确
- 确认密码没有多余的空格
- 清除浏览器缓存后重试

### 问题 3：自定义域名无法访问
**解决方案：**
- 检查 DNS 配置是否正确
- 等待 DNS 传播完成（可能需要几分钟到几小时）
- 确认 SSL 证书已生成

### 问题 4：GitHub 导入失败
**解决方案：**
- 检查 GitHub token 是否有效
- 确认文件路径格式正确：`用户名/仓库/文件路径`
- 验证文件是否为公开文件

## 安全建议

### 1. 修改默认密码
- 务必修改默认管理员密码
- 使用强密码（至少 8 位，包含大小写字母、数字和特殊字符）

### 2. 定期备份
- 定期导出 KV 数据
- 保存 `blog.js` 文件的备份

### 3. 监控使用情况
- 在 Cloudflare Dashboard 中监控 Worker 使用情况
- 注意免费额度的限制

## 维护和更新

### 更新代码
1. 在 Worker 编辑器中修改代码
2. 点击 "Save and Deploy"
3. 等待部署完成

### 备份数据
1. 在 KV 命名空间页面
2. 点击 "Export"
3. 下载备份文件

### 恢复数据
1. 在 KV 命名空间页面
2. 点击 "Import"
3. 上传备份文件

## 性能优化

### 1. 缓存策略
- Cloudflare Workers 自动提供边缘缓存
- 可以在代码中添加自定义缓存头

### 2. 图片优化
- 使用 CDN 托管图片
- 压缩图片文件大小

### 3. 代码优化
- 减少 HTTP 请求
- 优化 CSS 和 JavaScript

## 扩展功能

### 1. 评论系统
- 集成第三方评论服务（如 Disqus）
- 或自建评论系统

### 2. 搜索功能
- 添加全文搜索
- 使用 Cloudflare Workers 搜索 API

### 3. 主题定制
- 修改 CSS 样式
- 添加多主题支持

## 技术支持

如果遇到问题：

1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 检查 [GitHub Issues](https://github.com/dongzheyu/cfblog-plus/issues)
3. 提交新的 Issue 寻求帮助

---

恭喜！你已经成功部署了 BlogJetCPP 博客系统。现在可以开始写博客了！🎉