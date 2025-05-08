import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaidPlugin from './mermaid-plugin'
import taskLists from 'markdown-it-task-lists'

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
        const highlighted = hljs.highlight(str, { 
          language: lang, 
          ignoreIllegals: true 
        }).value
        // 添加语言标识和复制按钮，保持与ChatMessage.vue一致
        return `<pre class="code-block" data-lang="${lang}">
          <div class="code-header">
          <span class="code-lang">${lang}</span>
            <button class="copy-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          <code>${highlighted}</code>
        </pre>`
      } catch (__) {}
    }
    // 无法识别语言时，使用相同的结构以保持一致性
    return `<pre class="code-block" data-lang="plaintext">
      <div class="code-header">
        <span class="code-lang">plaintext</span>
        <button class="copy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <code>${md.utils.escapeHtml(str)}</code>
    </pre>`
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
    
    if (content.startsWith('!info')) {
      tokens[idx + 2].content = content.replace(/^!info\s+/, '');
      token.attrJoin('class', 'info');
    } else if (content.startsWith('!warning')) {
      tokens[idx + 2].content = content.replace(/^!warning\s+/, '');
      token.attrJoin('class', 'warning');
    } else if (content.startsWith('!error')) {
      tokens[idx + 2].content = content.replace(/^!error\s+/, '');
      token.attrJoin('class', 'error');
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
  html = html.replace(/<pre class="code-block"[\s\S]*?<\/pre>/g, (match) => {
    const placeholder = `CODE_BLOCK_${codeBlocks.length}`;
    codeBlocks.push({ placeholder, content: match });
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
          errorColor: '#FF0000'
        });
        mathBlocks.push({ placeholder, rendered });
        return placeholder;
      } catch (error) {
        console.error('KaTeX display error:', error);
        return match;
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
          errorColor: '#FF0000'
        });
        mathBlocks.push({ placeholder, rendered });
        return placeholder;
      } catch (error) {
        console.error('KaTeX inline error:', error);
        return match;
      }
    }
    
    return match;
  });
  
  // 替换占位符为渲染后的公式
  mathBlocks.forEach(block => {
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
  
  // 恢复代码块
  codeBlocks.forEach(block => {
    html = html.replace(block.placeholder, block.content);
  });
  
  return html;
}

// 导出渲染函数
export const renderMarkdown = (content) => {
  if (content === undefined || content === null) {
    return '';
  }
  
  // 首先处理markdown
  let html = md.render(content.toString());
  
  // 然后处理数学公式
  html = renderMathFormulas(html);
  
  // 给表格添加容器
  html = html.replace(/<table>/g, '<div class="table-container"><table>');
  html = html.replace(/<\/table>/g, '</table></div>');
  
  return html;
}
