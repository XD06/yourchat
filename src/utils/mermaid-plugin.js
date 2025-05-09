// 自定义的 markdown-it 插件，用于处理 Mermaid 流程图
import { v4 as uuidv4 } from 'uuid';
import mermaid from 'mermaid';

// 添加版本检查和日志
console.log('当前使用的 Mermaid 版本:', mermaid.version || '未知');

// 使用增强的初始化配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  logLevel: 'error',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 14,
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    useMaxWidth: true,
    nodeSpacing: 40,
    rankSpacing: 50
  },
  themeVariables: {
    primaryColor: '#5a67d8',
    primaryTextColor: '#333',
    primaryBorderColor: '#4c51bf',
    lineColor: '#5a67d8',
    secondaryColor: '#6b7280',
    tertiaryColor: '#f3f4f6'
  }
});

// 创建一个全局的渲染队列
const mermaidQueue = [];

// 防抖函数来处理多个图表的渲染
let renderTimeout = null;
const processMermaidQueue = () => {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }
  
  renderTimeout = setTimeout(() => {
    if (!window.mermaidInitialized) {
      window.mermaidInitialized = true;
      
      // 注入全局渲染函数
      window.renderMermaidDiagrams = () => {
        mermaidQueue.forEach(item => {
          const { id, code } = item;
          const element = document.getElementById(id);
          if (element && !element.querySelector('svg')) {
            try {
              console.log('准备渲染图表:', id, '代码:', code);
              
              // 确保使用graph而非flowchart以避免v2版本问题
              const processedCode = code.replace(/^flowchart\s/gm, 'graph ');
              
              // 使用标准的mermaid render API
              mermaid.render(id + '-svg', processedCode).then(result => {
                console.log('渲染成功:', id);
                element.innerHTML = result.svg;
                
                // 添加后处理修复节点文字不显示问题
                const svgElement = element.querySelector('svg');
                if (svgElement) {
                  // 确保所有text元素可见
                  const texts = svgElement.querySelectorAll('text');
                  texts.forEach(text => {
                    if (!text.getAttribute('fill') || text.getAttribute('fill') === 'transparent') {
                      text.setAttribute('fill', '#333');
                    }
                    if (text.style.display === 'none') {
                      text.style.display = 'block';
                    }
                    // 确保足够大的字体大小
                    if (!text.style.fontSize || parseInt(text.style.fontSize) < 12) {
                      text.style.fontSize = '12px';
                    }
                  });
                }
              }).catch(error => {
                console.error('渲染图表失败:', error);
                element.innerHTML = `<div class="mermaid-error">图表渲染失败: ${error.message}</div>`;
              });
            } catch (error) {
              console.error('处理Mermaid图表失败:', error);
              element.innerHTML = `<div class="mermaid-error">图表渲染失败: ${error.message}</div>`;
            }
          }
        });
        
        // 清空队列
        mermaidQueue.length = 0;
      };
    }
    
    // 如果页面已加载完成，立即渲染
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      window.renderMermaidDiagrams();
    } else {
      // 否则等待页面加载完成
      window.addEventListener('DOMContentLoaded', window.renderMermaidDiagrams);
    }
  }, 100);
};

// 设置一个函数用于重新初始化Mermaid主题（当主题切换时使用）
export function reinitializeMermaidTheme(isDarkMode) {
  try {
    // 使用新的主题设置初始化
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'default',
      securityLevel: 'loose',
      logLevel: 'error',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: true,
        nodeSpacing: 40,
        rankSpacing: 50
      },
      themeVariables: isDarkMode ? {
        // 暗色主题变量
        primaryColor: '#818cf8',
        primaryTextColor: '#f9fafb',
        primaryBorderColor: '#6366f1',
        lineColor: '#818cf8',
        secondaryColor: '#9ca3af',
        tertiaryColor: '#374151'
      } : {
        // 亮色主题变量
        primaryColor: '#5a67d8',
        primaryTextColor: '#333',
        primaryBorderColor: '#4c51bf',
        lineColor: '#5a67d8',
        secondaryColor: '#6b7280',
        tertiaryColor: '#f3f4f6'
      }
    });
    
    console.log('Mermaid 主题已更新为:', isDarkMode ? '暗色' : '亮色');
    
    // 主题变化后，重新渲染所有图表
    if (window.renderMermaidDiagrams) {
      window.renderMermaidDiagrams();
    }
  } catch (error) {
    console.error('Mermaid 主题更新失败:', error);
  }
}

// 提供一个手动触发渲染的函数
export function renderMermaidDiagrams() {
  if (window.renderMermaidDiagrams) {
    window.renderMermaidDiagrams();
  }
}

export default function mermaidPlugin(md) {
  // 保存原始的fence规则
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);

  // 覆盖fence规则来处理mermaid代码块
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const code = token.content.trim();
    
    if (token.info === 'mermaid') {
      // 为每个图表创建唯一ID
      const mermaidId = `mermaid-${uuidv4()}`;
      
      // 将图表添加到渲染队列
      mermaidQueue.push({ id: mermaidId, code });
      // 处理渲染队列
      processMermaidQueue();

      // 创建容器
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
            <div class="mermaid" id="${mermaidId}">
              <div class="mermaid-loading">图表加载中...</div>
            </div>
          </div>
        </div>
      `;
    }
    
    // 对于非mermaid代码块，使用默认处理
    return defaultFence(tokens, idx, options, env, slf);
  };
} 