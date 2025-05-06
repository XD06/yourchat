<template>
  <!-- 消息容器，根据消息角色和加载状态动态调整样式 -->
  <div 
    :class="[
      'message-container',
      `role-${message.role}`,
      { 'regenerating': message.loading },
      { 'latest-message': isLatestMessage && message.role === 'assistant' },
    ]"
  >
    <!-- AI头像（只在AI消息时显示在左侧） -->
    <div v-if="message.role === 'assistant'" class="avatar assistant-avatar">
      <!-- <el-icon><ChatDotRound /></el-icon> -->
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50">
<path d="M 25 1 A 2.5 2.5 0 0 0 22.509766 3.2851562 L 7.2539062 12.119141 A 2.5 2.5 0 0 0 6.5 12 A 2.5 2.5 0 0 0 5 16.498047 L 5 33.503906 A 2.5 2.5 0 0 0 6.5 38 A 2.5 2.5 0 0 0 7.2558594 37.882812 L 22.513672 46.716797 A 2.5 2.5 0 0 0 25 49 A 2.5 2.5 0 0 0 27.490234 46.714844 L 42.746094 37.880859 A 2.5 2.5 0 0 0 43.5 38 A 2.5 2.5 0 0 0 45 33.501953 L 45 16.496094 A 2.5 2.5 0 0 0 43.5 12 A 2.5 2.5 0 0 0 42.744141 12.117188 L 27.486328 3.2832031 A 2.5 2.5 0 0 0 25 1 z M 22.265625 5.7402344 L 15.130859 18.128906 L 8.9960938 14.578125 A 2.5 2.5 0 0 0 8.8027344 13.533203 L 22.265625 5.7402344 z M 27.734375 5.7402344 L 41.197266 13.533203 A 2.5 2.5 0 0 0 41.001953 14.580078 L 34.869141 18.128906 L 27.734375 5.7402344 z M 8.1347656 16.390625 L 14.134766 19.865234 L 15.136719 18.134766 L 23.519531 22.990234 C 23.939531 22.690234 24.45 22.5 25 22.5 C 25.55 22.5 26.060469 22.690234 26.480469 22.990234 L 34.863281 18.134766 L 35.865234 19.865234 L 41.867188 16.390625 A 2.5 2.5 0 0 0 43 16.947266 L 43 32.253906 L 35.869141 19.869141 L 27.470703 24.720703 C 27.480703 24.820703 27.5 24.91 27.5 25 C 27.5 26.02 26.88 26.899062 26 27.289062 L 26 37 L 40.275391 37 L 26.822266 44.789062 A 2.5 2.5 0 0 0 26 44.210938 L 26 37 L 24 37 L 24 44.210938 A 2.5 2.5 0 0 0 23.177734 44.789062 L 9.7246094 37 L 24 37 L 24 27.289062 C 23.12 26.899062 22.5 26.02 22.5 25 C 22.5 24.91 22.519297 24.820703 22.529297 24.720703 L 14.130859 19.869141 L 7 32.253906 L 7 16.949219 A 2.5 2.5 0 0 0 8.1347656 16.390625 z"></path>
</svg>
    </div>
    
    <!-- 消息内容容器 -->
    <div class="message-content">
      <!-- 消息头部：角色名和时间戳 -->
      <div class="message-header">
        <div class="message-role">{{ message.role === 'user' ? 'User' : 'AI Assistant' }}</div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>

      <!-- 思考内容区域 (只在AI消息且存在思考内容时显示) -->
      <div 
        v-if="message.role === 'assistant' && message.thinkingContent" 
        class="thinking-bubble"
        :class="{ 'thinking-active': !message.completed }"
      >
        <div class="thinking-header">
          <div class="thinking-icon" style="margin-left: 5px;">
            <el-icon><Operation /></el-icon>
          </div>
          <div class="thinking-title">
            <!-- 根据消息状态显示不同的标题 -->
            <span v-if="!message.completed">思考中...<span class="thinking-dots">...</span></span>
            <span v-else>已深度思考☁️</span>
          </div>
          <el-button 
            v-if="message.completed"
            type="text" 
            class="toggle-thinking-btn" 
            @click="isThinkingExpanded = !isThinkingExpanded"
          >
            {{ isThinkingExpanded ? '▲' : '▼' }}
          </el-button>
        </div>
        <!-- 思考中状态或展开状态时显示思考内容 -->
        <div 
          v-show="!message.completed || isThinkingExpanded" 
          class="thinking-content" 
          v-html="formatThinkingContent"
        ></div>
      </div>

      <!-- 消息气泡 -->
      <div class="message-bubble">
        <div v-if="message.loading" class="message-loading">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>
        <div v-else class="message-text" ref="messageText">
          <div
            v-if="isEditing"
            class="message-editing"
          >
            <el-input
              v-model="editingContent"
              type="textarea"
              :rows="3"
              autofocus
              @keydown.esc="cancelEdit"
              @keydown.ctrl.enter="saveEdit"
            />
            <div class="editing-actions">
              <el-button
                @click="saveEdit"
                size="small"
                type="primary"
              >Save</el-button>
              <el-button
                @click="cancelEdit"
                size="small"
              >Cancel</el-button>
            </div>
          </div>
          <div v-else class="message-display" v-html="formatContent"></div>
        </div>
        
        <!-- Token Count Badge -->
        <div v-if="message.role === 'assistant' && message.tokenCount" class="token-count">
          {{ message.tokenCount }} tokens
        </div>
      </div>

      <!-- 消息底部工具栏 -->
      <div class="message-actions">
        <!-- 用户消息的操作 -->
        <template v-if="message.role === 'user'">
          <el-dropdown trigger="click" @command="handleUserCommand">
            <el-button class="action-button" size="small" type="link">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <el-icon><EditPen /></el-icon> Edit
                </el-dropdown-item>
                <el-dropdown-item command="delete">
                  <el-icon><Delete /></el-icon> Delete
                </el-dropdown-item>
                <el-dropdown-item command="copy">
                  <el-icon><CopyDocument /></el-icon> Copy
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        
        <!-- AI消息的操作 -->
        <template v-else>
          <el-dropdown trigger="click" @command="handleAssistantCommand">
            <el-button class="action-button" size="small" type="link">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="isLatestMessage" command="regenerate">
                  <el-icon><Refresh /></el-icon> Regenerate
                </el-dropdown-item>
                <el-dropdown-item command="copy">
                  <el-icon><CopyDocument /></el-icon> Copy
                </el-dropdown-item>
                <el-dropdown-item command="delete">
                  <el-icon><Delete /></el-icon> Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
    
    <!-- 用户头像（只在用户消息时显示在右侧） -->
    <div v-if="message.role === 'user'" class="avatar user-avatar">
      <!-- <span class="avatar-letter">U</span> -->
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADqklEQVR4nO2ae2iOURzHPxujbbLMZSu2xCiXf8wlmekxk+uSFqXc8gc2aRGmtWSb6yI0/0gplIiUWPGnQsQ/5JoihVLkkkth0anvU8fbe3ne7X2e95Jvnd7nnOc5v/N+n+ec3/me3znwH56RrZTWqADuKpnrtEMJcAboAk4rdanM3Et55AKNwBfgHjDdujcJuAl8A/YB/UhR1AAvgLfA2gjjIgtYArwCXgMrVZYSmABcB34CR4D+HurkAzuBH8AdYCpJxED98d/AZWBkN2yY8XJK48f8FhEgcoAG4BPwBJibAJszgfvAV32pvgSAZ8B7oB7onUC7xla9bJs2fMcf4BxQ5wOROtk2bfgO04gDjAYOAgsSYHMWcAgYL9uBETkLjFJ+oQi5+XgwSnWNDReBEpmt/twCFMgB2Hkv7ncLsD3MwHaC7lquC94BbAB6hcmHwkySy4H2KK7WSQYRe1I8DMyIkDeYonkn1uTnJJMIkhpL9bZLQ/LtuvYiR5xkE7GF41aJxzxNdiaFYnAE9+2kChFbfuxXFzPjYjHQLIfQorG0Ih2IuDAKd5fGTR/+RRtpRMSJ8nzGEFkPDM0EImOAZUETyQE2q5HaBBEx7rg1pKzWTyLzgafAB83a67RuKOwhESwixlYH8AvoxAd0yvjRkD9eKDe6Loacj0WkXm7ZvCTzsubhE8xnvgZUR7g/ThK8uhtEjPh8CHwENqn7+j64FwEHoqzNNwIngTIPRMr07CfZb44gMn3zUjlaxbWGiZY4esPu/YIwRGz5PkfPu+v/xyoL1N0WA3uAVVb8aiLQpLx7f7WltVarrFjPNKmOa++EoinngeFBEbGjh0aaTwvJV1j5C0rmGt07YuVD7d1QvKtNXzAQInaUscN6k3be7VpmBt8roRhLztcAL4E3UaKWvhBBkr1REj5X+W0KvJ3StSnzijy59+/ALZIgSUpDFlLDlOJFlmxcStRM/0P91sjweFCpsVDejTbLVbcykdprBHBRHuU4MCSOuqZvr9F6xEtctwjYrTrZfonInsRno4V/iBFOcvwQkdla8b0DnmuvIx6UaS6x61WrG42NUMdXWT9AjRsxeVXringwR/rskIfZ3AlioWXiv1dE6BgwKI66sVRx4CtGt3s8khRv8BilT0kiKEJiBvRn4AFQRc+JVMmWEZUpuyUXjUhJMrfk4t0kDUckP5U2Sb1uW9tEUnrbOtZBApfI5HQ5SBDpaMdtpbQ62pFxh20y7vgTicZfAdfx5+t2wbAAAAAASUVORK5CYII=" alt="user">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'
import { ElMessage } from 'element-plus'
import { 
  ChatDotRound, 
  MoreFilled, 
  EditPen, 
  Delete, 
  CopyDocument, 
  Refresh,
  Operation
} from '@element-plus/icons-vue'
import hljs from 'highlight.js'
import markdownIt from 'markdown-it'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'delete', 'regenerate'])

