/**
 * BlogJetCPP - 基于 Cloudflare Workers 的博客系统
 * 版权所有 (c) 2025 JetCPP
 * 基于 MIT 许可证开源
 */

// 配置常量
const CONFIG = {
  KV_NAMESPACE: 'blogjetcpp',
  ADMIN_PASSWORD: 'DZY@013520', // 管理员密码
  GITHUB_TOKEN: '', // 可选：GitHub API token
  SITE_NAME: 'BlogJetCPP',
  SITE_DESCRIPTION: '基于 Cloudflare Workers 的轻量级博客系统',
  POSTS_PER_PAGE: 10,
  CATEGORIES: ['软件', '系统', '教程'], // 预设分类
  IMAGE_UPLOAD_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB 图片大小限制
  CLOUDFLARE_API_TOKEN: 'ATaK2uKHzBKMdIQBMp21ctiw0pHo8uXiBnnReS1s', // Cloudflare API token
  CLOUDFLARE_ZONE_ID: '' // 需要在部署时设置
};

// HTML 模板 - 内嵌版本，不依赖外部资源
const HTML_TEMPLATES = {
  header: (title = CONFIG.SITE_NAME) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${CONFIG.SITE_NAME}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked@4.0.10/marked.min.js"></script>
    <style>
        .post-meta { color: #6c757d; font-size: 0.9em; }
        .post-content { line-height: 1.6; }
        .admin-panel { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .markdown-editor { min-height: 400px; }
        .preview-pane { min-height: 400px; border: 1px solid #dee2e6; padding: 15px; }
        .footer { margin-top: 50px; padding: 20px 0; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; }
        .category-badge { background: #007bff; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; }
        .cover-image { width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem; }
        .upload-area { border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: border-color 0.3s; }
        .upload-area:hover { border-color: #007bff; }
        .upload-area.dragover { border-color: #007bff; background: #f8f9ff; }
        .image-preview { max-width: 100%; max-height: 200px; margin-top: 10px; border-radius: 4px; }
        .category-filter { margin-bottom: 20px; }
        .category-filter .btn { margin-right: 10px; margin-bottom: 5px; }
        .category-filter .btn.active { background: #007bff; color: white; }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="/">${CONFIG.SITE_NAME}</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">首页</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="categoryDropdown" role="button" data-bs-toggle="dropdown">
                            分类
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/category/软件">软件</a></li>
                            <li><a class="dropdown-item" href="/category/系统">系统</a></li>
                            <li><a class="dropdown-item" href="/category/教程">教程</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/admin">管理</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="container mt-4">
`,

  footer: `
    </div>
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 ${CONFIG.SITE_NAME}. 基于 <a href="https://github.com/dongzheyu/cfblog-plus">BlogJetCPP</a> 构建</p>
            <p><small>基于 MIT 许可证开源 - 版权所有 (c) 2025 JetCPP</small></p>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`,

  postList: (posts, page = 1, category = null) => `
    <div class="row">
        <div class="col-lg-8">
            <h1 class="mb-4">${category ? \`\${category} 分类\` : '博客文章'}</h1>
            <div class="category-filter">
                <a href="/" class="btn \${!category ? 'btn-primary active' : 'btn-outline-primary'}">全部</a>
                \${CONFIG.CATEGORIES.map(cat => \`
                    <a href="/category/\${cat}" class="btn \${category === cat ? 'btn-primary active' : 'btn-outline-primary'}">\${cat}</a>
                \`).join('')}
            </div>
            \${posts.length === 0 ? '<p class="text-muted">暂无文章。</p>' : posts.map(post => \`
                <div class="card mb-4">
                    \${post.cover_image ? \`<img src="\${post.cover_image}" class="card-img-top cover-image" alt="\${post.title}">\` : ''}
                    <div class="card-body">
                        <h5 class="card-title">
                            <a href="/post/\${post.slug}" class="text-decoration-none">\${post.title}</a>
                            \${post.category ? \`<span class="category-badge ms-2">\${post.category}</span>\` : ''}
                        </h5>
                        <div class="post-meta mb-2">
                            <i class="bi bi-calendar"></i> \${new Date(post.created_at).toLocaleDateString('zh-CN')}
                            \${post.updated_at ? \`<span class="ms-3"><i class="bi bi-pencil"></i> 更新于 \${new Date(post.updated_at).toLocaleDateString('zh-CN')}</span>\` : ''}
                        </div>
                        <div class="card-text post-content">
                            \${post.summary || post.content.substring(0, 200) + '...'}
                        </div>
                        <a href="/post/\${post.slug}" class="btn btn-outline-primary btn-sm">阅读全文</a>
                    </div>
                </div>
            \`).join('')}
        </div>
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">关于博客</h5>
                </div>
                <div class="card-body">
                    <p>\${CONFIG.SITE_DESCRIPTION}</p>
                    <hr>
                    <h6>分类</h6>
                    <div class="category-filter">
                        \${CONFIG.CATEGORIES.map(cat => \`
                            <a href="/category/\${cat}" class="btn btn-sm btn-outline-secondary">\${cat}</a>
                        \`).join('')}
                    </div>
                    <hr>
                    <h6>快速链接</h6>
                    <ul class="list-unstyled">
                        <li><a href="/admin" class="text-decoration-none"><i class="bi bi-gear"></i> 管理后台</a></li>
                        <li><a href="https://github.com/dongzheyu/cfblog-plus" class="text-decoration-none"><i class="bi bi-github"></i> GitHub</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
`,

  postDetail: (post) => `
    <div class="row">
        <div class="col-lg-8">
            <article>
                \${post.cover_image ? \`<img src="\${post.cover_image}" class="cover-image mb-4" alt="\${post.title}">\` : ''}
                <header class="mb-4">
                    <h1>\${post.title}</h1>
                    <div class="post-meta">
                        <i class="bi bi-calendar"></i> \${new Date(post.created_at).toLocaleDateString('zh-CN')}
                        \${post.updated_at ? \`<span class="ms-3"><i class="bi bi-pencil"></i> 更新于 \${new Date(post.updated_at).toLocaleDateString('zh-CN')}</span>\` : ''}
                        \${post.category ? \`<span class="ms-3"><span class="category-badge">\${post.category}</span></span>\` : ''}
                    </div>
                </header>
                <div class="post-content">
                    \${marked.parse(post.content)}
                </div>
            </article>
            <div class="mt-4">
                <a href="/" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> 返回首页</a>
                \${post.category ? \`<a href="/category/\${post.category}" class="btn btn-outline-primary ms-2">查看更多\${post.category}文章</a>\` : ''}
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">操作</h5>
                </div>
                <div class="card-body">
                    <a href="/admin" class="btn btn-outline-primary btn-sm me-2"><i class="bi bi-gear"></i> 管理</a>
                </div>
            </div>
            \${post.category ? \`
            <div class="card mt-3">
                <div class="card-header">
                    <h6 class="mb-0">分类</h6>
                </div>
                <div class="card-body">
                    <a href="/category/\${post.category}" class="text-decoration-none">
                        <span class="category-badge">\${post.category}</span>
                    </a>
                </div>
            </div>
            \` : ''}
        </div>
    </div>
`,

  adminLogin: () => `
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">管理员登录</h4>
                </div>
                <div class="card-body">
                    <form method="post" action="/admin/login">
                        <div class="mb-3">
                            <label for="password" class="form-label">密码</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">登录</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
`,

  adminPanel: (posts) => `
    <div class="admin-panel">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>管理面板</h2>
            <div>
                <a href="/admin/new" class="btn btn-primary"><i class="bi bi-plus"></i> 新建文章</a>
                <button id="clear-cache-btn" class="btn btn-warning ms-2"><i class="bi bi-trash"></i> 清理缓存</button>
                <a href="/admin/logout" class="btn btn-outline-secondary ms-2"><i class="bi bi-box-arrow-right"></i> 退出</a>
            </div>
        </div>
    </div>
    
    <div class="table-responsive">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>标题</th>
                    <th>分类</th>
                    <th>创建时间</th>
                    <th>更新时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                \${posts.map(post => \`
                    <tr>
                        <td>
                            \${post.title}
                            \${post.cover_image ? '<i class="bi bi-image text-muted ms-1" title="有封面图片"></i>' : ''}
                        </td>
                        <td>\${post.category || '<span class="text-muted">未分类</span>'}</td>
                        <td>\${new Date(post.created_at).toLocaleDateString('zh-CN')}</td>
                        <td>\${post.updated_at ? new Date(post.updated_at).toLocaleDateString('zh-CN') : '-'}</td>
                        <td>
                            <a href="/admin/edit/\${post.slug}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i> 编辑</a>
                            <button onclick="deletePost('\${post.slug}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i> 删除</button>
                        </td>
                    </tr>
                \`).join('')}
            </tbody>
        </table>
    </div>
    
    <script>
        function deletePost(slug) {
            if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
                fetch('/admin/delete/' + slug, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            alert('删除失败');
                        }
                    })
                    .catch(error => {
                        console.error('删除失败:', error);
                        alert('删除失败');
                    });
            }
        }
        
        document.getElementById('clear-cache-btn').addEventListener('click', async function() {
            if (confirm('确定要清理全站缓存吗？')) {
                try {
                    const response = await fetch('/admin/clear-cache', { method: 'POST' });
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('缓存清理成功！');
                    } else {
                        alert('缓存清理失败: ' + result.error);
                    }
                } catch (error) {
                    alert('缓存清理失败: ' + error.message);
                }
            }
        });
    </script>
`,

  editor: (post = null) => `
    <div class="admin-panel">
        <h2>\${post ? '编辑文章' : '新建文章'}</h2>
    </div>
    
    <form method="post" action="\${post ? '/admin/update/' + post.slug : '/admin/create'}" enctype="multipart/form-data">
        <div class="row">
            <div class="col-md-8">
                <div class="mb-3">
                    <label for="title" class="form-label">标题</label>
                    <input type="text" class="form-control" id="title" name="title" value="\${post ? post.title : ''}" required>
                </div>
                
                <div class="mb-3">
                    <label for="category" class="form-label">分类</label>
                    <select class="form-select" id="category" name="category">
                        <option value="">请选择分类</option>
                        \${CONFIG.CATEGORIES.map(cat => \`
                            <option value="\${cat}" \${post && post.category === cat ? 'selected' : ''}>\${cat}</option>
                        \`).join('')}
                    </select>
                </div>
                
                <div class="mb-3">
                    <label for="summary" class="form-label">摘要</label>
                    <textarea class="form-control" id="summary" name="summary" rows="2">\${post ? post.summary || '' : ''}</textarea>
                </div>
                
                <div class="mb-3">
                    <label for="cover_image" class="form-label">封面图片</label>
                    <div class="upload-area" onclick="document.getElementById('cover_image').click()" 
                         ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                        <i class="bi bi-cloud-upload" style="font-size: 2rem; color: #6c757d;"></i>
                        <p class="mt-2 mb-0">点击或拖拽上传封面图片</p>
                        <small class="text-muted">支持 JPG、PNG、GIF 格式，最大 5MB</small>
                        <input type="file" id="cover_image" name="cover_image" accept="image/*" style="display: none;" onchange="handleCoverImageSelect(event)">
                        <div id="cover_preview" class="mt-2">
                            \${post && post.cover_image ? \`<img src="\${post.cover_image}" class="image-preview" alt="封面预览">\` : ''}
                        </div>
                    </div>
                    <input type="hidden" id="cover_image_url" name="cover_image_url" value="\${post ? post.cover_image || '' : ''}">
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">图片上传</h6>
                    </div>
                    <div class="card-body">
                        <div class="upload-area" onclick="document.getElementById('image_upload').click()" 
                             ondrop="handleImageDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                            <i class="bi bi-image" style="font-size: 1.5rem; color: #6c757d;"></i>
                            <p class="mt-2 mb-0">上传图片到内容</p>
                            <small class="text-muted">点击或拖拽上传</small>
                            <input type="file" id="image_upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
                        </div>
                        <div id="uploaded_images" class="mt-2"></div>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h6 class="mb-0">GitHub 导入</h6>
                    </div>
                    <div class="card-body">
                        <div class="input-group">
                            <input type="text" class="form-control" id="github-import" placeholder="用户名/仓库/文件路径">
                            <button type="button" class="btn btn-outline-secondary" onclick="importFromGithub()">导入</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <label for="content" class="form-label">内容 (Markdown)</label>
            <div class="row">
                <div class="col-md-6">
                    <textarea class="form-control markdown-editor" id="content" name="content" rows="15" oninput="updatePreview()">\${post ? post.content : ''}</textarea>
                </div>
                <div class="col-md-6">
                    <div class="preview-pane" id="preview">\${post ? marked.parse(post.content) : ''}</div>
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <button type="submit" class="btn btn-primary">\${post ? '更新文章' : '发布文章'}</button>
            <a href="/admin" class="btn btn-outline-secondary">取消</a>
        </div>
    </form>
    
    <script>
        let uploadedImageUrls = [];
        
        function updatePreview() {
            const content = document.getElementById('content').value;
            document.getElementById('preview').innerHTML = marked.parse(content);
        }
        
        function handleDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('dragover');
        }
        
        function handleDragLeave(event) {
            event.currentTarget.classList.remove('dragover');
        }
        
        function handleDrop(event) {
            event.preventDefault();
            event.currentTarget.classList.remove('dragover');
        }
        
        async function handleCoverImageSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件');
                return;
            }
            
            if (file.size > ${CONFIG.IMAGE_UPLOAD_SIZE_LIMIT}) {
                alert('图片大小不能超过 5MB');
                return;
            }
            
            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('type', 'cover');
                
                const response = await fetch('/admin/upload-image', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.success) {
                    document.getElementById('cover_preview').innerHTML = '<img src="' + result.url + '" class="image-preview" alt="封面预览">';
                    document.getElementById('cover_image_url').value = result.url;
                } else {
                    alert('上传失败: ' + result.error);
                }
            } catch (error) {
                alert('上传失败: ' + error.message);
            }
        }
        
        async function handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件');
                return;
            }
            
            if (file.size > ${CONFIG.IMAGE_UPLOAD_SIZE_LIMIT}) {
                alert('图片大小不能超过 5MB');
                return;
            }
            
            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('type', 'content');
                
                const response = await fetch('/admin/upload-image', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.success) {
                    uploadedImageUrls.push(result.url);
                    updateUploadedImages();
                    insertImageToContent(result.url);
                } else {
                    alert('上传失败: ' + result.error);
                }
            } catch (error) {
                alert('上传失败: ' + error.message);
            }
            
            event.target.value = '';
        }
        
        function handleImageDrop(event) {
            event.preventDefault();
            event.currentTarget.classList.remove('dragover');
            
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('image_upload').files = files;
                handleImageUpload({ target: { files: files } });
            }
        }
        
        function updateUploadedImages() {
            const container = document.getElementById('uploaded_images');
            container.innerHTML = uploadedImageUrls.map(function(url) {
                return '<div class="mb-2">' +
                    '<img src="' + url + '" class="image-preview" style="max-width: 100px; max-height: 80px;">' +
                    '<button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="removeImage(\'' + url + '\')">' +
                        '<i class="bi bi-trash"></i>' +
                    '</button>' +
                '</div>';
            }).join('');
        }
        
        function removeImage(url) {
            uploadedImageUrls = uploadedImageUrls.filter(u => u !== url);
            updateUploadedImages();
        }
        
        function insertImageToContent(url) {
            const content = document.getElementById('content');
            const cursorPos = content.selectionStart;
            const textBefore = content.value.substring(0, cursorPos);
            const textAfter = content.value.substring(cursorPos);
            const imageMarkdown = '![](' + url + ')';
            
            content.value = textBefore + imageMarkdown + textAfter;
            content.selectionStart = content.selectionEnd = cursorPos + imageMarkdown.length;
            content.focus();
            updatePreview();
        }
        
        async function importFromGithub() {
            const path = document.getElementById('github-import').value;
            if (!path) {
                alert('请输入 GitHub 文件路径');
                return;
            }
            
            try {
                const response = await fetch('/admin/github-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path })
                });
                
                const data = await response.json();
                if (data.success) {
                    document.getElementById('content').value = data.content;
                    document.getElementById('title').value = data.title || '';
                    updatePreview();
                } else {
                    alert('导入失败: ' + data.error);
                }
            } catch (error) {
                alert('导入失败: ' + error.message);
            }
        }
    </script>
`
};

// 工具函数
function generateSlug(title) {
    return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isAdmin(request) {
    const cookie = request.headers.get('Cookie') || '';
    return cookie.includes('admin_token=authenticated');
}

function setAuthCookie() {
    return 'admin_token=authenticated; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600';
}

async function bufferToBase64(buffer) {
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

// Cloudflare 缓存清理函数
async function clearCloudflareCache() {
    if (!CONFIG.CLOUDFLARE_ZONE_ID) {
        console.warn('未设置 Cloudflare Zone ID，跳过缓存清理');
        return { success: false, error: '未设置 Cloudflare Zone ID' };
    }
    
    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${CONFIG.CLOUDFLARE_ZONE_ID}/purge_cache`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                purge_everything: true
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('Cloudflare 缓存清理成功');
            return { success: true };
        } else {
            console.error('Cloudflare 缓存清理失败:', result.errors);
            return { success: false, error: result.errors[0]?.message || '未知错误' };
        }
    } catch (error) {
        console.error('清理 Cloudflare 缓存时出错:', error);
        return { success: false, error: error.message };
    }
}

// 路由处理
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 初始化 KV 存储
    if (!env.BLOG_KV) {
        env.BLOG_KV = env[CONFIG.KV_NAMESPACE];
    }

    try {
        // 首页
        if (path === '/' && method === 'GET') {
            const posts = await getPosts(env.BLOG_KV);
            return new Response(
                HTML_TEMPLATES.header() + HTML_TEMPLATES.postList(posts) + HTML_TEMPLATES.footer,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        // 分类页面
        if (path.startsWith('/category/') && method === 'GET') {
            const category = path.replace('/category/', '');
            const posts = await getPostsByCategory(env.BLOG_KV, category);
            return new Response(
                HTML_TEMPLATES.header(category) + HTML_TEMPLATES.postList(posts, 1, category) + HTML_TEMPLATES.footer,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        // 文章详情
        if (path.startsWith('/post/') && method === 'GET') {
            const slug = path.replace('/post/', '');
            const post = await getPost(env.BLOG_KV, slug);
            
            if (!post) {
                return new Response('文章未找到', { status: 404 });
            }
            
            return new Response(
                HTML_TEMPLATES.header(post.title) + HTML_TEMPLATES.postDetail(post) + HTML_TEMPLATES.footer,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        // 管理员相关路由
        if (path.startsWith('/admin')) {
            // 登录页面
            if (path === '/admin' && method === 'GET') {
                if (isAdmin(request)) {
                    const posts = await getPosts(env.BLOG_KV);
                    return new Response(
                        HTML_TEMPLATES.header('管理面板') + HTML_TEMPLATES.adminPanel(posts) + HTML_TEMPLATES.footer,
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                } else {
                    return new Response(
                        HTML_TEMPLATES.header('管理员登录') + HTML_TEMPLATES.adminLogin() + HTML_TEMPLATES.footer,
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                }
            }

            // 登录处理
            if (path === '/admin/login' && method === 'POST') {
                const formData = await request.formData();
                const password = formData.get('password');
                
                if (password === CONFIG.ADMIN_PASSWORD) {
                    return new Response('', {
                        status: 302,
                        headers: {
                            'Location': '/admin',
                            'Set-Cookie': setAuthCookie()
                        }
                    });
                } else {
                    return new Response('密码错误', { status: 401 });
                }
            }

            // 退出登录
            if (path === '/admin/logout') {
                return new Response('', {
                    status: 302,
                    headers: {
                        'Location': '/admin',
                        'Set-Cookie': 'admin_token=; Path=/; Max-Age=0'
                    }
                });
            }

            // 检查管理员权限
            if (!isAdmin(request)) {
                return new Response('未授权', { status: 401 });
            }

            // 清理缓存
            if (path === '/admin/clear-cache' && method === 'POST') {
                const result = await clearCloudflareCache();
                return new Response(JSON.stringify(result), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 新建文章页面
            if (path === '/admin/new' && method === 'GET') {
                return new Response(
                    HTML_TEMPLATES.header('新建文章') + HTML_TEMPLATES.editor() + HTML_TEMPLATES.footer,
                    { headers: { 'Content-Type': 'text/html' } }
                );
            }

            // 编辑文章页面
            if (path.startsWith('/admin/edit/') && method === 'GET') {
                const slug = path.replace('/admin/edit/', '');
                const post = await getPost(env.BLOG_KV, slug);
                
                if (!post) {
                    return new Response('文章未找到', { status: 404 });
                }
                
                return new Response(
                    HTML_TEMPLATES.header('编辑文章') + HTML_TEMPLATES.editor(post) + HTML_TEMPLATES.footer,
                    { headers: { 'Content-Type': 'text/html' } }
                );
            }

            // 图片上传
            if (path === '/admin/upload-image' && method === 'POST') {
                try {
                    const formData = await request.formData();
                    const image = formData.get('image');
                    const type = formData.get('type');
                    
                    if (!image) {
                        return new Response(JSON.stringify({ success: false, error: '未选择图片' }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    // 检查文件大小
                    if (image.size > CONFIG.IMAGE_UPLOAD_SIZE_LIMIT) {
                        return new Response(JSON.stringify({ success: false, error: '图片大小超过限制' }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    // 检查文件类型
                    if (!image.type.startsWith('image/')) {
                        return new Response(JSON.stringify({ success: false, error: '文件类型不支持' }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    // 生成唯一文件名
                    const fileExtension = image.name.split('.').pop();
                    const fileName = `${generateId()}.${fileExtension}`;
                    const imageKey = type === 'cover' ? `cover_${fileName}` : `image_${fileName}`;
                    
                    // 将图片转换为 base64
                    const imageBuffer = await image.arrayBuffer();
                    const base64Image = await bufferToBase64(imageBuffer);
                    const dataUrl = \`data:\${image.type};base64,\${base64Image}\`;
                    
                    // 存储到 KV
                    await env.BLOG_KV.put(imageKey, JSON.stringify({
                        data: dataUrl,
                        type: image.type,
                        size: image.size,
                        created_at: new Date().toISOString()
                    }));
                    
                    // 生成访问 URL
                    const imageUrl = \`/admin/image/\${imageKey}\`;
                    
                    return new Response(JSON.stringify({ 
                        success: true, 
                        url: imageUrl,
                        key: imageKey
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                } catch (error) {
                    return new Response(JSON.stringify({ 
                        success: false, 
                        error: error.message 
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }

            // 图片访问
            if (path.startsWith('/admin/image/') && method === 'GET') {
                const imageKey = path.replace('/admin/image/', '');
                try {
                    const imageData = await env.BLOG_KV.get(imageKey);
                    if (!imageData) {
                        return new Response('图片未找到', { status: 404 });
                    }
                    
                    const imageInfo = JSON.parse(imageData);
                    return new Response(imageInfo.data.slice(imageInfo.data.indexOf(',') + 1), {
                        headers: {
                            'Content-Type': imageInfo.type,
                            'Cache-Control': 'public, max-age=31536000'
                        }
                    });
                } catch (error) {
                    return new Response('图片加载失败', { status: 500 });
                }
            }

            // 创建文章
            if (path === '/admin/create' && method === 'POST') {
                const formData = await request.formData();
                const title = formData.get('title');
                const content = formData.get('content');
                const summary = formData.get('summary');
                const category = formData.get('category');
                const coverImageUrl = formData.get('cover_image_url');
                
                const slug = generateSlug(title);
                const post = {
                    id: generateId(),
                    title,
                    content,
                    summary,
                    category,
                    cover_image: coverImageUrl || null,
                    slug,
                    created_at: new Date().toISOString(),
                    updated_at: null
                };
                
                await env.BLOG_KV.put(`post_${slug}`, JSON.stringify(post));
                
                // 清理 Cloudflare 缓存
                await clearCloudflareCache();
                
                return new Response('', {
                    status: 302,
                    headers: { 'Location': '/admin' }
                });
            }

            // 更新文章
            if (path.startsWith('/admin/update/') && method === 'POST') {
                const slug = path.replace('/admin/update/', '');
                const formData = await request.formData();
                const title = formData.get('title');
                const content = formData.get('content');
                const summary = formData.get('summary');
                const category = formData.get('category');
                const coverImageUrl = formData.get('cover_image_url');
                
                const existingPost = await getPost(env.BLOG_KV, slug);
                if (!existingPost) {
                    return new Response('文章未找到', { status: 404 });
                }
                
                const updatedPost = {
                    ...existingPost,
                    title,
                    content,
                    summary,
                    category,
                    cover_image: coverImageUrl || null,
                    updated_at: new Date().toISOString()
                };
                
                await env.BLOG_KV.put(`post_${slug}`, JSON.stringify(updatedPost));
                
                // 清理 Cloudflare 缓存
                await clearCloudflareCache();
                
                return new Response('', {
                    status: 302,
                    headers: { 'Location': '/admin' }
                });
            }

            // 删除文章
            if (path.startsWith('/admin/delete/') && method === 'DELETE') {
                const slug = path.replace('/admin/delete/', '');
                await env.BLOG_KV.delete(`post_${slug}`);
                
                // 清理 Cloudflare 缓存
                await clearCloudflareCache();
                
                return new Response('', { status: 200 });
            }

            // GitHub 导入
            if (path === '/admin/github-import' && method === 'POST') {
                const { path: githubPath } = await request.json();
                
                try {
                    // 使用 raw.githubusercontent.com 直接获取文件内容
                    const githubUrl = `https://raw.githubusercontent.com/\${githubPath}`;
                    const response = await fetch(githubUrl);
                    
                    if (!response.ok) {
                        throw new Error(\`GitHub 请求失败: \${response.status} \${response.statusText}\`);
                    }
                    
                    const content = await response.text();
                    const title = githubPath.split('/').pop().replace(/\.[^/.]+$/, '');
                    
                    return new Response(JSON.stringify({
                        success: true,
                        content,
                        title
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } catch (error) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: error.message
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
        }

        // 404
        return new Response('页面未找到', { status: 404 });
        
    } catch (error) {
        console.error('Error:', error);
        return new Response('服务器错误', { status: 500 });
    }
}

// KV 操作函数
async function getPosts(kv) {
    const list = await kv.list({ prefix: 'post_' });
    const posts = [];
    
    for (const key of list.keys) {
        const post = await getPost(kv, key.name.replace('post_', ''));
        if (post) {
            posts.push(post);
        }
    }
    
    return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function getPostsByCategory(kv, category) {
    const allPosts = await getPosts(kv);
    return allPosts.filter(post => post.category === category);
}

async function getPost(kv, slug) {
    const data = await kv.get(`post_${slug}`);
    return data ? JSON.parse(data) : null;
}

// Cloudflare Workers 入口点
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};