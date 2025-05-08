// 自定义的 markdown-it 插件，用于处理 Mermaid 流程图
import { v4 as uuidv4 } from 'uuid';
import mermaid from 'mermaid';

// 初始化 mermaid 配置
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  flowchart: {
    htmlLabels: true,
    curve: 'basis'
  }
});

export default function mermaidPlugin(md) {
  // 保存原始的fence规则
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);

  // 覆盖fence规则来处理mermaid代码块
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const code = token.content.trim();
    
    if (token.info === 'mermaid') {
      // 为每个图表创建唯一ID
      const mermaidId = `mermaid-diagram-${uuidv4()}`;
      
      // 创建带有动画效果的容器
      return `
        <div class="mermaid-wrapper">
          <div class="mermaid-container">
            <div class="mermaid-header">
              <span class="mermaid-label">mermaid</span>
              <button class="copy-btn" data-code="${encodeURIComponent(code)}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <div class="mermaid-diagram fade-in" id="${mermaidId}">
              ${code}
            </div>
          </div>
        </div>
        <script>
          try {
            // 使用 setTimeout 确保 DOM 已完全加载
            setTimeout(() => {
              mermaid.contentLoaded();
            }, 0);
          } catch (error) {
            console.error('Mermaid rendering error:', error);
            document.getElementById('${mermaidId}').innerHTML = 
              '<div class="mermaid-error">Mermaid diagram rendering failed.</div>';
          }
        </script>
      `;
    }
    
    // 对于非mermaid代码块，使用默认处理
    return defaultFence(tokens, idx, options, env, slf);
  };
} 