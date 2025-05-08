<template>
  <div class="math-test-container">
    <h1>Math Formula Test Page</h1>
    
    <div class="status-banner" :class="{ success: renderSuccess, error: !renderSuccess }">
      <div v-if="renderSuccess" class="status-message">
        <span class="status-icon">✓</span> 
        KaTeX 渲染成功！所有公式应该正确显示。
      </div>
      <div v-else class="status-message">
        <span class="status-icon">✗</span> 
        KaTeX 渲染遇到问题。请检查控制台获取更多信息。
      </div>
    </div>
    
    <div class="test-section">
      <h2>Standard LaTeX Delimiters</h2>
      <div v-html="renderMarkdown(standard)"></div>
    </div>
    
    <div class="test-section">
      <h2>Custom Bracket Delimiters</h2>
      <div v-html="renderMarkdown(brackets)"></div>
    </div>
    
    <div class="test-section">
      <h2>Custom Parenthesis Delimiters</h2>
      <div v-html="renderMarkdown(parentheses)"></div>
    </div>
    
    <div class="test-section">
      <h2>Mixed Content</h2>
      <div v-html="renderMarkdown(mixed)"></div>
    </div>

    <div class="test-section">
      <h2>Raw KaTeX Sample</h2>
      <div class="katex-sample">
        <div 
          ref="katexElement" 
          class="katex-display"
        ></div>
        <div 
          ref="katexInlineElement" 
          class="katex-inline"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { renderMarkdown } from '../utils/markdown';
import katex from 'katex';
import { onMounted, ref } from 'vue';

export default {
  name: 'MathTest',
  setup() {
    const katexElement = ref(null);
    const katexInlineElement = ref(null);
    const renderSuccess = ref(true);

    onMounted(() => {
      try {
        if (katexElement.value) {
          katex.render('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', katexElement.value, {
            displayMode: true,
            throwOnError: false,
            errorColor: '#FF0000'
          });
        }

        if (katexInlineElement.value) {
          katex.render('E = mc^2', katexInlineElement.value, {
            displayMode: false,
            throwOnError: false,
            errorColor: '#FF0000'
          });
        }
        
        // Check if KaTeX elements were rendered properly
        if (katexElement.value && !katexElement.value.querySelector('.katex')) {
          renderSuccess.value = false;
        }
      } catch (error) {
        console.error('KaTeX direct rendering error:', error);
        renderSuccess.value = false;
      }
    });

    return {
      katexElement,
      katexInlineElement,
      renderSuccess
    };
  },
  data() {
    return {
      standard: `
## 使用标准 LaTeX 分隔符

行内公式: $E = mc^2$ 是爱因斯坦的质能方程。

块级公式:

$$
\\frac{\\partial u}{\\partial t} = h^2 \\left( \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2} \\right)
$$
      `,
      brackets: `
## 使用方括号分隔符

使用方括号表示的块级公式:

[
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
]

另一个例子:

[\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)]
      `,
      parentheses: `
## 使用圆括号分隔符

使用圆括号表示的行内公式: (\\alpha + \\beta = \\gamma) 是一个简单的等式。

另一个例子: (\\sqrt{x^2 + y^2}) 表示点到原点的距离。
      `,
      mixed: `
## 混合内容测试

这段文本混合了普通文本和数学公式。

- 标准语法: $E = mc^2$
- 方括号语法: [F = ma]
- 圆括号语法: (P(A|B) = \\frac{P(B|A)P(A)}{P(B)})

表格中的公式:

| 公式 | 描述 |
| --- | --- |
| $E = mc^2$ | 质能方程 |
| $F = ma$ | 牛顿第二定律 |
| $a^2 + b^2 = c^2$ | 勾股定理 |

代码块中的公式（不应被解析）:
\`\`\`
$E = mc^2$
[F = ma]
(P(A|B))
\`\`\`
      `
    };
  },
  methods: {
    renderMarkdown
  }
};
</script>

<style scoped>
.math-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.status-banner {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 500;
}

.status-banner.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-banner.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-icon {
  font-size: 1.2em;
  margin-right: 8px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.katex-sample {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}
</style> 