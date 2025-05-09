//示例代码只仅供参考，实际标准尽按照项目要求，结合实际
//示例代码只仅供参考，实际标准尽按照项目要求，结合实际
//示例代码只仅供参考，实际标准尽按照项目要求，结合实际

exportBtn.addEventListener('click', () => {
    if (config.fullConversation.length === 0) {
        alert('没有可导出的对话内容');
        return;
    }

    // 提供格式选择
    const format = prompt('选择导出格式:\n1. TXT (文本)\n2. HTML (带样式)\n3. Markdown\n4. JSON (完整数据)', '3');

    if (!format) return;

    let exportContent = '';
    const dateStr = new Date().toLocaleString();

    switch(format) {
        case '1': // TXT 格式
            exportContent = `╭───────────────────────────────╮\n│      AI 助手对话记录         │\n│ 导出时间: ${dateStr.padEnd(19)} │\n╰───────────────────────────────╯\n\n`;
            config.fullConversation.forEach(msg => {
                const role = msg.role === 'user' ? '👤 用户' : '🤖 AI';
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '未知时间';

                exportContent += `\n╭── ${role} · ${time} ──\n│\n`;

                // 优先显示思考内容
                if (msg.hasReasoning && msg.reasoningContent) {
                    exportContent += `│ 💭 思考过程:\n│ ${msg.reasoningContent.split('\n').join('\n│ ')}\n│\n`;
                }

                exportContent += `│ 📝 正式回答:\n│ ${msg.content.split('\n').join('\n│ ')}\n╰────────────────────────────────\n`;
            });
            break;

        case '2': // HTML 格式
            exportContent = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>AI 对话记录 - ${dateStr}</title>
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #ecf0f1;
            --reasoning-color: #f39c12;
        }

        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: var(--secondary-color);
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem;
            background: var(--primary-color);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .message {
            margin-bottom: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            overflow: hidden;
        }

        .message-header {
            padding: 1rem;
            background: var(--primary-color);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .reasoning-section {
            padding: 1rem;
            background: #fff3e0;
            border-left: 4px solid var(--reasoning-color);
            margin: 1rem;
            border-radius: 4px;
        }

        .content-section {
            padding: 1.5rem;
        }

        .timestamp {
            font-size: 0.9em;
            opacity: 0.8;
        }

        pre {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1rem 0;
        }

        code {
            font-family: 'Fira Code', monospace;
            font-size: 0.9em;
        }
    </style>
  </head>
  <body>
    <div class="header">
        <h1>AI 对话记录</h1>
        <p>导出时间: ${dateStr}</p>
    </div>`;

            config.fullConversation.forEach(msg => {
                const role = msg.role === 'user' ? '用户' : 'AI助手';
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '未知时间';

                exportContent += `
    <div class="message">
        <div class="message-header">
            <span>${role}</span>
            <span class="timestamp">${time}</span>
        </div>`;

                if (msg.hasReasoning && msg.reasoningContent) {
                    exportContent += `
        <div class="reasoning-section">
            <h3>💭 思考过程</h3>
            <div>${msg.reasoningContent.replace(/\n/g, '<br>')}</div>
        </div>`;
                }

                exportContent += `
        <div class="content-section">
            <h3>📝 正式回答</h3>
            <div>${msg.content.replace(/\n/g, '<br>')}</div>
        </div>
    </div>`;
            });

            exportContent += '\n</body>\n</html>';
            break;

        case '3': // Markdown 格式
            exportContent = `# AI 对话记录\n\n**导出时间**: ${dateStr}\n\n`;
            config.fullConversation.forEach(msg => {
                const role = msg.role === 'user' ? '**👤 用户**' : '**🤖 AI助手**';
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '未知时间';

                exportContent += `## ${role} · _${time}_\n\n`;

                if (msg.hasReasoning && msg.reasoningContent) {
                    exportContent += `### 💭 思考过程\n${msg.reasoningContent}\n\n`;
                }

                exportContent += `### 📝 正式回答\n${msg.content}\n\n---\n\n`;
            });
            break;

        case '4': // JSON 格式
            exportContent = JSON.stringify({
                meta: {
                    title: "AI 对话记录",
                    exportDate: dateStr,
                    version: "2.0",
                    structure: "思考内容优先"
                },
                messages: config.fullConversation.map(msg => ({
                    ...msg,
                    contentOrder: msg.hasReasoning ? ["reasoning", "content"] : ["content"]
                }))
            }, null, 2);
            break;

        default:
            alert('无效的选择');
            return;
    }

    // 确定文件扩展名
    const ext =
        format === '1' ? 'txt' :
        format === '2' ? 'html' :
        format === '3' ? 'md' : 'json';

    // 创建下载链接
    const blob = new Blob([exportContent], {
        type: format === '2' ? 'text/html' :
              format === '4' ? 'application/json' : 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI对话记录_${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
  });
