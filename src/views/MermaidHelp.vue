<template>
  <div class="mermaid-help">
    <h1>Mermaid图表使用指南</h1>
    
    <p class="intro">
      本聊天应用支持使用Mermaid语法创建各种图表，只需在代码块中使用<code>mermaid</code>语言标识。
    </p>
    
    <div class="examples">
      <h2>流程图示例</h2>
      <pre>```mermaid
graph TD;
    A[开始] --> B{判断条件};
    B -->|是| C[处理1];
    B -->|否| D[处理2];
    C --> E[结束];
    D --> E;
```</pre>
      <div class="mermaid-wrapper">
        <div class="mermaid-container">
          <div class="mermaid-header">
            <span class="mermaid-label">mermaid</span>
          </div>
          <div class="mermaid-diagram">
            <div class="mermaid">
              graph TD;
                  A[开始] --> B{判断条件};
                  B -->|是| C[处理1];
                  B -->|否| D[处理2];
                  C --> E[结束];
                  D --> E;
            </div>
          </div>
        </div>
      </div>
      
      <h2>时序图示例</h2>
      <pre>```mermaid
sequenceDiagram
    用户->>AI: 发送提问
    AI->>API: 处理请求
    API-->>AI: 返回回答
    AI-->>用户: 显示回答
```</pre>
      <div class="mermaid-wrapper">
        <div class="mermaid-container">
          <div class="mermaid-header">
            <span class="mermaid-label">mermaid</span>
          </div>
          <div class="mermaid-diagram">
            <div class="mermaid">
              sequenceDiagram
                  用户->>AI: 发送提问
                  AI->>API: 处理请求
                  API-->>AI: 返回回答
                  AI-->>用户: 显示回答
            </div>
          </div>
        </div>
      </div>
      
      <h2>饼图示例</h2>
      <pre>```mermaid
pie title 语言使用比例
    "JavaScript" : 40
    "Python" : 30
    "Java" : 20
    "其他" : 10
```</pre>
      <div class="mermaid-wrapper">
        <div class="mermaid-container">
          <div class="mermaid-header">
            <span class="mermaid-label">mermaid</span>
          </div>
          <div class="mermaid-diagram">
            <div class="mermaid">
              pie title 语言使用比例
                  "JavaScript" : 40
                  "Python" : 30
                  "Java" : 20
                  "其他" : 10
            </div>
          </div>
        </div>
      </div>
      
      <h2>甘特图示例</h2>
      <pre>```mermaid
gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 阶段1
    需求分析      :a1, 2023-01-01, 30d
    设计         :after a1, 20d
    section 阶段2
    开发         :2023-02-20, 35d
    测试         :15d
```</pre>
      <div class="mermaid-wrapper">
        <div class="mermaid-container">
          <div class="mermaid-header">
            <span class="mermaid-label">mermaid</span>
          </div>
          <div class="mermaid-diagram">
            <div class="mermaid">
              gantt
                  title 项目进度
                  dateFormat  YYYY-MM-DD
                  section 阶段1
                  需求分析      :a1, 2023-01-01, 30d
                  设计         :after a1, 20d
                  section 阶段2
                  开发         :2023-02-20, 35d
                  测试         :15d
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="usage">
      <h2>如何在对话中使用</h2>
      <p>
        只需在消息中使用<code>```mermaid</code>代码块包裹Mermaid语法即可。AI将自动理解并生成相应的图表。
      </p>
      <div class="example-chat">
        <div class="user-message">
          请生成一个简单的流程图，描述AI聊天的过程。
        </div>
        <div class="ai-message">
          以下是AI聊天的基本流程图：
          
          ```mermaid
          graph LR;
              A[用户输入] --> B[请求处理];
              B --> C[AI模型生成];
              C --> D[响应格式化];
              D --> E[显示给用户];
              E --> A;
          ```
        </div>
      </div>
    </div>
    
    <div class="more-info">
      <h2>更多资源</h2>
      <p>
        查看 <a href="https://mermaid.js.org/" target="_blank">Mermaid官方文档</a> 了解更多语法和图表类型。
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import mermaid from 'mermaid';

onMounted(() => {
  // 在组件挂载后初始化Mermaid图表
  setTimeout(() => {
    mermaid.contentLoaded();
  }, 100);
});
</script>

<style scoped lang="scss">
.mermaid-help {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #333;
    
    [data-theme="dark"] & {
      color: #e2e8f0;
    }
  }
  
  .intro {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 30px;
    color: #4a5568;
    
    [data-theme="dark"] & {
      color: #a0aec0;
    }
  }
  
  code {
    background-color: #f7fafc;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: monospace;
    color: #3182ce;
    
    [data-theme="dark"] & {
      background-color: #2d3748;
      color: #63b3ed;
    }
  }
  
  .examples {
    h2 {
      font-size: 1.5rem;
      margin: 30px 0 15px;
      color: #2d3748;
      
      [data-theme="dark"] & {
        color: #e2e8f0;
      }
    }
    
    pre {
      background-color: #f7fafc;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: monospace;
      margin: 15px 0;
      border: 1px solid #e2e8f0;
      
      [data-theme="dark"] & {
        background-color: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
      }
    }
  }
  
  .usage {
    margin-top: 40px;
    
    .example-chat {
      margin-top: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      
      [data-theme="dark"] & {
        border-color: #4a5568;
      }
      
      .user-message, .ai-message {
        padding: 15px;
        
        &:not(:last-child) {
          border-bottom: 1px solid #e2e8f0;
          
          [data-theme="dark"] & {
            border-color: #4a5568;
          }
        }
      }
      
      .user-message {
        background-color: #ebf8ff;
        
        [data-theme="dark"] & {
          background-color: #2c5282;
          color: #e2e8f0;
        }
      }
      
      .ai-message {
        background-color: #f7fafc;
        
        [data-theme="dark"] & {
          background-color: #2d3748;
          color: #e2e8f0;
        }
      }
    }
  }
  
  .more-info {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
    
    [data-theme="dark"] & {
      border-color: #4a5568;
    }
    
    a {
      color: #3182ce;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
      
      [data-theme="dark"] & {
        color: #63b3ed;
      }
    }
  }
}
</style> 