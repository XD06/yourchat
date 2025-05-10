// 自定义的 markdown-it 插件，用于处理 Mermaid 流程图
import { v4 as uuidv4 } from 'uuid';
import mermaid from 'mermaid';

// 添加版本检查和日志
console.log('当前使用的 Mermaid 版本:', mermaid.version || '未知');

// 优化Mermaid配置，减少初始化和渲染负担
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  logLevel: 'error',
  flowchart: {
    htmlLabels: true,
    curve: 'linear', // 使用更简单的曲线算法
    useMaxWidth: true,
    diagramPadding: 8
  },
  deterministicIds: true,
  sequence: {
    useMaxWidth: true,
    actorMargin: 50,
    messageMargin: 90,
  },
  er: {
    useMaxWidth: true
  },
  fontFamily: 'sans-serif',
  fontSize: 14,
  gantt: {
    useMaxWidth: true,
    barHeight: 20
  }
});

// 创建一个全局的渲染队列
const mermaidQueue = [];
let isRenderingInProgress = false;
let renderFrameRequest = null; 
let pendingRenderTimer = null;
// 添加一个延迟变量，根据输出状态动态调整
let renderDelayTime = 500; // 初始默认延迟0.5秒开始渲染

const INCOMPLETE_DIAGRAM_TIMEOUT = 7000; // 7 seconds timeout for incomplete diagrams if stream is ongoing
const ABSOLUTE_RENDER_TIMEOUT = 3000; // 3 seconds absolute maximum wait for ANY diagram