const messageText = ref(null)
const isThinkingExpanded = ref(false)

// Markdown renderer setup
const md = markdownIt({
  html: false,
  breaks: true,
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        // 添加复制按钮和正确的语言标签
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
        </pre>`;
      } catch (error) {
        console.error('Highlight error:', error)
      }
    }
    // 无法识别语言时，仍添加复制按钮但使用通用标签
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
    </pre>`;
  }
})

// 编辑状态和内容
const isEditing = ref(false)
const editingContent = ref('')

// 开始编辑消息
const startEdit = () => {
  editingContent.value = props.message.content
  isEditing.value = true
  nextTick(() => {
    const textarea = document.querySelector('.message-editing textarea')
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    }
  })
}

// 保存编辑内容
const saveEdit = () => {
  if (editingContent.value.trim() === '') {
    ElMessage.warning('Message cannot be empty')
    return
  }
  
  const updatedMessage = { ...props.message, content: editingContent.value }
  emit('update', updatedMessage)
  isEditing.value = false
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 处理用户消息的命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'edit':
      startEdit()
      break
    case 'delete':
    emit('delete', props.message)
      break
    case 'copy':
      handleCopy()
      break
  }
}

// 处理AI消息的命令
const handleAssistantCommand = (command) => {
  switch (command) {
    case 'regenerate':
      emit('regenerate', props.message)
      break
    case 'copy':
      handleCopy()
      break
    case 'delete':
      emit('delete', props.message)
      break
  }
}

