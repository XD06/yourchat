import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
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
// 导出渲染函数
export const renderMarkdown = (content) => {
  if (content === undefined || content === null) {
    return ''
  }
  return md.render(content.toString())
}
