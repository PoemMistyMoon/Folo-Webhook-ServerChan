# Folo-Webhook-ServerChan
由于Folo的webhook推送是JSON格式，导致无法直接使用Server酱，为了方便使用，由此诞生这个脚本

（其实其他推送也可以，改一下链接就行，有需要自行修改吧）


## 主要功能
1. **接收 Folo webhook**：处理 POST 请求，解析 JSON 数据
2. **数据提取**：从 webhook 中提取标题、发布时间、正文等信息
3. **格式转换**：将数据转换为 Server 酱要求的格式
4. **推送转发**：将处理后的数据发送到 Server 酱

## 处理的数据包括：
- 📅 **发布时间**：格式化为中文时间显示
- 📰 **来源信息**：Feed 标题和网站链接
- 👤 **作者信息**：如果有的话
- 📝 **内容摘要**：如果没有描述，使用内容的前200个字符作为摘要
- 📖 **原文链接**：方便直接访问

推送格式示例：
```
📅 **发布时间**: 2025-09-13 10:30:00

---

📰 **来源**: 某个博客

---

🔗 **网站**: https://example.com

---

👤 **作者**: 张三

---

📝 **摘要**:

这里是文章的摘要内容...

---

📖 **原文链接**: [点击查看原文](https://example.com/article/123)
```
## 使用方法：

1. **在 Cloudflare Workers 中创建新的 Worker**
2. **部署脚本**：将本仓库`_worker.js`中的代码复制到 Worker 编辑器中
3. **获取 Worker URL**：部署后会得到一个类似 `https://your-worker.your-subdomain.workers.dev` 的 URL
4. **绑定自定义域名**：可选，但非常建议绑定自定义域名
5. **在 Cloudflare Workers 设置中添加环境变量**：
   - `SCKEY`: 你的 Server 酱密钥
   - `WEBHOOK_PATH`: 自定义的安全路径，如 `/webhook-secret123`，默认路径为/webhook
6. **在 Folo 中配置 webhook**：使用域名加路径填入Folo即可, 如`https://your-worker.your-subdomain.workers.dev/webhook`


这样你就可以将 Folo 的 RSS 更新通过 Server 酱推送了！


**建议设置一个复杂的路径**，比如：
- `/webhook-2f8a9b1c4d6e`
- `/folo-push-abc123def`
- `/secret-webhook-path`

这样可以有效防止恶意请求和滥用！
