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
      
      <h2>类图示例</h2>
      <pre>```mermaid
classDiagram
    class User {
        +String name
        +login()
        +logout()
    }
    class Message {
        +String content
        +Date timestamp
    }
    User "1" --> "*" Message: sends
```</pre>
      <div class="mermaid-wrapper">
        <div class="mermaid-container">
          <div class="mermaid-header">
            <span class="mermaid-label">mermaid</span>
          </div>
          <div class="mermaid-diagram">
            <div class="mermaid">
              classDiagram
                  class User {
                      +String name
                      +login()
                      +logout()
                  }
                  class Message {
                      +String content
                      +Date timestamp
                  }
                  User "1" --> "*" Message: sends
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="usage">
      <h2>使用方法</h2>
      <p>只需在消息中使用<code>```mermaid</code>代码块包裹Mermaid语法即可。AI将自动理解并生成相应的图表。</p>
      
      <div class="syntax-tips">
        <h3>常见语法说明</h3>
        <table>
          <thead>
            <tr>
              <th>图表类型</th>
              <th>开始语法</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>流程图</td>
              <td><code>flowchart TD</code> 或 <code>graph TD</code></td>
              <td>TD=从上到下, LR=从左到右</td>
            </tr>
            <tr>
              <td>时序图</td>
              <td><code>sequenceDiagram</code></td>
              <td>描述对象之间的交互</td>
            </tr>
            <tr>
              <td>类图</td>
              <td><code>classDiagram</code></td>
              <td>展示类的结构和关系</td>
            </tr>
            <tr>
              <td>甘特图</td>
              <td><code>gantt</code></td>
              <td>项目进度和时间规划</td>
            </tr>
            <tr>
              <td>饼图</td>
              <td><code>pie</code></td>
              <td>展示数据比例</td>
            </tr>
            <tr>
              <td>状态图</td>
              <td><code>stateDiagram-v2</code></td>
              <td>描述状态和转换</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="error-handling">
      <h2>自动错误修复功能</h2>
      <p>本应用内置了Mermaid语法的自动修复功能，当你的图表语法存在以下常见错误时，系统会尝试自动修复：</p>
      
      <div class="error-section">
        <h3>1. 括号不闭合问题</h3>
        <div class="error-example">
          <div class="code-block">
            <div class="wrong">❌ <code>A[节点内容</code> (缺少右括号)</div>
            <div class="right">✅ <code>A[节点内容]</code> (自动修复)</div>
          </div>
          <p>系统会自动检测并闭合缺失的方括号 <code>[]</code>、圆括号 <code>()</code> 和花括号 <code>{}</code>。</p>
        </div>
        
        <h3>2. 节点名称与括号之间的空格</h3>
        <div class="error-example">
          <div class="code-block">
            <div class="wrong">❌ <code>A [内容]</code> (节点名与括号间有空格)</div>
            <div class="right">✅ <code>A[内容]</code> (自动移除空格)</div>
          </div>
        </div>
        
        <h3>3. 箭头标签语法问题</h3>
        <div class="error-example">
          <div class="code-block">
            <div class="wrong">❌ <code>A -->|标签 B</code> (缺少右侧管道符)</div>
            <div class="right">✅ <code>A -->|标签| B</code> (自动添加管道符)</div>
          </div>
          <p>箭头标签必须用管道符 <code>|</code> 包裹，系统会自动补全缺失的管道符。</p>
        </div>
        
        <h3>4. 缺少图表类型</h3>
        <div class="error-example">
          <div class="code-block">
            <div class="wrong">❌ <code>TD</code> (只有方向标识)</div>
            <div class="right">✅ <code>flowchart TD</code> (自动添加图表类型)</div>
          </div>
          <p>当图表没有指定类型时，系统会尝试添加适当的图表类型前缀。</p>
        </div>
        
        <h3>5. 箭头格式问题</h3>
        <div class="error-example">
          <div class="code-block">
            <div class="wrong">❌ <code>A ---> B</code> (箭头格式不正确)</div>
            <div class="right">✅ <code>A --> B</code> (修正箭头格式)</div>
          </div>
        </div>
        
        <h3>6. 中文引号问题</h3>
        <div class="error-example">
          <div class="code-block">
            <div class="wrong">❌ <code>"中文引号"</code> (使用了中文引号)</div>
            <div class="right">✅ <code>"中文引号"</code> (转换为英文引号)</div>
          </div>
          <p>系统会自动将中文引号转换为英文引号，以避免解析错误。</p>
        </div>
      </div>
    </div>
    
    <div class="error-tips">
      <h2>常见错误与解决方法</h2>
      
      <div class="error-card">
        <h3>语法错误：节点定义</h3>
        <p><strong>错误表现：</strong> 节点定义语法错误</p>
        <p><strong>解决方法：</strong></p>
        <ul>
          <li>方框节点: <code>A[文本]</code></li>
          <li>圆角框: <code>B(文本)</code></li>
          <li>菱形: <code>C{文本}</code></li>
          <li>圆形: <code>D((文本))</code></li>
          <li>确保节点名称与括号之间没有空格</li>
        </ul>
      </div>
      
      <div class="error-card">
        <h3>语法错误：箭头连接</h3>
        <p><strong>错误表现：</strong> 箭头连接或标签语法错误</p>
        <p><strong>解决方法：</strong></p>
        <ul>
          <li>普通箭头: <code>A --> B</code></li>
          <li>带标签箭头: <code>A -->|标签文本| B</code></li>
          <li>虚线箭头: <code>A -.-> B</code></li>
          <li>粗线箭头: <code>A ==> B</code></li>
          <li>确保管道符 <code>|</code> 成对出现</li>
        </ul>
      </div>
      
      <div class="error-card">
        <h3>语法错误：图表类型</h3>
        <p><strong>错误表现：</strong> 未知图表类型或方向错误</p>
        <p><strong>解决方法：</strong></p>
        <ul>
          <li>始终以正确的图表类型开始: <code>flowchart TD</code>, <code>sequenceDiagram</code>, <code>classDiagram</code> 等</li>
          <li>流程图方向可选: TD(上到下), LR(左到右), RL(右到左), BT(下到上)</li>
        </ul>
      </div>
      
      <div class="error-card">
        <h3>未定义节点错误</h3>
        <p><strong>错误表现：</strong> "Undefined identifier" 错误</p>
        <p><strong>解决方法：</strong></p>
        <ul>
          <li>确保所有通过箭头连接的节点都已定义</li>
          <li>节点名称区分大小写，检查大小写是否一致</li>
          <li>节点首次出现时应包含形状定义，如 <code>A[文本]</code></li>
        </ul>
      </div>
    </div>
    
    <div class="more-info">
      <h2>更多资源</h2>
      <p>查看 <a href="https://mermaid.js.org/" target="_blank">Mermaid官方文档</a> 了解更多语法和图表类型。</p>
      <p>测试工具：</p>
      <ul>
        <li><a href="#/mermaid-test">Mermaid基本图表测试</a> - 查看各种图表类型的示例</li>
        <li><a href="#/mermaid-error-test">Mermaid错误修复测试</a> - 测试自动修复功能</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import mermaid from 'mermaid';

// 在组件挂载后初始化Mermaid图表
onMounted(() => {
  mermaid.contentLoaded();
});
</script>

<style scoped>
.mermaid-help {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-heading);
}

h2 {
  margin-top: 40px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
  color: var(--color-heading);
}

h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  color: var(--color-heading);
}

.intro {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

pre {
  background-color: var(--color-background-soft);
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 15px 0;
  border: 1px solid var(--color-border);
}

code {
  font-family: monospace;
  padding: 2px 4px;
  background-color: var(--color-background-mute);
  border-radius: 4px;
}

.syntax-tips {
  margin: 25px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  text-align: left;
  padding: 10px;
  border: 1px solid var(--color-border);
}

th {
  background-color: var(--color-background-soft);
}

.error-section {
  background-color: var(--color-background-soft);
  padding: 20px;
  border-radius: 10px;
  margin: 25px 0;
}

.error-example {
  background-color: var(--color-background-mute);
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.code-block {
  padding: 10px;
  border-radius: 6px;
  background-color: var(--color-background);
  margin-bottom: 10px;
}

.wrong {
  color: #e53e3e;
  margin-bottom: 5px;
}

.right {
  color: #38a169;
}

.error-card {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--color-background-soft);
}

.error-card h3 {
  margin-top: 0;
  color: #4a5568;
}

.more-info {
  margin-top: 40px;
  padding: 20px;
  background-color: var(--color-background-soft);
  border-radius: 10px;
}
</style> 