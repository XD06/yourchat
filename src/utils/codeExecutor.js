/**
 * Code Executor Utility
 * Provides functionality to execute HTML code in a sandboxed iframe
 */

// Timeout duration for code execution (in milliseconds)
const EXECUTION_TIMEOUT_MS = 8000;

const MIN_MODAL_WIDTH_PX = 400;
const MAX_MODAL_WIDTH_PERCENT = 90;
const MIN_MODAL_HEIGHT_PX = 300;
const MAX_MODAL_HEIGHT_PERCENT = 90;

let executionTimeoutId = null;
let currentConsoleLogs = [];
let messageListener = null;

/**
 * Initialize the code execution modal if it doesn't exist
 * @returns {HTMLElement} The modal container element
 */
function initializeModal() {
  let modalContainer = document.getElementById('code-execution-modal');
  console.log('Modal container before init:', modalContainer);
  if (!modalContainer) {
    console.log('Creating new modal container');
    modalContainer = document.createElement('div');
    modalContainer.id = 'code-execution-modal';
    modalContainer.className = 'code-modal';
    document.body.appendChild(modalContainer);
    
    // Create modal content - 更新状态指示器样式
    const modalContent = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>代码预览 <span id="status-indicator" class="status-indicator"></span></h3>
          <div class="modal-actions">
            <span class="fullscreen-btn" id="modal-fullscreen-btn">⛶</span>
            <span class="close-btn" id="modal-close-btn">×</span>
          </div>
        </div>
        <div class="modal-body">
          <iframe id="code-sandbox"></iframe>
        </div>
      </div>
    `;
    modalContainer.innerHTML = modalContent;
    
    // 添加状态指示器样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .status-indicator {
        display: inline-block;
        margin-left: 10px;
        font-size: 12px;
        font-weight: normal;
        padding: 2px 8px;
        border-radius: 10px;
        color: white;
        transition: all 0.3s ease;
        opacity: 0;
      }
      .status-indicator.success {
        background-color: #52c41a;
        opacity: 1;
      }
      .status-indicator.error {
        background-color: #f5222d;
        opacity: 1;
      }
      .status-indicator.running {
        background-color: #1890ff;
        opacity: 1;
      }
      .status-indicator.timeout {
        background-color: #fa8c16;
        opacity: 1;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Add event listeners
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('modal-fullscreen-btn').addEventListener('click', toggleFullscreen);
    
    // Add ESC key handler
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalContainer.classList.contains('show')) {
        closeModal();
      }
    });

    // We won't add inline styles here - the CSS is already in main.scss
    // But we'll make sure the default style is correct
    modalContainer.style.opacity = '0';
    modalContainer.style.visibility = 'hidden';
  }
  
  console.log('Modal container after init:', modalContainer);
  return modalContainer;
}

/**
 * Open the modal and execute the provided HTML code
 * @param {string} code - The HTML code to execute
 */
export function openCodeModal(code) {
  console.log('Opening code modal with code:', code.substring(0, 50) + '...');
  // Initialize and show modal
  const modalContainer = initializeModal();
  
  // Reset the display style to match SCSS style expectations
  // Set display to flex
  modalContainer.style.display = 'flex';
  
  // Use setTimeout to ensure display:flex is applied before adding show class
  // This prevents animation issues
  setTimeout(() => {
    // Add show class for visibility and opacity animation
    modalContainer.classList.add('show');
    // Remove inline opacity/visibility styles to let CSS take over
    modalContainer.style.opacity = '';
    modalContainer.style.visibility = '';
    
    console.log('Modal container now visible. Classes:', modalContainer.className);
  }, 10);
  
  // Execute the code
  executeCode(code);
}

/**
 * Close the code execution modal
 */
export function closeModal() {
  const modal = document.getElementById('code-execution-modal');
  if (modal) {
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    // Remove show class first for animation
    modal.classList.remove('show');
    // Then hide after transition completes
    setTimeout(() => {
    modal.style.display = 'none';
    }, 300); // Match the transition time in SCSS (0.3s)
    
    // Clear iframe content
    const sandbox = document.getElementById('code-sandbox');
    if (sandbox) {
      sandbox.src = 'about:blank';
      sandbox.removeAttribute('srcdoc');
    }
    
    // Clear timeout
    if (executionTimeoutId) {
      clearTimeout(executionTimeoutId);
    }
    
    // Remove message listener
    if (messageListener) {
      window.removeEventListener('message', messageListener);
      messageListener = null;
    }
    
    // Remove resize listener
    window.removeEventListener('resize', resizeModal);
  }
}

/**
 * Toggle fullscreen mode for the modal
 */
function toggleFullscreen() {
  const modal = document.getElementById('code-execution-modal');
  if (!document.fullscreenElement) {
    // Enter fullscreen
    if (modal.requestFullscreen) {
      modal.requestFullscreen();
    } else if (modal.webkitRequestFullscreen) {
      modal.webkitRequestFullscreen();
    } else if (modal.msRequestFullscreen) {
      modal.msRequestFullscreen();
    }
    modal.classList.add('fullscreen');
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    modal.classList.remove('fullscreen');
  }
}

/**
 * Resize the modal and its content based on iframe content and viewport size.
 * This function primarily sets the overall constraints for the modal.
 * The internal layout (header, body, iframe, status-bar) should be handled by CSS flexbox.
 */
function resizeModal() {
  const modalContainer = document.getElementById('code-execution-modal');
  if (!modalContainer || modalContainer.style.display === 'none') {
    return;
  }

  const modalContentDiv = modalContainer.querySelector('.modal-content');
  if (!modalContentDiv) return;

  if (document.fullscreenElement === modalContainer) {
    // In fullscreen, CSS for .fullscreen class should handle sizing.
    // Reset any inline styles that might conflict.
    modalContentDiv.style.width = '';
    modalContentDiv.style.height = '';
    modalContentDiv.style.minWidth = '';
    modalContentDiv.style.maxWidth = '';
    modalContentDiv.style.minHeight = '';
    modalContentDiv.style.maxHeight = '';
    return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate width constraints
  const minWidth = MIN_MODAL_WIDTH_PX;
  const calculatedMaxWidth = viewportWidth * (MAX_MODAL_WIDTH_PERCENT / 100);
  const maxWidth = Math.max(minWidth, calculatedMaxWidth); // Ensure maxWidth is at least minWidth

  // Calculate height constraints
  const minHeight = MIN_MODAL_HEIGHT_PX;
  const calculatedMaxHeight = viewportHeight * (MAX_MODAL_HEIGHT_PERCENT / 100);
  const maxHeight = Math.max(minHeight, calculatedMaxHeight); // Ensure maxHeight is at least minHeight
  
  // Set constraints on the modal-content div
  modalContentDiv.style.minWidth = `${minWidth}px`;
  modalContentDiv.style.maxWidth = `${maxWidth}px`;
  modalContentDiv.style.minHeight = `${minHeight}px`;
  modalContentDiv.style.maxHeight = `${maxHeight}px`;

  const sandbox = document.getElementById('code-sandbox');
  if (sandbox) {
    try {
      if (sandbox.contentWindow && sandbox.contentWindow.document && sandbox.contentWindow.document.body) {
        // const iframeContentHeight = sandbox.contentWindow.document.body.scrollHeight;
        // CSS flexbox is preferred for iframe height management within modal-body.
      }
    } catch (e) {
      // console.warn('Could not access iframe scrollHeight for resizing:', e);
    }
  }
}

/**
 * Execute HTML code in the sandbox iframe
 * @param {string} code - The HTML code to execute
 */
function executeCode(code) {
  const sandbox = document.getElementById('code-sandbox');
  const statusIndicator = document.getElementById('status-indicator');
  
  // Initialize
  currentConsoleLogs = []; // 保留这个以防将来需要
  
  // 设置初始状态
  updateStatusIndicator('运行中...', 'running');
  
  // Reset iframe
  sandbox.src = 'about:blank';
  
  // Clear previous timeout
  if (executionTimeoutId) {
    clearTimeout(executionTimeoutId);
  }
  
  // 仍然设置超时但使用更好的状态显示
  executionTimeoutId = setTimeout(() => {
    updateStatusIndicator('执行超时', 'timeout');
  }, EXECUTION_TIMEOUT_MS);
  
  // Remove previous message listener
  if (messageListener) {
    window.removeEventListener('message', messageListener);
  }
  
  // 简化消息监听器，只处理错误和必要的事件
  messageListener = function(event) {
    if (event.source !== sandbox.contentWindow) {
      return;
    }

    const { type, detail } = event.data;

    switch (type) {
      case 'error':
        clearTimeout(executionTimeoutId);
        updateStatusIndicator('执行出错', 'error');
        console.error("沙盒错误:", detail);
        break;

      case 'potential_completion':
          clearTimeout(executionTimeoutId);
        updateStatusIndicator('执行成功', 'success');
        break;

      case 'content_changed':
        resizeModalBasedOnContent();
        break;
    }
  };
  
  window.addEventListener('message', messageListener);
  
  // Load sandbox content
  setTimeout(() => {
    sandbox.srcdoc = createSandboxHtml(code);
    
    // Adjust size when iframe loads
    sandbox.onload = () => {
      resizeModalBasedOnContent();
      window.addEventListener('resize', resizeModal);
    };
  }, 50);
}

/**
 * Resize the modal based on iframe content
 */
function resizeModalBasedOnContent() {
  try {
    const sandbox = document.getElementById('code-sandbox');
    if (!sandbox) return;
    
    const modalContent = document.querySelector('.modal-content');
    const modalHeaderHeight = document.querySelector('.modal-header').offsetHeight;

    // 设置一个固定尺寸，避免抖动
    const maxWidth = 800;
    const maxHeight = 600;
    const minWidth = 300;
    const minHeight = 200;

    // 使用一个初始尺寸，避免内容加载时的抖动
    if (!modalContent.dataset.initialized) {
      // 第一次设置一个合理的默认尺寸
      modalContent.style.width = `${Math.min(650, window.innerWidth * 0.8)}px`;
      modalContent.style.height = `${Math.min(500, window.innerHeight * 0.7)}px`;
      modalContent.dataset.initialized = "true";
      return;
    }

    try {
      // 尝试读取iframe内容尺寸，但仅在内容完全加载后才应用
      const iframeDoc = sandbox.contentDocument || sandbox.contentWindow.document;
      if (iframeDoc && iframeDoc.body && iframeDoc.readyState === 'complete') {
        const contentHeight = iframeDoc.body.scrollHeight;
        const contentWidth = iframeDoc.body.scrollWidth;

        // 防止频繁调整导致的抖动
        if (Math.abs(contentWidth - parseInt(modalContent.style.width)) > 50 ||
            Math.abs(contentHeight - parseInt(modalContent.style.height)) > 50) {
          
          const newWidth = Math.min(Math.max(contentWidth + 40, minWidth), maxWidth);
          const newHeight = Math.min(Math.max(contentHeight + modalHeaderHeight + 20, minHeight), maxHeight);

          // 平滑过渡
          modalContent.style.transition = "width 0.3s, height 0.3s";
          modalContent.style.width = `${newWidth}px`;
          modalContent.style.height = `${newHeight}px`;
          
          // 300ms后移除过渡效果，避免后续调整的动画
          setTimeout(() => {
            modalContent.style.transition = "";
          }, 300);
        }
      }
    } catch (e) {
      console.warn('Failed to read iframe content dimensions', e);
    }
  } catch (error) {
    console.error('调整模态框大小失败:', error);
  }
}

/**
 * Create HTML for the sandbox iframe
 * @param {string} userCode - The user's HTML code
 * @returns {string} - The complete HTML document for the iframe
 */
function createSandboxHtml(userCode) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code Sandbox</title>
      <style>
        /* 美化样式 */
        body {
          margin: 0;
          padding: 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
        }
        
        /* Modern Scrollbar Styles for iframe content */
        body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        body::-webkit-scrollbar-track {
          background: transparent;
        }
        body::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        body::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
        /* For Firefox */
        body {
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }
        
        /* 添加内容区域的边框，使视觉效果更好 */
        .content-wrapper {
          border: 1px dashed #e0e0e0;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        /* 添加一些基本样式重置，避免常见的HTML样式问题 */
        img { max-width: 100%; height: auto; }
        
        /* 添加基本响应式支持 */
        @media (max-width: 600px) {
          body { padding: 5px; }
        }
      </style>
      <script>
        // 简化通信功能
        const post = (type, detail) => {
          try {
            window.parent.postMessage({ type, detail }, '*');
          } catch (e) {
            console.error('postMessage failed:', e);
          }
        };

        let executionCompleted = false;
        let internalTimeout = null;

        // 错误处理
        window.onerror = (message, source, lineno, colno, error) => {
          clearTimeout(internalTimeout);
          if (!executionCompleted) {
            executionCompleted = true;
            post('error', { message: \`\${message} (at \${source?.split('/').pop()}:\${lineno}:\${colno})\`, stack: error?.stack });
          }
          return true;
        };

        // 异步错误处理
        window.addEventListener('unhandledrejection', (event) => {
          clearTimeout(internalTimeout);
          if (!executionCompleted) {
            executionCompleted = true;
            post('error', { message: 'Unhandled Promise Rejection', reason: String(event.reason) });
          }
        });

        // 监听DOM变化
        window.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            const observer = new MutationObserver(() => post('content_changed'));
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
          }
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => post('content_changed'));

        // 通知准备就绪
        post('sandbox_ready');

        // 设置超时保护
        internalTimeout = setTimeout(() => {
          if (!executionCompleted) post('potential_completion');
        }, ${EXECUTION_TIMEOUT_MS - 500});
      </script>
    </head>
    <body>
      ${userCode}
      <script>
        // 执行完成信号
        setTimeout(() => {
          clearTimeout(internalTimeout);
          if (!executionCompleted) {
            executionCompleted = true;
            post('potential_completion');
          }
        }, 0);
      </script>
    </body>
    </html>
  `;
}

/**
 * 更新状态指示器
 * @param {string} message - 状态消息
 * @param {string} type - 状态类型 (running, success, error, timeout)
 */
function updateStatusIndicator(message, type) {
  const statusIndicator = document.getElementById('status-indicator');
  if (!statusIndicator) return;
  
  // 移除所有状态类
  statusIndicator.classList.remove('success', 'error', 'running', 'timeout');
  
  // 添加新状态类
  statusIndicator.classList.add(type);
  
  // 设置文本内容
  statusIndicator.textContent = message;
}