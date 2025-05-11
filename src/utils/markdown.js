import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaidPlugin from './mermaid-plugin'
import taskLists from 'markdown-it-task-lists'
import { registerAllExtensions } from './markdownExtensions'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // 对于mermaid代码块跳过高亮，由mermaid插件处理
    if (lang === 'mermaid') {
      return str;
    }
    
    if (lang && hljs.getLanguage(lang)) {
      try {
        // 使用预处理机制，避免代码块突然出现导致的卡顿
        // 统计代码行数，提前计算高度
        const lines = str.split('\n');
        const lineCount = lines.length;
        const minHeight = lineCount * 21 + 20; // 估算高度：每行21px + 边距

        // 使用内联样式预设高度，避免布局抖动
        const preClass = `code-block pre-sized`;
        
        // 延迟高亮处理，先显示原始代码
        const highlighted = hljs.highlight(str, { 
          language: lang, 
          ignoreIllegals: true 
        }).value;
        
        // 添加语言标识和复制按钮，保持与ChatMessage.vue一致
        // 为HTML代码块添加运行按钮
        const isHtml = lang.toLowerCase() === 'html';
        let headerContent = `<span class="code-lang">${lang}</span>
          <div class="code-actions">`;
        
        // 只为HTML代码块添加运行按钮
        if (isHtml) {
          headerContent += `
            <button class="run-btn" title="在沙盒中运行代码">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>`;
        }
        
        // 所有代码块都有复制按钮
        headerContent += `
            <button class="copy-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>`;
        
        // 添加 data-line-count 属性，用于进一步优化渲染
        return `<pre class="${preClass}" data-lang="${lang}" data-line-count="${lineCount}" style="min-height:${minHeight}px">
          <div class="code-header">
            ${headerContent}
          </div>
          <code>${highlighted}</code>
        </pre>`;
      } catch (__) {}
    }
    
    // 无法识别语言时，使用相同的结构以保持一致性
    const lines = str.split('\n');
    const lineCount = lines.length;
    const minHeight = lineCount * 21 + 20; // 估算高度：每行21px + 边距
    
    return `<pre class="code-block pre-sized" data-lang="plaintext" data-line-count="${lineCount}" style="min-height:${minHeight}px">
      <div class="code-header">
        <span class="code-lang">plaintext</span>
        <div class="code-actions">
        <button class="copy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        </div>
      </div>
      <code>${md.utils.escapeHtml(str)}</code>
    </pre>`;
  }
})

// 添加任务列表支持
md.use(taskLists, {
  enabled: true,
  label: true,
  labelAfter: true
})

// 添加Mermaid支持
md.use(mermaidPlugin)

// 注册所有自定义扩展
registerAllExtensions(md)

// 自定义引用块渲染器来支持不同类型的提示
const defaultRender = md.renderer.rules.blockquote_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.blockquote_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const nextToken = tokens[idx + 1];
  
  // 检查是否包含特殊标记
  if (nextToken && nextToken.type === 'paragraph_open' && tokens[idx + 2] && tokens[idx + 2].type === 'inline') {
    const content = tokens[idx + 2].content;
    
    // 先清理内容，去除前后空格
    const trimmedContent = content.trim();
    
    // 增强的正则表达式，更灵活地匹配各种格式
    // 1. 可选的感叹号前缀
    // 2. 类型标识符 (info|warning|error)
    // 3. 可选的冒号（中英文都支持）
    // 4. 剩余所有内容作为实际内容
    const match = trimmedContent.match(/^\s*!?\s*(info|warning|error)\s*[:：]?\s*([\s\S]*)/i);
    
    if (match) {
      const type = match[1].toLowerCase();
      // 确保内容不为空
      const actualContent = match[2] ? match[2].trim() : '';
      
      // 调试信息，可在生产环境移除
      console.log('提示框类型:', type, '原始内容:', JSON.stringify(trimmedContent), '处理后:', JSON.stringify(actualContent));
      
      // 更新内容
      tokens[idx + 2].content = actualContent;
      token.attrJoin('class', type);
    }
  }
  
  return defaultRender(tokens, idx, options, env, self);
};

