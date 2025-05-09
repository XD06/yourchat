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
  flowchart: {
    htmlLabels: true,
    curve: 'basis'
  },
  deterministicIds: true, // 添加此配置可防止随机ID生成导致的错误SVG
  er: {
    useMaxWidth: true
  }
});

// 创建一个全局的渲染队列
const mermaidQueue = [];

// 全局错误SVG清理函数
window.mermaidCleanupErrorSvg = function() {
  // 查找所有可能的错误SVG元素并移除
  setTimeout(() => {
    const errorSvgs = document.querySelectorAll('svg[aria-roledescription="error"]');
    if (errorSvgs.length > 0) {
      console.log(`发现 ${errorSvgs.length} 个错误SVG元素，正在清理...`);
      errorSvgs.forEach(svg => {
        // 寻找父容器并替换为友好的错误消息
        const parent = svg.parentElement;
        if (parent) {
          // 创建错误提示
          const errorDiv = document.createElement('div');
          errorDiv.className = 'mermaid-error';
          errorDiv.innerHTML = `<div style="color: #d32f2f; padding: 10px; border: 1px solid #ffcdd2; background-color: #ffebee; border-radius: 4px; margin: 10px 0;">
            <strong>图表语法错误</strong>
            <p>请检查您的 Mermaid 图表语法。如果您尝试使用不支持的图表类型，请参考 <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank">Mermaid 文档</a>。</p>
          </div>`;
          // 替换错误SVG
          parent.replaceChild(errorDiv, svg);
        }
      });
    }
  }, 100);
};

// 检测并修复不支持的图表类型
function detectAndFixDiagramType(code) {
  if (!code) return code;
  
  // 清理代码，去除前后空白
  const trimmedCode = code.trim();
  
  // 检测和转换barChart到支持的格式
  if (trimmedCode.startsWith('barChart') || trimmedCode.startsWith('bar chart')) {
    try {
      // 提取标题和数据
      const lines = trimmedCode.split('\n').map(line => line.trim());
      const titleLine = lines.find(line => line.startsWith('title'));
      const title = titleLine ? titleLine.substring(5).trim() : '图表';
      
      // 提取数据点
      const dataPoints = lines
        .filter(line => line.includes(':') && !line.startsWith('title') && !line.startsWith('x-axis') && !line.startsWith('y-axis'))
        .map(line => {
          const parts = line.split(':');
          return {
            name: parts[0].trim().replace(/"/g, ''),
            value: parseInt(parts[1].trim(), 10) || 0
          };
        });
      
      // 生成饼图代码
      if (dataPoints.length > 0) {
        let pieChartCode = `pie title ${title}\n`;
        dataPoints.forEach(point => {
          pieChartCode += `    "${point.name}" : ${point.value}\n`;
        });
        console.log('已自动将barChart转换为饼图:', pieChartCode);
        return pieChartCode;
      }
    } catch (error) {
      console.warn('无法转换barChart:', error);
    }
  }
  
  return code;
}

// 包装渲染函数以添加错误处理和清理
function renderAndCleanup(id, code) {
  try {
    // 检测并修复不支持的图表类型
    const fixedCode = detectAndFixDiagramType(code);
    
    return mermaid.render(id, fixedCode)
      .then(result => {
        // 成功渲染后，清理可能存在的错误SVG
        window.mermaidCleanupErrorSvg();
        return result;
      })
      .catch(error => {
        console.error('Mermaid渲染错误:', error);
        // 捕获错误后清理
        window.mermaidCleanupErrorSvg();
        throw error;
      });
  } catch (error) {
    console.error('处理Mermaid图表失败:', error);
    // 确保在异常情况下也清理错误SVG
    window.mermaidCleanupErrorSvg();
    throw error;
  }
}

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
              // 使用增强的渲染函数
              renderAndCleanup(id + '-svg', code).then(result => {
                element.innerHTML = result.svg;
              }).catch(error => {
                console.error('渲染图表失败:', error);
                element.innerHTML = `<div class="mermaid-error">图表渲染失败: ${error.message}</div>`;
                // 确保清理错误SVG
                window.mermaidCleanupErrorSvg();
              });
            } catch (error) {
              console.error('处理Mermaid图表失败:', error);
              element.innerHTML = `<div class="mermaid-error">图表渲染失败: ${error.message}</div>`;
              // 确保清理错误SVG
              window.mermaidCleanupErrorSvg();
            }
          }
        });
        
        // 清空队列
        mermaidQueue.length = 0;
        
        // 额外的清理步骤，确保没有残留的错误SVG
        window.mermaidCleanupErrorSvg();
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
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      },
      deterministicIds: true, // 保持相同的ID生成策略
      er: {
        useMaxWidth: true
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