// 复制消息内容
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    ElMessage.success('Copied to clipboard')
  } catch (error) {
    console.error('Failed to copy:', error)
    ElMessage.error('Failed to copy content')
  }
}

// 格式化消息内容
const formatContent = computed(() => {
  if (!props.message.content) return ''
  
  // 转换Markdown格式
  const content = md.render(props.message.content)
  return content
})

// 格式化思考内容
const formatThinkingContent = computed(() => {
  if (!props.message.thinkingContent) return '';
  return md.render(props.message.thinkingContent);
})

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// 计算是否是最新的AI消息
const chatStore = useChatStore()
const isLatestMessage = computed(() => {
  const messages = chatStore.messages
  const assistantMessages = messages.filter(m => m.role === 'assistant')
  if (assistantMessages.length === 0) return false
  
  return assistantMessages[assistantMessages.length - 1].id === props.message.id
})

// 高亮代码块并添加复制功能
onMounted(() => {
  nextTick(() => {
    if (messageText.value) {
      // 添加复制功能处理
      const copyButtons = messageText.value.querySelectorAll('.copy-btn');
      copyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          const codeBlock = button.closest('.code-block');
          if (codeBlock) {
            const codeElement = codeBlock.querySelector('code');
            if (codeElement) {
              const text = codeElement.textContent || '';
              navigator.clipboard.writeText(text)
                .then(() => {
                  // 显示复制成功提示
                  const originalInnerHTML = button.innerHTML;
                  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                  button.style.color = '#10b981';
                  
                  setTimeout(() => {
                    button.innerHTML = originalInnerHTML;
                    button.style.color = '';
                  }, 1500);
                  
                  ElMessage({
                    message: '代码已复制到剪贴板',
                    type: 'success',
                    offset: 60,
                    duration: 1500
                  });
                })
                .catch(err => {
                  console.error('复制失败:', err);
                  ElMessage.error('复制失败，请手动选择并复制代码');
                });
            }
          }
        });
      });
      
      // 高亮代码块
      const codeBlocks = messageText.value.querySelectorAll('.code-block code');
      codeBlocks.forEach(block => {
        hljs.highlightElement(block);
      });
    }
  });
});
</script>