// 直接处理数学公式
function renderMathFormulas(html) {
  // 创建占位符数组
  const mathBlocks = [];
  
  // 标记代码块，防止处理代码块内的数学公式
  const codeBlocks = [];
  html = html.replace(/<pre class="code-block.*?"[\s\S]*?<\/pre>/g, (match) => {
    const placeholder = `CODE_BLOCK_${codeBlocks.length}`;
    codeBlocks.push({ placeholder, content: match });
    return placeholder;
  });
  
  // 标记Mermaid图表，防止处理图表内的符号
  const mermaidBlocks = [];
  html = html.replace(/<div class="mermaid-wrapper">[\s\S]*?<\/div>/g, (match) => {
    const placeholder = `MERMAID_BLOCK_${mermaidBlocks.length}`;
    mermaidBlocks.push({ placeholder, content: match });
    return placeholder;
  });
  
  // 处理块级公式 $$ ... $$ 或 [ ... ]
  html = html.replace(/\$\$([\s\S]*?)\$\$|\[([\s\S]*?)\]/g, (match, formula1, formula2) => {
    const formula = formula1 || formula2;
    if (!formula || formula.trim() === '') return match;
    
    // 检查是否有明显的数学公式特征
    if (formula.includes('\\') || 
        formula.match(/[\^_{}]/) || 
        formula.match(/[+\-*=<>]/) || 
        formula.match(/\\[a-zA-Z]/) ||
        formula.match(/\$/) ||
        formula.match(/\{.*\}/) ||
        formula.match(/\\frac/) ||
        formula.match(/\\sum/) ||
        formula.match(/\\int/)) {
      try {
        // 生成唯一占位符
        const placeholder = `MATH_BLOCK_${mathBlocks.length}`;
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          errorColor: '#FF0000',
          output: 'html',
          trust: true
        });
        mathBlocks.push({ placeholder, rendered });
        return placeholder;
      } catch (error) {
        console.error('KaTeX display error:', error);
        // 提供优雅的错误显示而不是保留原始文本
        const placeholder = `MATH_BLOCK_ERROR_${mathBlocks.length}`;
        const errorMessage = `<div class="katex-error">公式渲染错误: ${error.message}</div>`;
        mathBlocks.push({ placeholder, rendered: errorMessage });
        return placeholder;
      }
    }
    
    return match;
  });
  
  // 处理行内公式 $ ... $ 或 (...) - 需要更严格的检测
  html = html.replace(/\$(.*?)\$|\((.*?)\)/g, (match, formula1, formula2) => {
    const formula = formula1 || formula2;
    if (!formula || formula.trim() === '') return match;
    
    // 跳过明显不是公式的情况
    if (formula.includes(' ') && !formula.match(/[\^_{}\\]/) && !formula.match(/[+\-*=<>]/)) {
      return match;
    }
    
    // 检测是否有数学公式特征
    if (formula.includes('\\') || 
        formula.match(/[\^_{}]/) || 
        formula.match(/\\[a-zA-Z]/) ||
        formula.match(/\{.*\}/) ||
        formula.match(/\\frac/) ||
        formula.match(/\\alpha/) ||
        formula.match(/\\beta/) ||
        formula.match(/\\gamma/) ||
        formula.match(/\\delta/)) {
      try {
        // 生成唯一占位符
        const placeholder = `MATH_INLINE_${mathBlocks.length}`;
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          errorColor: '#FF0000',
          output: 'html',
          trust: true
        });
        mathBlocks.push({ placeholder, rendered });
        return placeholder;
      } catch (error) {
        console.error('KaTeX inline error:', error);
        // 提供更优雅的错误显示
        const placeholder = `MATH_INLINE_ERROR_${mathBlocks.length}`;
        const errorMessage = `<span class="katex-inline-error">${formula}</span>`;
        mathBlocks.push({ placeholder, rendered: errorMessage });
        return placeholder;
      }
    }
    
    return match;
  });
  
  // 替换占位符为渲染后的公式
  mathBlocks.forEach(block => {
    const isError = block.placeholder.includes('ERROR');
    
    // 不对错误块应用额外包装，直接使用错误消息
    if (isError) {
      html = html.replace(block.placeholder, block.rendered);
      return;
    }
    
    // 为行内公式添加特殊样式类
    if (block.placeholder.startsWith('MATH_INLINE')) {
      // 确保渲染结果有类名 katex-inline
      if (!block.rendered.includes('class="katex-inline"')) {
        // 在katex的外层包一个span，添加katex-inline类
        block.rendered = `<span class="katex-inline">${block.rendered}</span>`;
      }
    }
    
    // 为块级公式添加特殊样式类
    if (block.placeholder.startsWith('MATH_BLOCK')) {
      // 确保渲染结果有类名 katex-display
      if (!block.rendered.includes('class="katex-display"')) {
        // 在katex的外层包一个div，添加katex-display类
        block.rendered = `<div class="katex-display">${block.rendered}</div>`;
      }
    }
    
    html = html.replace(block.placeholder, block.rendered);
  });
  
  // 恢复Mermaid图表
  mermaidBlocks.forEach(block => {
    html = html.replace(block.placeholder, block.content);
  });
  
  // 恢复代码块
  codeBlocks.forEach(block => {
    html = html.replace(block.placeholder, block.content);
  });
  
  return html;
}