// Throttle function to control rendering frequency
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function(...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// 简化图表类型检测和修复逻辑
function detectAndFixDiagramType(code) {
  if (!code) return code;
  
  const trimmedCode = code.trim();
  
  if (trimmedCode.startsWith('barChart') || trimmedCode.startsWith('bar chart')) {
    try {
      const lines = trimmedCode.split('\n').map(line => line.trim());
      const titleLine = lines.find(line => line.startsWith('title'));
      const title = titleLine ? titleLine.substring(5).trim() : '图表';
      
      const dataPoints = lines
        .filter(line => line.includes(':') && !line.startsWith('title') && !line.startsWith('x-axis') && !line.startsWith('y-axis'))
        .map(line => {
          const parts = line.split(':');
          return {
            name: parts[0].trim().replace(/"/g, ''),
            value: parseInt(parts[1].trim(), 10) || 0
          };
        });
      
      if (dataPoints.length > 0) {
        let pieChartCode = `pie title ${title}\n`;
        dataPoints.forEach(point => {
          pieChartCode += `    "${point.name}" : ${point.value}\n`;
        });
        return pieChartCode;
      }
    } catch (error) {
      console.warn('无法转换barChart:', error);
    }
  }
  
  return code;
}

// 添加完整性检查函数
function isCompleteMermaidDiagram(code) {
  if (!code) return false;
  
  // 修剪前后空白
  const trimmedCode = code.trim();
  
  // 检查最基本的完整性要求
  if (trimmedCode.length < 10) return false; // 太短的内容肯定不完整
  
  // 常见的图表类型关键词
  const diagramTypes = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
    'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie',
    'gitGraph', 'requirementDiagram'
  ];
  
  // 检查是否包含至少一种图表类型的标识符
  const hasValidType = diagramTypes.some(type => 
    trimmedCode.includes(type) && 
    // 确保类型词是"完整的"，不是在标识符中间截断的
    (trimmedCode.includes(type + ' ') || 
     trimmedCode.includes(type + '\n') || 
     trimmedCode.includes(type + '{'))
  );
  
  if (!hasValidType) return false;
  
  // 检查是否有基本的结构完整性
  // 例如，flowchart应该有节点定义，sequenceDiagram应该有参与者等
  if (trimmedCode.includes('flowchart') || trimmedCode.includes('graph')) {
    // 流程图应该至少有一个节点定义和一个连接
    return trimmedCode.includes('-->') || 
           trimmedCode.includes('---') || 
           trimmedCode.includes('===') ||
           trimmedCode.includes('~~~') ||
           trimmedCode.includes('~~~');
  }
  
  if (trimmedCode.includes('sequenceDiagram')) {
    // 序列图应该至少有一个参与者和一个箭头
    return (trimmedCode.includes('participant') || trimmedCode.includes('actor')) && 
            trimmedCode.includes('->');
  }
  
  if (trimmedCode.includes('classDiagram')) {
    // 类图应该至少有一个类定义
    return trimmedCode.includes('class');
  }
  
  if (trimmedCode.includes('gantt')) {
    // 甘特图应该至少有一个部分和一个任务
    return trimmedCode.includes('section') && 
          (trimmedCode.includes('task') || trimmedCode.includes(':'));
  }
  
  if (trimmedCode.includes('pie')) {
    // 饼图应该至少有一个标题和一些数据
    return trimmedCode.includes('title') && 
           trimmedCode.includes(':') &&
           trimmedCode.includes('%');
  }
  
  // 如果没有特定规则，默认检查内容是否"看起来"完整
  // 即至少有几行有效内容
  const contentLines = trimmedCode.split('\n')
    .filter(line => line.trim().length > 0);
  return contentLines.length >= 3;
}

// 包装渲染函数以添加错误处理和清理，使用缓存减少重复渲染
const renderCache = new Map(); // 添加渲染缓存
function renderAndCleanup(id, code, originalCodeForError) {
  try {
    // 先检查完整性
    if (!isCompleteMermaidDiagram(code)) {
      console.warn('似乎是不完整的Mermaid图表，等待更多内容');
      return Promise.resolve({ 
        incomplete: true, 
        originalCode: originalCodeForError || code 
      });
    }
    
    const fixedCode = detectAndFixDiagramType(code);
    
    // 检查缓存中是否已有此图表的渲染结果
    const cacheKey = fixedCode.trim();
    if (renderCache.has(cacheKey)) {
      console.log('使用缓存的Mermaid渲染结果');
      return Promise.resolve(renderCache.get(cacheKey));
    }
    
    return mermaid.render(id, fixedCode)
      .then(result => {
        // 缓存结果
        renderCache.set(cacheKey, result);
        if (renderCache.size > 50) { // 限制缓存大小
          const oldestKey = renderCache.keys().next().value;
          renderCache.delete(oldestKey);
        }
        return result;
      })
      .catch(error => {
        console.error('Mermaid渲染错误:', error);
        return { error, originalCode: originalCodeForError || code };
      });
  } catch (error) {
    console.error('处理Mermaid图表失败:', error);
    return Promise.resolve({ error, originalCode: originalCodeForError || code });
  }
}

// Detect when user is typing vs. idle
let userIsTyping = false;
let typingTimer = null;
let lastMutationTime = Date.now();
let pendingContentCount = 0; // 跟踪待处理的内容增量数量

// 在DOM变化时记录
const setUserTyping = () => {
  userIsTyping = true;
  lastMutationTime = Date.now();
  pendingContentCount++;
  
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    userIsTyping = false;
    pendingContentCount = 0;
    // 用户停止输入后再开始处理图表
    processMermaidQueue(false);
  }, 500); // 设置一个较长的停顿检测时间
};

// 使用MutationObserver替代已弃用的DOMNodeInserted事件
// 创建观察器实例并设置内容变化的处理函数
const contentObserver = new MutationObserver((mutations) => {
  setUserTyping();
  
  // 动态调整渲染延迟
  if (pendingContentCount > 10) {
    // 如果有很多内容更新，增加延迟避免干扰输出
    renderDelayTime = 1000;
  } else if (pendingContentCount > 5) {
    renderDelayTime = 750;
  } else {
    renderDelayTime = 500;
  }
});