<style lang="scss" scoped>
/* 消息容器样式 */
.message-container {
  display: flex;
  margin-bottom: 32px;
  position: relative;
  
  /* 用户消息样式 - 右侧布局 */
  &.role-user {
    flex-direction: row-reverse;
    justify-content: flex-start;
    
    .message-bubble {
      background-color: #f0f2f5;
      border-radius: 16px 4px 16px 16px;
      border: none;
      
      .message-text {
        color: #333;
      }
    }
    
    /* 用户消息内容右对齐 */
    .message-content {
      align-items: flex-end;
      margin-right: 12px;
      margin-left: 0;
    }
    
    /* 用户消息头部右对齐 */
    .message-header {
      flex-direction: row-reverse;
      
      .message-role {
        margin-left: 8px;
        margin-right: 0;
        color: #666;
      }
    }
  }
  
  /* AI消息样式 */
  &.role-assistant {
    .message-bubble {
      background-color: #f9fafb;
      border-radius: 4px 16px 16px 16px;
      border: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      
      .message-text {
        padding-left:10px;
        color: #333;
      }
      
      /* Token计数样式 */
      .token-count {
        position: absolute;
        bottom: -18px;
        right: 8px;
        font-size: 11px;
        color: #999;
        padding: 2px 6px;
        border-radius: 10px;
      }
    }
 
    /* AI消息内容左对齐 */
    .message-content {
      margin-right: 0;
      margin-left: 12px;
    }
    
    .message-header {
      .message-role {
        color: #666;
      }
    }
  }
  
  /* 正在重新生成的消息样式 */
  &.regenerating {
    .message-bubble {
      border: 1px dashed #4284f5;
    }
    
    .message-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
  }
  
  /* 最新消息样式 */
  &.latest-message {
    .message-bubble {
      border-left-width: 0;
    }
  }
}

/* 头像样式 */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar {
  //background-color: #202123;
  color: white;
  font-weight: 600;
  
  .avatar-letter {
    font-size: 16px;
  }
}

.assistant-avatar {
  background-color: transparent;
  color: white;
  
  .el-icon {
    font-size: 20px;
  }
}

/* 消息头部 */
.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  
  .message-role {
    font-weight: 500;
    font-size: 13px;
  }
  
  .message-time {
    font-size: 12px;
    color: #999;
  }
}

/* 消息气泡 */
.message-bubble {
  padding: 12px 16px;
  border-radius: 14px;
  position: relative;
  
  .message-text {
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
    overflow-wrap: break-word;
    padding-left: 10px;
    
    :deep(.code-block) {
      margin: 12px 0;
      border-radius: 8px;
      background-color: #f8f9fa;
      overflow: hidden;
      font-size: 13px;
      line-height: 1.5;
      border: 1px solid #eee;
      position: relative;
      
      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f1f3f5;
        padding: 6px 12px;
        font-family: sans-serif;
        font-size: 12px;
        color: #666;
        border-bottom: 1px solid #eee;
        
        .code-lang {
          text-transform: uppercase;
          font-weight: 500;
        }
        
        .copy-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          
          &:hover {
            background-color: rgba(0,0,0,0.05);
            color: #4284f5;
          }
          
          &:active {
            transform: scale(0.95);
          }
        }
      }
      
      code {
        display: block;
        padding: 12px;
        background-color: transparent;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      }
    }
    
    :deep(code) {
      background-color: #f1f3f5;
      border-radius: 4px;
      padding: 2px 5px;
      font-size: 0.9em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    
    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      border-radius: 8px;
      overflow: hidden;
      
      th, td {
        border: 1px solid #eee;
        padding: 10px;
        text-align: left;
      }
      
      th {
        background-color: #f9fafb;
        font-weight: 500;
      }
      
      tr:nth-child(even) {
        background-color: #f9f9fb;
      }
    }
  }
}

