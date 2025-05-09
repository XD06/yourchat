<template>
  <div class="mermaid-error-test">
    <h2>Mermaid 错误处理测试</h2>
    <p>这个组件测试Mermaid图表的错误处理和自动修复能力。</p>

    <div class="test-section">
      <h3>1. 未闭合括号修复</h3>
      <div class="test-description">
        <p>测试自动修复未闭合的节点括号。</p>
        <div class="code-before">
          <pre>A[开始节点 --> B{判断} --> C[结果]</pre>
        </div>
      </div>
      <div v-html="renderMarkdown(unclosedBrackets)"></div>
    </div>

    <div class="test-section">
      <h3>2. 节点与括号之间的空格</h3>
      <div class="test-description">
        <p>测试自动修复节点名与括号之间的空格。</p>
        <div class="code-before">
          <pre>A [开始] --> B (处理) --> C {判断}</pre>
        </div>
      </div>
      <div v-html="renderMarkdown(nodeSpacing)"></div>
    </div>

    <div class="test-section">
      <h3>3. 箭头标签管道符修复</h3>
      <div class="test-description">
        <p>测试自动修复箭头标签的管道符。</p>
        <div class="code-before">
          <pre>A --> |是 B
C --> |否 D</pre>
        </div>
      </div>
      <div v-html="renderMarkdown(arrowLabels)"></div>
    </div>

    <div class="test-section">
      <h3>4. 图表类型缺失</h3>
      <div class="test-description">
        <p>测试自动添加缺失的图表类型。</p>
        <div class="code-before">
          <pre>TD
  A[开始] --> B[处理]
  B --> C[结束]</pre>
        </div>
      </div>
      <div v-html="renderMarkdown(missingDiagramType)"></div>
    </div>

    <div class="test-section">
      <h3>5. 混合多种错误</h3>
      <div class="test-description">
        <p>测试处理多种混合的错误。</p>
        <div class="code-before">
          <pre>A [开始节点 --> B{判断
B ---> |是 C[结果1]
B ---> |否 D(结果2)</pre>
        </div>
      </div>
      <div v-html="renderMarkdown(mixedErrors)"></div>
    </div>

    <div class="test-section">
      <h3>6. 中文字符处理</h3>
      <div class="test-description">
        <p>测试包含中文字符的图表修复。</p>
        <div class="code-before">
          <pre>A[开始"测试"] --> B{是否"通过"测试？}
B -->|"是"| C[继续]
B -->|"否"| D[修复]</pre>
        </div>
      </div>
      <div v-html="renderMarkdown(chineseQuotes)"></div>
    </div>

    <div class="test-section">
      <h3>7. 无法自动修复的严重错误</h3>
      <div class="test-description">
        <p>测试无法自动修复的语法错误的友好错误消息。</p>
        <div class="code-before">
          <pre>flowchart TD
  A[开始] --> B
  B -**-> C[结束]
  D --> [错误的语法]</pre>
        </div>
      </div>
      <div v-html="renderMarkdown(unfixableErrors)"></div>
    </div>

    <div class="test-section">
      <h3>8. 错误SVG清理测试</h3>
      <div class="test-description">
        <p>测试错误SVG是否被正确清理，避免出现在页面底部。</p>
        <button @click="generateMultipleErrorDiagrams" class="test-button">
          生成多个错误图表
        </button>
      </div>
      <div v-if="showMultipleErrors">
        <div v-for="(diagram, index) in errorDiagrams" :key="index" class="error-diagram-test">
          <h4>错误图表 {{ index + 1 }}</h4>
          <div v-html="renderMarkdown(diagram)"></div>
        </div>
      </div>
    </div>

    <div class="theme-toggle">
      <p>当前主题: {{ isDarkMode ? '暗色' : '亮色' }}</p>
      <button @click="toggleTheme" class="theme-button">切换主题</button>
      <p>切换主题后，图表将自动更新颜色方案</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { renderMarkdown } from '../utils/markdown'
import { useSettingsStore } from '../stores/settings'
import { reinitializeMermaidTheme, renderMermaidDiagrams } from '../utils/mermaid-plugin'

const settingsStore = useSettingsStore()
const isDarkMode = ref(settingsStore.isDarkMode)

// 切换主题
const toggleTheme = () => {
  settingsStore.toggleDarkMode()
  isDarkMode.value = settingsStore.isDarkMode
  reinitializeMermaidTheme(isDarkMode.value)
  
  // 500ms后强制渲染
  setTimeout(() => {
    renderMermaidDiagrams()
  }, 500)
}

// 未闭合括号测试
const unclosedBrackets = `
\`\`\`mermaid
flowchart TD
  A[开始节点 --> B{判断} --> C[结果]
\`\`\`
`

// 节点与括号之间的空格
const nodeSpacing = `
\`\`\`mermaid
flowchart TD
  A [开始] --> B (处理) --> C {判断}
\`\`\`
`

// 箭头标签管道符修复
const arrowLabels = `
\`\`\`mermaid
flowchart TD
  A --> |是 B
  C --> |否 D
\`\`\`
`

// 图表类型缺失
const missingDiagramType = `
\`\`\`mermaid
TD
  A[开始] --> B[处理]
  B --> C[结束]
\`\`\`
`

// 混合多种错误
const mixedErrors = `
\`\`\`mermaid
flowchart TD
  A [开始节点 --> B{判断
  B ---> |是 C[结果1]
  B ---> |否 D(结果2)
\`\`\`
`

// 中文字符和引号处理
const chineseQuotes = `
\`\`\`mermaid
flowchart TD
  A[开始"测试"] --> B{是否"通过"测试？}
  B -->|"是"| C[继续]
  B -->|"否"| D[修复]
\`\`\`
`

// 无法自动修复的错误
const unfixableErrors = `
\`\`\`mermaid
flowchart TD
  A[开始] --> B
  B -**-> C[结束]
  D --> [错误的语法]
\`\`\`
`

// 用于错误SVG清理测试
const showMultipleErrors = ref(false)
const errorDiagrams = ref([])

// 生成多个错误图表来测试错误SVG清理
const generateMultipleErrorDiagrams = () => {
  showMultipleErrors.value = true
  errorDiagrams.value = [
    `\`\`\`mermaid
    flowchart XX
      A --> B
    \`\`\``,
    `\`\`\`mermaid
    flowchart TD
      A --%-> B
    \`\`\``,
    `\`\`\`mermaid
    flowchart TD
      [A] --> B
    \`\`\``,
    `\`\`\`mermaid
    sequenceDiagram
      A ->- B: 错误语法
    \`\`\``,
    `\`\`\`mermaid
    gantt
      section 错误
      任务1 错误语法
    \`\`\``
  ]
  
  // 渲染后确保清理错误SVG
  setTimeout(() => {
    if (window.mermaidCleanupErrorSvg) {
      window.mermaidCleanupErrorSvg()
    }
  }, 1000)
}

onMounted(() => {
  // 确保所有Mermaid图表都正确渲染
  setTimeout(() => {
    renderMermaidDiagrams()
  }, 500)
})
</script>

<style scoped>
.mermaid-error-test {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--background-color-secondary);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.test-description {
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
}

.code-before {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  margin-top: 10px;
  font-family: monospace;
  white-space: pre-wrap;
}

[data-theme="dark"] .code-before {
  background-color: #2d2d33;
  color: #e1e1e1;
}

.theme-toggle {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--background-color-secondary);
}

.test-button, .theme-button {
  background-color: #4c51bf;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.test-button:hover, .theme-button:hover {
  background-color: #5a67d8;
}

.error-diagram-test {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

[data-theme="dark"] .error-diagram-test {
  border-color: #4a5568;
}
</style> 