// 在文档加载时启动观察器
document.addEventListener('DOMContentLoaded', () => {
  // 开始监听文档变化
  contentObserver.observe(document.body, {
    childList: true,    // 监视子节点的添加或删除
    subtree: true,      // 监视所有后代节点
    characterData: true // 监视文本内容变化
  });
  console.log("Mermaid plugin: DOM content change observer activated.");
});

// 修改队列添加机制，记录放入队列的时间
function addToMermaidQueue(item) {
  item.addedAt = Date.now(); // Ensure every item has a timestamp
  item.attemptedRender = false; // Track if we've tried to render it
  item.mustRenderBy = item.addedAt + ABSOLUTE_RENDER_TIMEOUT; // Force render deadline
  mermaidQueue.push(item);
  
  // Schedule a forced render check specifically for this item
  setTimeout(() => {
    checkForceRenderDiagram(item.id);
  }, ABSOLUTE_RENDER_TIMEOUT + 100); // Add a slight buffer to the timeout
}

// Function to force-render a specific diagram if it's still waiting
function checkForceRenderDiagram(id) {
  // Find the element in the DOM
  const element = document.getElementById(id);
  if (!element) return; // Element no longer exists
  
  // If the element exists but hasn't been rendered successfully yet
  if (element && 
      !element.querySelector('svg') && 
      element.dataset.mermaidRendered !== 'true' &&
      element.dataset.mermaidRendering !== 'true') { // Not currently being rendered
    
    console.log(`Mermaid diagram ${id} exceeded ${ABSOLUTE_RENDER_TIMEOUT}ms wait time. Forcing render.`);
    
    // Find if it's still in the queue and prioritize it
    const queueIndex = mermaidQueue.findIndex(item => item.id === id);
    if (queueIndex >= 0) {
      // Move it to the front of the queue and mark it for forced render
      const item = mermaidQueue.splice(queueIndex, 1)[0];
      item.forceRenderTimeout = true; // Mark that this is a timeout-forced render
      mermaidQueue.unshift(item);
      
      // Force a render cycle with high priority
      if (!isRenderingInProgress) {
        window.renderMermaidDiagrams(true);
      }
    } else {
      // It's not in the queue, so render it directly with its source code
      const originalElement = document.querySelector(`.mermaid[data-mermaid-code][id="${id}"]`);
      if (originalElement && originalElement.dataset.mermaidCode) {
        try {
          const code = decodeURIComponent(originalElement.dataset.mermaidCode);
          const pre = document.createElement('pre');
          pre.className = 'mermaid-source-timeout-direct';
          pre.textContent = code;
          element.innerHTML = '';
          element.appendChild(pre);
          element.dataset.mermaidRendered = 'timeout-direct';
        } catch (e) {
          console.error(`Error rendering timed-out diagram ${id} directly:`, e);
        }
      }
    }
  }
}

