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
.message-container {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start; // 确保头像和内容顶部对齐

  // 移动端优化：减小外边距
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }

  // 用户消息靠右
  &.role-user {
    justify-content: flex-end;
    .message-content {
      align-items: flex-end;
    }
    .message-bubble {
      background-color: #4284f5;
      color: white;
      border-radius: 16px 16px 4px 16px; // 调整圆角，更有聊天气泡感
      @media (max-width: 768px) {
        border-radius: 12px 12px 3px 12px;
      }
    }
    .avatar {
      margin-left: 10px;
      @media (max-width: 768px) {
        margin-left: 6px;
      }
    }
  }
  
  // AI消息靠左
  &.role-assistant {
    justify-content: flex-start;
    .message-bubble {
      background-color: rgb(255, 255, 255);
        color: #333;
      border-radius: 16px 16px 16px 4px;
      @media (max-width: 768px) {
        border-radius: 12px 12px 12px 3px;
      }
      // 暗黑模式下的AI气泡
      [data-theme="dark"] & {
        background-color: #2d2d33;
        color: #e0e0e0;
        border: 1px solid #383838;
    }
    }
    .avatar {
      margin-right: 10px;
      @media (max-width: 768px) {
        margin-right: 6px;
      }
    }
  }
  
  // 正在重新生成时的样式
  &.regenerating {
    opacity: 0.7;
    }
  }
  
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0; // 防止头像被压缩

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
  }

  &.assistant-avatar {
    background-color: transparent; // AI头像背景色
  color: white;
    font-size: 20px;
    svg {
      width: 35px;
      height: 35px;
  }
  }

  &.user-avatar {
    background-color: transparent; // 用户头像背景色
    color: #555;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }
}

.message-content {
        display: flex;
  flex-direction: column;
  max-width: 80%; // 限制消息内容最大宽度，避免过长

  // 移动端消息内容占满可用空间
  @media (max-width: 768px) {
    max-width: calc(100% - 40px); // 减去头像和一些间距
  }
}

.message-header {
          display: flex;
          align-items: center;
  margin-bottom: 0.3rem;
  font-size: 0.75rem;
  color: #888;

  [data-theme="dark"] & {
    color: #aaa;
  }

  .message-role {
        font-weight: 500;
    margin-right: 8px;
      }
    }

.thinking-bubble {
  padding: 8px 12px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.03);
    margin-bottom: 8px;
  font-size: 0.85rem;
  color: #555;
  border: 1px solid rgba(0,0,0,0.05);

  [data-theme="dark"] & {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255,255,255,0.1);
    color: #ccc;
  }
  
  .thinking-header {
  display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: default;
    .thinking-icon {
      margin-right: 6px;
      .el-icon {
        animation: spin 1.5s linear infinite;
      }
    }
    .thinking-title {
      flex-grow: 1;
  display: flex;
      align-items: center;
    }
    .toggle-thinking-btn {
      padding: 0;
      font-size: 0.9rem;
      color: #888;
      [data-theme="dark"] & {
        color: #aaa;
      }
    }
  }
  .thinking-dots span {
    opacity: 0;
    animation: blink 1s infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }

  .thinking-content {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed rgba(0,0,0,0.08);
    white-space: pre-wrap; // 保持思考内容的格式
    word-break: break-all;
    max-height: 150px; // 限制思考内容最大高度
    overflow-y: auto;
    font-size: 0.8rem;
    line-height: 1.5;
    [data-theme="dark"] & {
      border-top-color: rgba(255,255,255,0.1);
        }
      }
    }
    
      .message-bubble {
  padding: 0.7rem 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word; // 确保长单词或链接能换行
  position: relative;

  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
  }

  .message-text {
   // white-space: pre-wrap; // 保持消息中的换行和空格
    font-size: 0.95rem;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 0.9rem;
      }
      
    // 代码块优化
    :deep(pre.code-block) {
      margin: 0.8rem 0;
      border-radius: 8px;
      font-size: 0.85em;
      overflow: hidden; // 让内部的 code-header 和 code 来控制滚动和边距
      max-width: 100%;
      background-color: #f8f9fa; // 统一的背景色
      border: 1px solid #e3e3e3; // 添加边框

      [data-theme="dark"] & {
        background-color: #1e1e1e; // 暗黑模式下的背景色
        border: 1px solid #333;
      }

      @media (max-width: 768px) {
        font-size: 0.8em;
        margin: 0.6rem 0;
      }
        
        .code-header {
        margin-top: -20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px; // 调整内边距使其更紧凑
        background-color: #80808036; // 继承父元素的背景色
        font-size: 0.9em; // 相对于 pre 的字体大小
        color: #555;
        border-bottom: 1px solid #e3e3e3; // 与外边框颜色一致
        font-family: 'Fira Code', 'JetBrains Mono', monospace;

        [data-theme="dark"] & {
          color: #bbb;
          border-bottom-color: #333;
        }
        .code-lang {
            font-weight: 500;
            text-transform: uppercase;
        }
      }
      .copy-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        opacity: 0.7;
        padding: 2px; // 确保按钮有足够的点击区域
        display: flex; // 使图标居中
        align-items: center;
        justify-content: center;
        &:hover { opacity: 1; }
          }
        code {
        padding: 12px !important; // 调整代码区域的内边距
        display: block;
        overflow-x: auto;
        font-family: 'Fira Code', 'JetBrains Mono', monospace;
        margin: 0; // 移除可能存在的默认margin
        background-color: inherit; // 继承父元素的背景色
        color: #333; // 默认代码颜色
        [data-theme="dark"] & {
            color: #e0e0e0; // 暗黑模式代码颜色
        }
      }
      }
      
    :deep(p) {
      margin-bottom: 0.5em; // 段落间距
      &:last-child {
        margin-bottom: 0;
        }
    }
    :deep(ul), :deep(ol) {
      margin: 0.5em 0 0.5em 1.5em;
      padding-left: 1em;
        }
    :deep(li) {
      margin-bottom: 0.25em;
        }
      }
    }

.message-actions {
  display: flex;
  align-items: center;
  margin-top: 0.3rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  .message-container:hover & {
    opacity: 1;
  }

  .action-button {
    color: #999;
    padding: 2px 4px;
    min-height: auto;
    [data-theme="dark"] & {
      color: #888;
      &:hover { color: #bbb; }
    }
    &:hover {
      color: #555;
    }
    .el-icon {
      font-size: 14px;
    }
  }
  }
  
.message-loading {
    display: flex;
    align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
  .loading-dot {
    width: 6px;
    height: 6px;
    margin: 0 2px;
    background-color: currentColor; // 使用父元素的颜色
    border-radius: 50%;
        display: inline-block;
    animation: loading-blink 1.4s infinite both;
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes loading-blink {
  0%, 80%, 100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message-editing {
  .editing-actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

.token-count {
    position: absolute;
    bottom: 4px;
    right: 8px;
    font-size: 0.65rem;
    color: rgba(255,255,255,0.6);
    background-color: rgba(0,0,0,0.2);
    padding: 1px 4px;
    border-radius: 3px;
    [data-theme="dark"] &.role-assistant & {
        color: rgba(0,0,0,0.5);
        background-color: rgba(255,255,255,0.15);
    }
    // 用户消息的气泡颜色不同，所以token提示也需要调整
    .message-container.role-user & {
        color: rgba(255,255,255,0.7);
  }
}
</style>