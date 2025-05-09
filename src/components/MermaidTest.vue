<template>
  <div class="mermaid-test-container">
    <h2>Mermaid Diagram Test</h2>
    <p>This component tests the different types of Mermaid diagrams that can be rendered in the application.</p>

    <div class="diagram-section">
      <h3>1. 流程图 (Flowchart)</h3>
      <div v-html="renderMarkdown(flowchartExample)"></div>
    </div>

    <div class="diagram-section">
      <h3>2. 时序图 (Sequence Diagram)</h3>
      <div v-html="renderMarkdown(sequenceDiagramExample)"></div>
    </div>

    <div class="diagram-section">
      <h3>3. 类图 (Class Diagram)</h3>
      <div v-html="renderMarkdown(classDiagramExample)"></div>
    </div>

    <div class="diagram-section">
      <h3>4. 甘特图 (Gantt Chart)</h3>
      <div v-html="renderMarkdown(ganttChartExample)"></div>
    </div>

    <div class="diagram-section">
      <h3>5. 饼图 (Pie Chart)</h3>
      <div v-html="renderMarkdown(pieChartExample)"></div>
    </div>

    <div class="diagram-section">
      <h3>6. 状态图 (State Diagram)</h3>
      <div v-html="renderMarkdown(stateDiagramExample)"></div>
    </div>
    
    <div class="diagram-section">
      <h3>7. 常见错误示例和修复</h3>
      <h4>7.1 - 错误类型：未指定图表类型（将自动修复）</h4>
      <div v-html="renderMarkdown(errorFixableSyntaxExample)"></div>
      
      <h4>7.2 - 错误类型：语法错误（不可自动修复）</h4>
      <div v-html="renderMarkdown(errorSyntaxExample)"></div>
    </div>

    <div class="theme-toggle">
      <p>当前主题: {{ isDarkMode ? '暗色' : '亮色' }}</p>
      <el-button @click="toggleTheme">切换主题</el-button>
      <p>切换主题后，图表将自动更新颜色方案</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { renderMarkdown } from '../utils/markdown'
import { useSettingsStore } from '../stores/settings'
import { reinitializeMermaidTheme, renderMermaidDiagrams } from '../utils/mermaid-plugin'
import mermaid from 'mermaid'

const settingsStore = useSettingsStore()
const isDarkMode = ref(settingsStore.isDarkMode)

// 切换主题
const toggleTheme = () => {
  settingsStore.toggleDarkMode()
  isDarkMode.value = settingsStore.isDarkMode
  // 更新mermaid主题
  reinitializeMermaidTheme(isDarkMode.value)
  
  // 5秒后强制渲染
  setTimeout(() => {
    renderMermaidDiagrams()
  }, 500)
}

// 流程图示例
const flowchartExample = `
\`\`\`mermaid
flowchart TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主界面]
    B -->|否| D[显示登录界面]
    C --> E[查询数据]
    D --> F[验证用户]
    F --> G{验证成功?}
    G -->|是| C
    G -->|否| H[显示错误]
    H --> D
    E --> I[显示结果]
    I --> J[结束]
\`\`\`
`

// 时序图示例
const sequenceDiagramExample = `
\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant API
    participant 数据库
    
    用户->>前端: 点击登录按钮
    前端->>API: 发送登录请求
    API->>数据库: 查询用户信息
    数据库-->>API: 返回用户数据
    API-->>前端: 返回认证结果
    前端-->>用户: 显示登录状态
\`\`\`
`

// 类图示例
const classDiagramExample = `
\`\`\`mermaid
classDiagram
    class User {
        +String username
        +String password
        +login()
        +logout()
    }
    
    class Message {
        +String content
        +Date timestamp
        +String role
        +Boolean hasReasoning
        +String reasoningContent
    }
    
    class ChatStore {
        +Array messages
        +addMessage()
        +deleteMessage()
        +regenerateMessage()
    }
    
    ChatStore "1" --> "*" Message : contains
    User "1" --> "*" Message : creates
\`\`\`
`

// 甘特图示例
const ganttChartExample = `
\`\`\`mermaid
gantt
    title 项目开发时间表
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析           :a1, 2023-01-01, 7d
    UI设计             :a2, after a1, 10d
    section 开发阶段
    前端开发           :a3, after a2, 15d
    后端开发           :a4, after a2, 20d
    section 测试阶段
    单元测试           :a5, after a3, 5d
    集成测试           :a6, after a4, 7d
    section 部署阶段
    部署上线           :a7, after a6, 2d
\`\`\`
`

// 饼图示例
const pieChartExample = `
\`\`\`mermaid
pie
    title AI助手对话统计
    "用户消息" : 42
    "AI回复" : 42
    "系统消息" : 16
\`\`\`
`

// 状态图示例
const stateDiagramExample = `
\`\`\`mermaid
stateDiagram-v2
    [*] --> 空闲
    空闲 --> 等待用户输入: 打开应用
    等待用户输入 --> 处理消息: 用户发送消息
    处理消息 --> AI思考: 调用API
    AI思考 --> 显示回复: 接收到回复
    显示回复 --> 等待用户输入: 完成显示
    等待用户输入 --> 空闲: 关闭应用
    空闲 --> [*]
\`\`\`
`

// 错误示例
const errorFixableSyntaxExample = `
\`\`\`mermaid
TD
    A[圆形节点] --> B[菱形判断]
    B -->|是| C[结果1]
    B -->|否| D[结果2]
\`\`\`
`

const errorSyntaxExample = `
\`\`\`mermaid
flowchart TD
    A[开始节点] --> B
    B --> C[结束节点]
    X ---> Y  # 错误的箭头语法
    Z -> [错误的节点定义]
\`\`\`
`

onMounted(() => {
  // 确保所有Mermaid图表都正确渲染
  setTimeout(() => {
    renderMermaidDiagrams()
  }, 500)
})
</script>

<style scoped>
.mermaid-test-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.diagram-section {
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--background-color-secondary);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.theme-toggle {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--background-color-secondary);
}
</style> 