// 优化的渲染处理逻辑，更好地与逐字输出协调
const processMermaidQueue = (force = false) => {
  // 清理现有计时器
  if (pendingRenderTimer) {
    clearTimeout(pendingRenderTimer);
    pendingRenderTimer = null;
  }
  
  // 在用户输入过程中保持安静，除非强制渲染
  if (userIsTyping && !force) {
    pendingRenderTimer = setTimeout(() => processMermaidQueue(false), renderDelayTime);
    return;
  }
  
  // 如果已经在渲染中，稍后再检查 (allow force to break through)
  if (isRenderingInProgress && !force) { 
    pendingRenderTimer = setTimeout(() => processMermaidQueue(force), 100);
    return;
  }

  if (!window.mermaidInitialized) {
    window.mermaidInitialized = true;
    
    window.renderMermaidDiagrams = (forceRender = false) => {
      if (renderFrameRequest) {
        cancelAnimationFrame(renderFrameRequest);
        renderFrameRequest = null;
      }
      
      if (mermaidQueue.length === 0) return;
      
      if (userIsTyping && !forceRender) {
        pendingRenderTimer = setTimeout(() => window.renderMermaidDiagrams(false), renderDelayTime);
        return;
      }
      
      if (forceRender && isRenderingInProgress) {
        // console.warn("Mermaid forceRender requested while another render is in progress. Queue snapshot should make this safe.");
        // Allowing it to proceed, queue snapshot below is designed to handle this.
      }

      isRenderingInProgress = true;
      
      renderFrameRequest = requestAnimationFrame(() => {
        const itemsToProcessArray = forceRender ? [...mermaidQueue] : mermaidQueue.slice(0, 1);
        if (forceRender) mermaidQueue.length = 0; 

        let processedInBatch = 0;

        function processSingleItem(item) {
          if (!item) {
            if (forceRender && processedInBatch < itemsToProcessArray.length) {
                 processSingleItem(itemsToProcessArray[processedInBatch++]);
            } else if (!forceRender && mermaidQueue.length > 0) {
                 isRenderingInProgress = false;
                 pendingRenderTimer = setTimeout(() => window.renderMermaidDiagrams(false), 50);
            } else {
                 isRenderingInProgress = false;
            }
            return;
          }
          
          const { id, code } = item;
          const currentElement = document.getElementById(id);
          const originalCodeForDisplay = item.originalCode;

          if (!currentElement) { // Element might have been removed from DOM
            processSingleItem(forceRender ? itemsToProcessArray[processedInBatch++] : mermaidQueue.shift());
            return;
          }

          // Set data-mermaid-forced on currentElement if we are force rendering this item
          if (forceRender) {
            currentElement.dataset.mermaidForced = 'true';
          }

          if ((currentElement.dataset.mermaidRendered === 'true' && !forceRender && !item.themeChangeForced)) {
            if (forceRender) currentElement.removeAttribute('data-mermaid-forced'); // Clean up if skipped but was marked
            processSingleItem(forceRender ? itemsToProcessArray[processedInBatch++] : mermaidQueue.shift());
            return;
          }
          
          if (currentElement.dataset.mermaidRendered && 
              currentElement.dataset.mermaidRendered !== 'true' && 
              currentElement.dataset.mermaidRendered !== 'pending' &&
              !forceRender && !item.themeChangeForced) {
            if (forceRender) currentElement.removeAttribute('data-mermaid-forced'); // Clean up if skipped
            processSingleItem(forceRender ? itemsToProcessArray[processedInBatch++] : mermaidQueue.shift());
            return;
          }

          let displaySourceDirectly = false;
          let sourceReason = '';

          if (forceRender && !isCompleteMermaidDiagram(code) && currentElement.dataset.mermaidRendered !== 'true') {
            displaySourceDirectly = true;
            sourceReason = 'incomplete-forced';
          } 
          else if (!item.isComplete && (Date.now() - item.addedAt > INCOMPLETE_DIAGRAM_TIMEOUT) && currentElement.dataset.mermaidRendered !== 'true') {
            displaySourceDirectly = true;
            sourceReason = 'incomplete-timeout';
          }

          if (displaySourceDirectly) {
            const pre = document.createElement('pre');
            pre.className = `mermaid-source-${sourceReason}`;
            pre.textContent = originalCodeForDisplay;
            currentElement.innerHTML = '';
            currentElement.appendChild(pre);
            currentElement.dataset.mermaidRendered = sourceReason;
            currentElement.removeAttribute('data-mermaid-rendering');
            if (forceRender) currentElement.removeAttribute('data-mermaid-forced');
            processSingleItem(forceRender ? itemsToProcessArray[processedInBatch++] : mermaidQueue.shift());
            return;
          }
          
          currentElement.dataset.mermaidRendering = 'true';
          
          const renderLogic = () => {
            renderAndCleanup(id + '-svg', code, originalCodeForDisplay)
              .then(result => {
                if (result.error || (result.incomplete && forceRender)) {
                  const pre = document.createElement('pre');
                  pre.className = result.error ? 'mermaid-source-error' : 'mermaid-source-incomplete-forced';
                  pre.textContent = result.originalCode || originalCodeForDisplay;
                  currentElement.innerHTML = '';
                  currentElement.appendChild(pre);
                  currentElement.dataset.mermaidRendered = result.error ? 'failed' : 'incomplete-forced';
                } 
                else if (result.incomplete) { 
                   currentElement.dataset.mermaidRendered = 'pending-incomplete';
                   if (!forceRender && !mermaidQueue.find(qItem => qItem.id === id)) { 
                     mermaidQueue.push(item); 
                   }
                } else if (result.svg) {
                  currentElement.innerHTML = result.svg;
                  currentElement.dataset.mermaidRendered = 'true';
                } else { 
                  const pre = document.createElement('pre');
                  pre.className = 'mermaid-source-unexpected-error';
                  pre.textContent = originalCodeForDisplay;
                  currentElement.innerHTML = '';
                  currentElement.appendChild(pre);
                  currentElement.dataset.mermaidRendered = 'failed-unexpected';
                }
                currentElement.removeAttribute('data-mermaid-rendering');
                if (forceRender) currentElement.removeAttribute('data-mermaid-forced');
                processSingleItem(forceRender ? itemsToProcessArray[processedInBatch++] : mermaidQueue.shift());
              })
              .catch(error => {
                const pre = document.createElement('pre');
                pre.className = 'mermaid-source-exception';
                pre.textContent = originalCodeForDisplay;
                currentElement.innerHTML = '';
                currentElement.appendChild(pre);
                currentElement.dataset.mermaidRendered = 'failed-exception';
                currentElement.removeAttribute('data-mermaid-rendering');
                if (forceRender) currentElement.removeAttribute('data-mermaid-forced');
                processSingleItem(forceRender ? itemsToProcessArray[processedInBatch++] : mermaidQueue.shift());
              });
          };
          
          if (forceRender) {
            renderLogic();
          } else {
            setTimeout(renderLogic, 20);
          }
        }
        
        processSingleItem(forceRender ? itemsToProcessArray[processedInBatch++] : mermaidQueue.shift());
      });
    };
  }

  // 检查队列中是否有超时的项目，优先处理它们
  const now = Date.now();
  const timeoutItems = mermaidQueue.filter(item => now >= item.mustRenderBy);
  if (timeoutItems.length > 0 && !force) {
    console.log(`Found ${timeoutItems.length} diagrams exceeding ${ABSOLUTE_RENDER_TIMEOUT}ms wait time. Forcing render.`);
    processMermaidQueue(true); // Force render everything that's timed out
    return;
  }

  // 初始渲染延迟更长，为字符流输出留出更多空间
  pendingRenderTimer = setTimeout(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.renderMermaidDiagrams(false);
      }, { once: true });
    } else {
      window.renderMermaidDiagrams(false);
    }
  }, renderDelayTime);
};

