<template>
  <div class="mermaid-test">
    <h2>Mermaid 显示测试</h2>
    
    <h3>基本流程图测试</h3>
    <div v-html="renderMarkdown(flowChartTest)"></div>
    
    <h3>节点样式测试</h3>
    <div v-html="renderMarkdown(nodeStyleTest)"></div>
    
    <h3>复杂流程图测试</h3>
    <div v-html="renderMarkdown(complexFlowChart)"></div>
  </div>
</template>

<script setup>
import { renderMarkdown } from '../utils/markdown'
import { onMounted } from 'vue'
import { renderMermaidDiagrams } from '../utils/mermaid-plugin'

// 基本流程图测试
const flowChartTest = `
\`\`\`mermaid
graph TD
    A[开始] --> B{是否继续?}
    B -->|是| C[处理]
    B -->|否| D[结束]
    C --> B
\`\`\`
`

// 节点样式测试 - 测试不同形状的节点
const nodeStyleTest = `
\`\`\`mermaid
graph LR
    A[方形节点] --> B(圆角节点)
    B --> C{菱形节点}
    C --> D((圆形节点))
    C --> E>标签节点]
    C --> F[/平行四边形/]
    C --> G[\反向平行四边形\\]
    C --> H{{六边形节点}}
\`\`\`
`

// 复杂流程图测试
const complexFlowChart = `
\`\`\`mermaid
graph TB
    开始((开始)) --> 判断{用户是否登录?}
    判断 -->|是| 欢迎[显示欢迎信息]
    判断 -->|否| 登录[显示登录表单]
    登录 --> 验证{验证凭据}
    验证 -->|失败| 登录
    验证 -->|成功| 欢迎
    欢迎 --> 操作{选择操作}
    操作 -->|查看数据| 数据[加载数据]
    操作 -->|编辑资料| 编辑[显示编辑表单]
    操作 -->|退出| 退出[注销用户]
    数据 --> 显示[显示数据表格]
    编辑 --> 保存{保存更改?}
    保存 -->|是| 更新[更新数据库]
    保存 -->|否| 操作
    更新 --> 操作
    退出 --> 结束((结束))
    显示 --> 操作
\`\`\`
`

onMounted(() => {
  // 确保Mermaid图表渲染
  setTimeout(renderMermaidDiagrams, 500)
})
</script>

<style scoped>
.mermaid-test {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

h3 {
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
</style> 