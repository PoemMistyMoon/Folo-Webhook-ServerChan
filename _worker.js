export default {
  async fetch(request, env, ctx) {
    // 只处理 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 路径认证
    const url = new URL(request.url);
    const webhookPath = env.WEBHOOK_PATH || '/webhook';
    
    if (url.pathname !== webhookPath) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      // 解析 Folo webhook 数据
      const webhookData = await request.json();
      
      // 提取需要的数据
      const entry = webhookData.entry;
      const feed = webhookData.feed;
      
      // 构建标题
      let title = entry.title || '新文章通知';
      // 限制标题长度为32个字符
      if (title.length > 32) {
        title = title.substring(0, 29) + '...';
      }
      
      // 构建消息内容
      let content = '';
      
      // 添加发布时间
      if (entry.publishedAt) {
        const publishTime = new Date(entry.publishedAt);
        content += `📅 **发布时间**: ${publishTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n\n---\n\n`;
      }
      
      // 添加来源信息
      if (feed.title) {
        content += `📰 **来源**: ${feed.title}\n\n---\n\n`;
      }
      
      // 添加网站信息
      if (feed.siteUrl) {
        content += `🔗 **网站**: ${feed.siteUrl}\n\n---\n\n`;
      }
      
      // 添加作者信息
      if (entry.author) {
        content += `👤 **作者**: ${entry.author}\n\n---\n\n`;
      }
      
      // 添加文章描述或内容
      if (entry.description) {
        content += `📝 **摘要**:\n\n${entry.description}\n\n---\n\n`;
      } else if (entry.content) {
        // 如果没有描述，使用内容的前200个字符作为摘要
        const contentText = entry.content.replace(/<[^>]*>/g, ''); // 简单去除HTML标签
        const summary = contentText.length > 200 ? 
          contentText.substring(0, 197) + '...' : 
          contentText;
        content += `📝 **内容预览**:\n\n${summary}\n\n---\n\n`;
      }
      
      // 添加原文链接
      if (entry.url) {
        content += `📖 **原文链接**: [点击查看原文](${entry.url})`;
      }
      
      // 限制内容长度（Server酱限制32KB，这里保守一些）
      if (content.length > 30000) {
        content = content.substring(0, 29997) + '...';
      }
      
      // 准备发送到 Server酱 的数据
      const serverChanData = new URLSearchParams({
        title: title,
        desp: content,
        noip: '1' // 隐藏调用IP
      });
      
      // 发送到 Server酱
      // 注意：你需要将下面的 SCKEY 替换为你的实际密钥
      const SCKEY = env.SCKEY || '你的Server酱密钥';
      
      const response = await fetch(`https://sctapi.ftqq.com/${SCKEY}.send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: serverChanData
      });
      
      const result = await response.json();
      
      // 返回结果
      if (result.code === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: '推送成功',
          data: result
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          message: '推送失败',
          error: result
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
    } catch (error) {
      console.error('处理webhook时发生错误:', error);
      return new Response(JSON.stringify({
        success: false,
        message: '处理请求时发生错误',
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },
};