// Create throttled version of render call with longer delay
const throttledRenderMermaidDiagrams = throttle(() => {
  if (!window.mermaidInitialized || !window.renderMermaidDiagrams) {
    processMermaidQueue(false); 
  } else {
    window.renderMermaidDiagrams(false);
  }
}, 250); // MODIFIED: Reduced throttle time

// Export throttled version for external calls
export function renderMermaidDiagrams() {
  throttledRenderMermaidDiagrams();
}

// Debounce to prevent excessive theme changes
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Add back the reinitializeMermaidTheme function
export function reinitializeMermaidTheme(isDarkMode) {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'default',
      securityLevel: 'loose',
      logLevel: 'error',
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      },
      deterministicIds: true, 
      er: {
        useMaxWidth: true
      },
      fontFamily: 'sans-serif',
      fontSize: 14
    });
    
    console.log('Mermaid theme updated to:', isDarkMode ? 'dark' : 'light');
    
    // Re-render all existing diagrams with the new theme
    const diagrams = document.querySelectorAll('.mermaid[data-mermaid-code]');
    if (diagrams.length === 0) return;
    
    diagrams.forEach(element => {
      try {
        const rawOriginalCode = decodeURIComponent(element.dataset.mermaidCode);
        const mermaidId = element.id;

        if (rawOriginalCode && mermaidId) {
          // Mark as pending re-render
          element.dataset.mermaidRendered = 'pending';
          element.innerHTML = '<div class="mermaid-loading">Applying theme...</div>';

          const fixedCodeForRender = detectAndFixDiagramType(rawOriginalCode);

          // Add to the front of the queue for priority rendering
          mermaidQueue.unshift({ 
            id: mermaidId, 
            code: fixedCodeForRender, 
            originalCode: rawOriginalCode,
            addedAt: Date.now() - 10000 // Prioritize by making it look older
          });
        }
      } catch (err) {
        console.error("Error preparing diagram for theme change:", err);
      }
    });
    
    // Force render the diagrams after theme change
    processMermaidQueue(true);
  } catch (error) {
    console.error('Mermaid theme update failed:', error);
  }
}