/* 加载动画 */
.message-loading {
  .loading-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ccc;
    margin: 0 4px;
    animation: loading 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 编辑模式 */
.message-editing {
  .el-textarea {
    width: 100%;
    margin-bottom: 8px;
    
    :deep(.el-textarea__inner) {
      border-color: var(--primary-color);
      font-size: 14px;
    }
  }
  
  .editing-actions {
  display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

/* 消息操作按钮 - 修复位置问题 */
.message-actions {
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  
  .action-button {
    margin-left: 4px;
    color: #999;
    padding: 4px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    
    &:hover {
      color: #4284f5;
      background: white;
    }
  }
}

/* 鼠标悬停时显示操作按钮 */
.message-container:hover .message-actions {
  opacity: 1;
}

/* 暗色模式调整 */
[data-theme="dark"] {
  .message-container {
    &.role-user {
      .message-bubble {
        background-color: #2a2a2a;
        
        .message-text {
          color: #ddd;
        }
      }
      
      .message-header .message-role {
        color: #aaa;
      }
      
      .message-actions .action-button {
        background: rgba(45, 45, 45, 0.7);
        
        &:hover {
          background: #333;
          color: #61a0ff;
        }
      }
    }
    
    &.role-assistant {
      .message-bubble {
        background-color: #1e1e1e;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
        
        .message-text {
          color: #ddd;
        }
        
        .token-count {
          color: #777;
        }
      }
      
      .message-header .message-role {
        color: #aaa;
      }
      
      .message-actions .action-button {
        background: rgba(45, 45, 45, 0.7);
        
        &:hover {
          background: #333;
          color: #61a0ff;
        }
      }
    }
  }
  
  .message-header .message-time {
    color: #888;
  }
  
  .message-bubble {
    .message-text {
      :deep(.code-block) {
        background-color: #1a1a1a;
        border-color: #333;
        
        .code-header {
          background-color: #2a2a2a;
          color: #aaa;
          border-color: #333;
          
          .copy-btn {
            color: #aaa;
            
            &:hover {
              background-color: rgba(255,255,255,0.05);
              color: #61a0ff;
            }
          }
        }
        
        code {
          color: #ddd;
        }
      }
      
      :deep(code) {
        background-color: #2a2a2a;
        color: #ddd;
      }
      
      :deep(pre) {
        background-color: #1a1a1a;
        border-color: #333;
      }
      
      :deep(blockquote) {
        border-left-color: #444;
        color: #aaa;
      }
      
      :deep(table) {
        th, td {
          border-color: #333;
        }
        
        th {
          background-color: #2a2a2a;
        }
        
        tr:nth-child(even) {
          background-color: #2a2a2a;
        }
      }
    }
  }
}

/* 思考内容样式 */
.thinking-bubble {
  width: fit-content;
  font-style: oblique;
  margin-bottom: 12px;
  border-radius: 8px;
  padding: 0px 1px;
  background-color: #353740;
  transition: all 0.3s ease;
  
  &.thinking-active {
    background-color: #353740;
    border-left: 3px solid #409eff;
  }
  
  .thinking-header {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #f5f3f3;
    margin-bottom: 4px;
    
    .thinking-icon {
      margin-right: 4px;
      color: #f6f6f9;
    }
    
    .thinking-title {
      font-weight: 500;
      
      .thinking-dots {
        display: inline-block;
        width: 16px;
        animation: thinking-dots 1.4s infinite;
      }
    }
    
    .toggle-thinking-btn {
      margin-left: auto;
      color: #f5f2f2;
      font-size: 12px;
      padding: 2px 8px;
    }
  }
  
  .thinking-content {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 12px;
    color: #666;
    line-height: 1.6;
    margin-top: 8px;
    transition: all 0.2s;
  }
}

@keyframes thinking-dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* 暗色模式下的思考内容 */
[data-theme="dark"] {
  .thinking-bubble {
    background-color: rgba(41, 53, 72, 0.6);
    border-color: #18222f;
    
    &.thinking-active {
      background-color: rgba(41, 53, 72, 0.9);
      border-left: 3px solid #61a0ff;
    }
    
    .thinking-header {
      background-color: #18222f;
      border-color: #293548;
      
      .thinking-title {
        color: #555657;
      }
      
      .toggle-thinking-btn {
        color: #5a5b5d;
      }
    }
    
    .thinking-content {
      color: #aaa;
      background-color: rgba(24, 34, 47, 0.8);
      
      code {
        background-color: #2a2a2a;
        color: #f08c98;
      }
    }
  }
}
</style>