/**
 * 自定义Markdown扩展 - 提供增强的Markdown渲染功能
 */

/**
 * 添加文件树渲染支持
 * @param {MarkdownIt} md - markdown-it实例
 */
export function addFileTreeSupport(md) {
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);
  
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const langName = token.info.trim().toLowerCase();
    
    // 处理文件树代码块
    if (langName === 'filetree') {
      return renderFileTree(token.content);
    }
    
    // 对于其他代码块，使用默认渲染器
    return defaultFence(tokens, idx, options, env, self);
  };
}

/**
 * 渲染文件树
 * @param {string} content - 文件树内容
 * @returns {string} - 渲染后的HTML
 */
function renderFileTree(content) {
  if (!content) return '<div class="file-tree"></div>';
  
  const lines = content.split('\n').filter(line => line.trim());
  let html = '<div class="file-tree">';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    const indentLevel = line.search(/\S|$/) / 2; // 假设每个缩进是2个空格
    const isFolder = trimmedLine.endsWith('/');
    
    const itemClass = isFolder ? 'folder' : 'file';
    const icon = isFolder ? '📁' : '📄';
    const itemName = trimmedLine.replace(/\/$/, '');
    
    html += `<div class="tree-item ${itemClass}" style="padding-left: ${20 + indentLevel * 20}px">
      <span class="tree-label">${icon} ${itemName}</span>
    </div>`;
  });
  
  html += '</div>';
  return html;
}

/**
 * 添加可折叠详情块支持
 * @param {MarkdownIt} md - markdown-it实例
 */
export function addDetailsSupport(md) {
  // 标记detailsBlock的开始
  md.block.ruler.before('fence', 'details', (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];
    
    // 检查是否匹配:::details 模式
    if (maxPos - startPos < 11) return false;
    if (state.src.slice(startPos, startPos + 3) !== ':::') return false;
    
    const detailsMatch = state.src.slice(startPos + 3, maxPos).trim().match(/^(details)\s+(.*)/);
    if (!detailsMatch) return false;
    
    // 如果是在验证模式下，直接返回true
    if (silent) return true;
    
    // 查找结束标记 :::
    let nextLine = startLine + 1;
    let found = false;
    
    while (nextLine < endLine) {
      const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const lineMax = state.eMarks[nextLine];
      
      if (lineStart < lineMax && state.src.slice(lineStart, lineStart + 3) === ':::') {
        found = true;
        break;
      }
      
      nextLine++;
    }
    
    if (!found) {
      // 没有找到结束标记，将这一行作为普通文本处理
      return false;
    }
    
    // 创建Details标记
    const title = detailsMatch[2] || 'Details';
    const detailsToken = state.push('details_open', 'div', 1);
    detailsToken.attrSet('class', 'details-wrapper');
    detailsToken.markup = ':::';
    
    // 创建Summary标记
    const summaryToken = state.push('summary_open', 'div', 1);
    summaryToken.attrSet('class', 'details-summary');
    summaryToken.attrSet('onclick', 'this.classList.toggle(\'open\'); this.nextElementSibling.classList.toggle(\'open\')');
    summaryToken.markup = '';
    
    // 创建Summary内容
    const summaryContentToken = state.push('inline', '', 0);
    summaryContentToken.content = title;
    summaryContentToken.children = [];
    
    // 闭合Summary
    state.push('summary_close', 'div', -1);
    
    // 创建Content容器
    const contentToken = state.push('content_open', 'div', 1);
    contentToken.attrSet('class', 'details-content');
    contentToken.markup = '';
    
    // 处理Details内部的内容
    const contentStartLine = startLine + 1;
    const contentEndLine = nextLine;
    
    // 将内部内容设置为需要由md解析的token
    const contentToken2 = state.push('fence', 'div', 0);
    contentToken2.hidden = true;
    
    // 提取内部内容
    const content = state.getLines(contentStartLine, contentEndLine, state.tShift[startLine], false).trim();
    state.md.block.parse(content, state.md, state.env, state.tokens);
    
    // 闭合Content和Details
    state.push('content_close', 'div', -1);
    state.push('details_close', 'div', -1);
    
    // 更新解析位置
    state.line = nextLine + 1;
    return true;
  });
}

/**
 * 添加键盘样式支持
 * @param {MarkdownIt} md - markdown-it实例
 */
export function addKeyboardSupport(md) {
  // 添加 <kbd>Ctrl</kbd> 支持
  const defaultInlineRule = md.renderer.rules.text || function(tokens, idx) {
    return tokens[idx].content;
  };
  
  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    const text = tokens[idx].content;
    // 匹配 <kbd>text</kbd> 模式
    const processed = text.replace(/<kbd>(.*?)<\/kbd>/gi, (match, content) => {
      return `<kbd>${content}</kbd>`;
    });
    
    if (processed !== text) {
      return processed;
    }
    
    return defaultInlineRule(tokens, idx, options, env, self);
  };
}

/**
 * 注册所有Markdown扩展
 * @param {MarkdownIt} md - markdown-it实例
 */
export function registerAllExtensions(md) {
  addFileTreeSupport(md);
  addDetailsSupport(md);
  addKeyboardSupport(md);
}

export default registerAllExtensions; 