// 修改加入队列的方式
export default function mermaidPlugin(md) {
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);

  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const rawCode = token.content.trim(); 
    
    if (token.info === 'mermaid') {
      const mermaidId = `mermaid-${uuidv4()}`;
      
      // 检查是否是完整的图表
      const isComplete = isCompleteMermaidDiagram(rawCode);
      
      // 可能的修复后的代码
      const potentiallyFixedCode = detectAndFixDiagramType(rawCode);
      
      // 根据完整性设置不同的CSS类
      const completionClass = isComplete ? 'mermaid-complete' : 'mermaid-incomplete';
      
      // 添加到队列时包含完整性信息
      const queueItem = { 
        id: mermaidId, 
        code: potentiallyFixedCode, 
        originalCode: rawCode,
        isComplete: isComplete
      };
      
      // 使用新的添加队列方法
      addToMermaidQueue(queueItem);
      
      // 创建占位符，显示不同的加载状态信息
      const placeholderHeight = Math.max(100, rawCode.split('\n').length * 20); // 估计高度
      const loadingMessage = isComplete ? '图表加载中...' : '等待图表内容完成...';
      
      const result = `
        <div class="mermaid-wrapper ${completionClass}">
          <div class="mermaid-container">
            <div class="mermaid-header">
              <span class="mermaid-label">mermaid</span>
              <button class="copy-btn" data-code="${encodeURIComponent(rawCode)}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <div class="mermaid" id="${mermaidId}" data-mermaid-code="${encodeURIComponent(rawCode)}" data-mermaid-complete="${isComplete}" style="min-height:${placeholderHeight}px;">
              <div class="mermaid-loading">${loadingMessage}</div>
            </div>
          </div>
        </div>
      `;
      
      // 每个图表都尽快开始处理。对于不完整的图表，也许会在后续更新中完成，但至少会在ABSOLUTE_RENDER_TIMEOUT后强制渲染/展示源码
      processMermaidQueue(false);
      
      return result;
    }
    
    return defaultFence(tokens, idx, options, env, slf);
  };
}

// Set up MutationObserver for fallback cleanup of raw error SVGs from Mermaid itself
setTimeout(() => {
  const observer = new MutationObserver(function(mutations) {
    const errorSvgs = document.querySelectorAll('svg[aria-roledescription="error"]');
    if (errorSvgs.length > 0) {
      console.warn(`Found ${errorSvgs.length} unexpected error SVG elements from Mermaid. Removing them.`);
      errorSvgs.forEach(svg => {
        const parent = svg.parentElement;
        if (parent && parent.contains(svg)) {
          parent.removeChild(svg);
        }
      });
    }
  });
  const config = { 
    childList: true,    
    subtree: true       
  };
  observer.observe(document.body, config);
  console.log("Mermaid plugin: DOM change monitor for error SVGs activated.");
}, 2000); 