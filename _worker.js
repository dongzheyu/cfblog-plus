/**
 * Cloudflare Pages Functions - BlogJetCPP
 * 用于处理 GitHub 同步和 KV 存储
 */

export async function onRequest(context) {
    const request = context.request;
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 配置常量
    const CONFIG = {
        ADMIN_PASSWORD: 'DZY@013520',
        GITHUB_REPO: 'https://api.github.com/repos/dongzheyu/cfblog-plus/contents/posts.json',
        CLOUDFLARE_API_TOKEN: 'ATaK2uKHzBKMdIQBMp21ctiw0pHo8uXiBnnReS1s',
        CLOUDFLARE_ZONE_ID: ''
    };

    try {
        // 处理管理相关的 API 请求
        if (path.startsWith('/api/admin')) {
            // 检查管理员身份
            if (!isAdmin(request)) {
                return new Response('未授权', { status: 401 });
            }

            // 获取文章数据
            if (path === '/api/admin/posts' && method === 'GET') {
                const posts = await getPosts(context.env);
                return new Response(JSON.stringify(posts), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 保存文章数据
            if (path === '/api/admin/posts' && method === 'POST') {
                const posts = await request.json();
                await savePosts(context.env, posts);
                
                // 尝试同步到 GitHub
                await syncToGitHub(posts, context.env.GITHUB_TOKEN);
                
                // 清理缓存
                if (CONFIG.CLOUDFLARE_ZONE_ID) {
                    await clearCache();
                }
                
                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // 处理 GitHub 同步
        if (path === '/api/sync' && method === 'POST') {
            if (!isAdmin(request)) {
                return new Response('未授权', { status: 401 });
            }

            try {
                // 从 KV 获取最新文章
                const posts = await getPosts(context.env);
                
                // 同步到 GitHub
                await syncToGitHub(posts, context.env.GITHUB_TOKEN);
                
                return new Response(JSON.stringify({ 
                    success: true, 
                    message: '同步成功' 
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

        // 清理缓存
        if (path === '/api/clear-cache' && method === 'POST') {
            if (!isAdmin(request)) {
                return new Response('未授权', { status: 401 });
            }

            try {
                await clearCache();
                return new Response(JSON.stringify({ 
                    success: true, 
                    message: '缓存清理成功' 
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

        // 如果不是 API 请求，则继续到静态资源
        return await context.next();
    } catch (error) {
        console.error('Error in function:', error);
        return new Response('服务器错误', { status: 500 });
    }
}

// 检查管理员身份
function isAdmin(request) {
    // 这里可以实现更复杂的认证逻辑
    // 目前简单检查请求头中是否包含管理员令牌
    const authHeader = request.headers.get('Authorization');
    return authHeader === `Bearer ${btoa('admin:DZY@013520')}`;
}

// 从 KV 获取文章
async function getPosts(env) {
    if (env.BLOG_KV) {
        const data = await env.BLOG_KV.get('posts');
        return data ? JSON.parse(data) : [];
    }
    return [];
}

// 保存文章到 KV
async function savePosts(env, posts) {
    if (env.BLOG_KV) {
        await env.BLOG_KV.put('posts', JSON.stringify(posts));
    }
}

// 同步到 GitHub
async function syncToGitHub(posts, githubToken) {
    if (!githubToken) {
        throw new Error('未配置 GitHub Token');
    }

    const content = btoa(JSON.stringify(posts, null, 2));
    
    // 发送到 GitHub
    const response = await fetch('https://api.github.com/repos/dongzheyu/cfblog-plus/contents/posts.json', {
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update posts via Cloudflare Pages',
            content: content,
            // 这里可能需要提供当前文件的 SHA，需要先获取文件信息
        })
    });

    if (!response.ok) {
        throw new Error(`GitHub 同步失败: ${response.statusText}`);
    }
}

// 清理 Cloudflare 缓存
async function clearCache() {
    if (!CONFIG.CLOUDFLARE_ZONE_ID || !CONFIG.CLOUDFLARE_API_TOKEN) {
        console.log('未配置 Cloudflare 信息，跳过缓存清理');
        return;
    }

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

    if (!response.ok) {
        throw new Error('缓存清理失败');
    }
}