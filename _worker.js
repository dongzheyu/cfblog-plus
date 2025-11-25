/**
 * Cloudflare Worker - BlogJetCPP
 * 用于处理 API 请求和 serve 静态内容
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // 处理管理相关的 API 请求
            if (path.startsWith('/api/admin')) {
                // 检查管理员身份
                if (!isAdmin(request)) {
                    return new Response('未授权', { status: 401 });
                }

                // 获取文章数据
                if (path === '/api/admin/posts' && method === 'GET') {
                    // 对于 Pages，我们从环境变量获取初始数据，但主要依赖前端的 localStorage
                    // 这里返回一个空数组，因为数据主要存储在客户端
                    return new Response(JSON.stringify([]), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                // 保存文章数据
                if (path === '/api/admin/posts' && method === 'POST') {
                    const posts = await request.json();
                    
                    // 尝试同步到 GitHub
                    if (env.GITHUB_TOKEN) {
                        try {
                            await syncToGitHub(posts, env.GITHUB_TOKEN);
                        } catch (error) {
                            console.error('GitHub 同步失败:', error);
                            // 即使同步失败，也返回成功，因为主要数据在客户端
                        }
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
                    const posts = await request.json();
                    
                    // 同步到 GitHub
                    if (env.GITHUB_TOKEN) {
                        await syncToGitHub(posts, env.GITHUB_TOKEN);
                    }
                    
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
                    if (env.CLOUDFLARE_ZONE_ID && env.CLOUDFLARE_API_TOKEN) {
                        await clearCache(env.CLOUDFLARE_ZONE_ID, env.CLOUDFLARE_API_TOKEN);
                    }
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

            // 如果不是 API 请求，返回 index.html（用于 SPA）
            // 但对于静态资源，我们应继续到默认处理
            if (path === '/' || path === '/index.html' || path.startsWith('/admin')) {
                // 从 KV 或其他地方获取 index.html 的内容
                // 但在这种部署模式下，我们依赖 Cloudflare Pages 的静态文件服务
                return env.ASSETS.fetch(request);
            } else if (path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.json')) {
                return env.ASSETS.fetch(request);
            } else {
                // 对于其他路径，也尝试返回静态资源
                return env.ASSETS.fetch(request);
            }
        } catch (error) {
            console.error('Error in function:', error);
            return new Response('服务器错误', { status: 500 });
        }
    }
};

// 检查管理员身份
function isAdmin(request) {
    // 检查请求头中是否包含管理员令牌
    const authHeader = request.headers.get('Authorization');
    return authHeader === `Bearer DZY@013520`;
}

// 同步到 GitHub
async function syncToGitHub(posts, githubToken) {
    if (!githubToken) {
        throw new Error('未配置 GitHub Token');
    }

    // 首先获取当前文件信息以获取 SHA
    let sha = null;
    try {
        const infoResponse = await fetch('https://api.github.com/repos/dongzheyu/cfblog-plus/contents/posts.json', {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        });
        
        if (infoResponse.ok) {
            const info = await infoResponse.json();
            sha = info.sha;
        }
    } catch (error) {
        console.log('获取文件信息失败，将创建新文件');
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
            sha: sha // 如果是新文件，这个值为 null，GitHub 会创建新文件
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub 同步失败: ${response.statusText}, ${JSON.stringify(errorData)}`);
    }
}

// 清理 Cloudflare 缓存
async function clearCache(zoneId, apiToken) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
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