// 优化的渲染函数，支持更流畅的输出
export const renderMarkdown = (content, options = {}) => {
  if (!content) return '';
  
  // 使用提供的自定义渲染器（如果指定）
  const renderer = options.useCustomRenderer && options.md ? options.md : md;
  
  try {
    // 检查是否需要延迟渲染代码块
    const smoothOutput = options.smoothOutput !== false;
    
    // 首次渲染 - 将 markdown 转换为 HTML
    let html = renderer.render(content);
  
    // 处理数学公式
  html = renderMathFormulas(html);
  
    // 标记代码块，添加初始隐藏状态以避免布局变化
    if (smoothOutput) {
      const codeBlockRegex = /<pre class="code-block.*?".*?>([\s\S]*?)<\/pre>/g;
      html = html.replace(codeBlockRegex, (match, innerContent) => {
        // 为代码块添加渐进渲染标记
        return match.replace('<pre', '<pre data-render="pending"');
      });
    }
  
  return html;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return `<div class="markdown-error">Error rendering content: ${error.message}</div>`;
  }
}

// 添加一个新函数用于延迟处理代码块
export const processPendingCodeBlocks = () => {
  // 查找所有待处理的代码块
  const pendingBlocks = document.querySelectorAll('pre[data-render="pending"]');
  
  if (pendingBlocks.length === 0) return;
  
  // 使用RAF和批处理来平滑处理
  requestAnimationFrame(() => {
    // 每次处理一小批代码块，减少性能影响
    const batchSize = Math.min(5, pendingBlocks.length);
    for (let i = 0; i < batchSize; i++) {
      if (pendingBlocks[i]) {
        pendingBlocks[i].removeAttribute('data-render');
        // 添加可见性类，可以通过CSS添加平滑过渡
        pendingBlocks[i].classList.add('code-visible');
      }
    }
    
    // 如果还有剩余的代码块，稍后继续处理
    if (pendingBlocks.length > batchSize) {
      setTimeout(processPendingCodeBlocks, 50);
    }
  });
};

// 导出处理函数以便在需要时调用
export default {
  md,
  renderMarkdown,
  processPendingCodeBlocks
};
