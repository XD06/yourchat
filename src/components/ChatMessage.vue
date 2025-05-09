<template>
  <!-- 消息容器，根据消息角色和加载状态动态调整样式 -->
  <div 
    :class="[
      'message-container',
      `role-${message.role}`,
      { 'regenerating': message.loading },
      { 'latest-message': isLatestMessage && message.role === 'assistant' },
      { 'completed': messageCompleted },
      { 'history-message': !isLatestMessage || messageCompleted }
    ]"
    :data-message-status="isLatestMessage && !messageCompleted ? 'generating' : 'completed'"
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
          <div class="loading-spinner">
            <svg viewBox="0 0 50 50" class="spinner">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
            </svg>
          </div>
          <span class="loading-text">AI思考中...</span>
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
import { ref, computed, getCurrentInstance, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { ElMessage, ElMessageBox } from 'element-plus'
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
// 导入代码执行工具
import { openCodeModal } from '../utils/codeExecutor'
// 导入markdown渲染函数
import { renderMarkdown } from '../utils/markdown'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isLatestMessage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'delete', 'regenerate'])

const messageText = ref(null)
const isThinkingExpanded = ref(false)
const typingIndex = ref(0)
const isTyping = ref(false)
const displayContent = ref('')
const typingSpeed = ref(20) // ms per character
const typingTimer = ref(null)
const originalContent = ref('')
const messageCompleted = ref(false)

// Markdown renderer setup
const md = markdownIt({
  html: false,
  breaks: true,
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        
        // 添加复制按钮和正确的语言标签，对HTML代码块添加运行按钮
        const isHtml = lang.toLowerCase() === 'html';
        let headerContent = `<span class="code-lang">${lang}</span>
          <div class="code-actions">`;
        
        // 只为HTML代码块添加运行按钮
        if (isHtml) {
          headerContent += `
            <button class="run-btn" title="在沙盒中运行代码">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>`;
        }
        
        // 所有代码块都有复制按钮
        headerContent += `
            <button class="copy-btn" title="复制代码">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>`;
        
        return `<pre class="code-block" data-lang="${lang}">
          <div class="code-header">
            ${headerContent}
          </div>
          <code>${highlighted}</code>
        </pre>`;
      } catch (error) {
        console.error('Highlight error:', error);
        return `<pre class="code-block"><code>${md.utils.escapeHtml(str)}</code></pre>`;
      }
    }
    
    // 无法识别语言时，使用简化的结构
    return `<pre class="code-block" data-lang="plaintext">
      <div class="code-header">
        <span class="code-lang">plaintext</span>
        <div class="code-actions">
          <button class="copy-btn" title="复制代码">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        </div>
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
      handleDelete()
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
      handleDelete()
      break
  }
}

// 统一处理删除消息
const handleDelete = () => {
  // 使用confirm避免误删
  ElMessageBox.confirm('确定要删除这条消息吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete', props.message)
  }).catch(() => {
    // 用户取消，不执行任何操作
  })
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

// 处理AI消息的打字效果
const startTypingEffect = (content) => {
  // 立即判断是否应该执行打字效果
  if (!props.isLatestMessage || 
      messageCompleted.value || 
      props.message.completed || 
      props.message.role !== 'assistant' || 
      props.message.loading) {
    // 历史消息或非AI消息，不执行打字效果
    console.log('跳过打字效果：历史/完成/非AI/正在加载的消息');
    messageCompleted.value = true;
    displayContent.value = content;
    return content;
  }
  
  // 如果已经完成打字，直接返回完整内容
  if (displayContent.value === content) {
    console.log('打字内容已匹配完整内容，直接返回');
    messageCompleted.value = true;
    return content;
  }
  
  // 如果已经开始打字，不重新开始，继续显示当前内容
  if (isTyping.value) {
    console.log('打字效果已在进行中，返回当前内容');
    return displayContent.value || '';
  }
  
  // 如果内容为空，直接返回
  if (!content || content.trim() === '') {
    return '';
  }
  
  console.log('开始新的打字效果，内容长度:', content.length);
  
  // 重置打字状态
  originalContent.value = content;
  displayContent.value = '';
  typingIndex.value = 0;
  isTyping.value = true;
  
  // 清除之前的定时器
  if (typingTimer.value) {
    clearInterval(typingTimer.value);
  }
  
  // 启动打字动画
  typingTimer.value = setInterval(() => {
    if (typingIndex.value < content.length) {
      // 逐字添加内容
      displayContent.value += content[typingIndex.value];
      typingIndex.value++;
    } else {
      // 完成打字效果
      console.log('打字效果完成');
      clearInterval(typingTimer.value);
      isTyping.value = false;
      displayContent.value = content; // 确保最终内容完整
      messageCompleted.value = true; // 标记消息已完成
    }
  }, typingSpeed.value);
  
  return displayContent.value;
};

// 监听消息内容变化以启动打字效果
watch(() => props.message.content, (newContent, oldContent) => {
  if (props.message.role === 'assistant' && props.isLatestMessage && !props.message.loading && newContent) {
    // 如果消息已完成，只更新显示内容，不执行过渡效果
    if (messageCompleted.value) {
      displayContent.value = newContent;
      return;
    }
    
    // 防止流式输出导致的内容变化重复触发打字效果
    if (!isTyping.value && newContent !== oldContent && newContent !== displayContent.value) {
      console.log('消息内容变化，重新开始打字效果');
      startTypingEffect(newContent);
    } else if (isTyping.value && newContent !== oldContent) {
      // 流式输出中，内容有变化但不重新开始打字
      // 只更新原始内容，让打字效果继续
      console.log('流式输出中，更新原始内容但不重新开始打字');
      originalContent.value = newContent;
    }
  }
}, { immediate: true });

// 在组件加载时确定消息状态，避免历史消息显示动画
onMounted(() => {
  // 立即检查是否为历史消息或非最新AI消息
  if (!props.isLatestMessage || props.message.completed || props.message.role !== 'assistant') {
    console.log('历史消息或非最新AI消息，立即标记为完成');
    messageCompleted.value = true;
    displayContent.value = props.message.content || '';
    
    // 强制DOM更新以确保样式应用
    nextTick(() => {
      const element = document.querySelector(`[data-message-status="completed"]`);
      if (element) {
        // 触发一次重新布局以确保CSS应用
        element.style.opacity = '1';
      }
    });
  }
});

// 监听isLatestMessage变化
watch(() => props.isLatestMessage, (isLatest) => {
  // 当消息变为最新消息时，如果是AI消息且有内容，启动打字效果
  if (isLatest && props.message.role === 'assistant' && props.message.content && !isTyping.value) {
    startTypingEffect(props.message.content);
  }
}, { immediate: true });

// 修改formatContent以更严格地处理历史消息
const formatContent = computed(() => {
  // 如果是历史消息或已完成消息，直接返回完整渲染内容
  if (!props.isLatestMessage || messageCompleted.value || props.message.role !== 'assistant') {
    return props.message.content ? renderMarkdown(props.message.content) : '';
  }
  
  // 以下是打字效果的处理逻辑
  // 准备预处理后的内容（用于提前处理块级元素）
  let preprocessedContent = '';
  
  // 如果正在打字中且是AI最新消息，则使用逐渐显示的内容
  if (isTyping.value && props.message.role === 'assistant' && props.isLatestMessage) {
    // 如果打字内容为空但有原始内容，可能是流式输出刚开始
    if (!displayContent.value && originalContent.value) {
      return ''; // 返回空字符串，等待打字效果开始
    }
    preprocessedContent = displayContent.value || '';
  } else {
    preprocessedContent = props.message.content || '';
  }
  
  // 如果内容为空，直接返回空字符串
  if (!preprocessedContent) {
    return '';
  }
  
  // 对预处理内容进行标记，确保块级元素（代码块、公式等）立即完整显示
  const codeBlockRegex = /```[\s\S]*?```/g;
  const mathBlockRegex = /\$\$([\s\S]*?)\$\$/g;
  
  // 替换代码块和数学公式为完整内容
  if (isTyping.value && originalContent.value) {
    const fullContent = originalContent.value;
    
    // 查找原始内容中的所有代码块和数学公式
    const codeBlocks = [...fullContent.matchAll(codeBlockRegex)].map(match => ({
      start: match.index,
      end: match.index + match[0].length,
      content: match[0]
    }));
    
    const mathBlocks = [...fullContent.matchAll(mathBlockRegex)].map(match => ({
      start: match.index,
      end: match.index + match[0].length,
      content: match[0]
    }));
    
    // 合并所有块级元素
    const blocks = [...codeBlocks, ...mathBlocks].sort((a, b) => a.start - b.start);
    
    // 如果当前打字位置已经开始显示块级元素，则显示完整块
    for (const block of blocks) {
      if (block.start < typingIndex.value && block.start < preprocessedContent.length) {
        const partEndIndex = Math.min(
          block.end, 
          typingIndex.value,
          preprocessedContent.length
        );
        
        // 如果已经开始显示这个块但还没完全显示完
        if (block.start <= preprocessedContent.length && partEndIndex > block.start) {
          // 替换为完整块
          preprocessedContent = preprocessedContent.substring(0, block.start) + 
                               block.content + 
                               preprocessedContent.substring(partEndIndex);
        }
      }
    }
  }
  
  // 进行markdown渲染
  return preprocessedContent ? renderMarkdown(preprocessedContent) : '';
});

// 格式化思考内容
const formatThinkingContent = computed(() => {
  if (!props.message.thinkingContent) return '';
  return renderMarkdown(props.message.thinkingContent);
})

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// 高亮代码块并添加复制功能
const setupCodeBlockInteractions = () => {
  //console.log('Setting up code block interactions');
  
      // 添加复制功能处理
      const copyButtons = messageText.value.querySelectorAll('.copy-btn');
      copyButtons.forEach(button => {
    // 移除旧的事件监听器以避免重复绑定
    button.removeEventListener('click', handleCopyClick);
    button.addEventListener('click', handleCopyClick);
  });
  
  // 添加运行HTML代码块功能
  const runButtons = messageText.value.querySelectorAll('.run-btn');
  //console.log(`Found ${runButtons.length} run buttons`);
  runButtons.forEach(button => {
    // 移除旧的事件监听器以避免重复绑定
    button.removeEventListener('click', handleRunClick);
    button.addEventListener('click', handleRunClick);
  });
  
  // 高亮代码块
  const codeBlocks = messageText.value.querySelectorAll('.code-block code');
  codeBlocks.forEach(block => {
    hljs.highlightElement(block);
  });
};

// 处理复制按钮点击
const handleCopyClick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          
  const button = e.currentTarget;
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
};
      
// 处理运行按钮点击
const handleRunClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  console.log('Run button clicked');
  
  const button = e.currentTarget;
  const codeBlock = button.closest('.code-block');
  if (codeBlock) {
    const codeElement = codeBlock.querySelector('code');
    if (codeElement) {
      const htmlCode = codeElement.textContent || '';
      console.log('Opening code modal with HTML code');
      openCodeModal(htmlCode);
    }
    }
};

// 高亮代码块并添加复制功能
onMounted(() => {
  nextTick(() => {
    if (messageText.value) {
      setupCodeBlockInteractions();
    }
  });
});

// 监视消息内容的变化，确保在内容更新后重新绑定事件
watch(() => props.message.content, () => {
  nextTick(() => {
    if (messageText.value) {
      setupCodeBlockInteractions();
    }
  });
});

// 监听消息的completed属性变化
watch(() => props.message.completed, (isCompleted) => {
  if (isCompleted) {
    // 消息完成后，标记为已完成状态，停止所有动画
    messageCompleted.value = true;
    
    // 如果还在打字中，立即完成
    if (isTyping.value) {
      clearInterval(typingTimer.value);
      isTyping.value = false;
      displayContent.value = props.message.content || '';
    }
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (typingTimer.value) {
    clearInterval(typingTimer.value);
  }
});
</script>

<style lang="scss" scoped>
.message-container {
  display: flex;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
  
  // Desktop styles - make messages more centered
  @media (min-width: 769px) {
    width: 90%;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
  
  // User message styling
  &.role-user {
    justify-content: flex-end;
    .message-content {
      align-items: flex-end;
    }
    .message-bubble {
      background-color: #4284f5;
      color: white;
      border-radius: 16px 16px 4px 16px; 
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      
      [data-theme="dark"] & {
        background-color: #3374dc; // 暗色模式下颜色稍深
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      }
      
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
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); // 添加轻微阴影，增强层次感
      @media (max-width: 768px) {
        border-radius: 12px 12px 12px 3px;
      }
      // 暗黑模式下的AI气泡
      [data-theme="dark"] & {
        background-color: #2d2d33;
        color: #e0e0e0;
        border: 1px solid #383838;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18); // 暗色模式阴影更明显一点
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
    width: 36px;
    height: 36px;
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

  // For desktop, make the content slightly narrower for better readability
  @media (min-width: 769px) {
    max-width: 70%;
  }

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
  width: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  }

  [data-theme="dark"] & {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255,255,255,0.1);
    color: #ccc;
    
    &:hover {
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }
  }
  
  .thinking-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: default;
    .thinking-icon {
      margin-right: 6px;
      .el-icon {
        animation: spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
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
      transition: transform 0.15s;
      
      &:hover {
        transform: translateY(-1px);
      }
      
      [data-theme="dark"] & {
        color: #aaa;
      }
    }
  }
  
  .thinking-dots {
    position: relative;
    display: inline-flex;
    width: 12px;
    justify-content: space-between;
    
    &::before,
    &::after,
    & > span {
      content: '.';
      animation: thinkingDots 1.4s infinite;
      opacity: 0;
    }
    
    &::before {
      animation-delay: 0s;
    }
    
    & > span {
      animation-delay: 0.2s;
    }
    
    &::after {
      animation-delay: 0.4s;
    }
  }

  .thinking-content {
    margin-top: 6px;
    padding-top: 6px;
    font-style: italic;
    border-top: 1px dashed rgba(0,0,0,0.08);
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 150px;
    overflow-y: auto;
    font-size: 0.8rem;
    line-height: 1.5;
    scrollbar-width: none;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.1);
      border-radius: 2px;
    }
    
    [data-theme="dark"] & {
      border-top-color: rgba(255,255,255,0.1);
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(255,255,255,0.1);
      }
    }
  }
}

.message-bubble {
  padding: 0.7rem 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: relative;

  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
  }

  .message-text {
    font-size: 0.95rem;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
    
    :deep(pre.code-block) {
      margin: 0.8rem 0;
      border-radius: 10px;
      font-size: 0.85em;
      overflow: hidden;
      max-width: 100%;
      background-color: #f8f9fa;
      border: 1px solid #e3e3e3;
      transition: box-shadow 0.3s, transform 0.2s;
      
      &:hover {
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      [data-theme="dark"] & {
        background-color: #1e1e1e;
        border: 1px solid #333;
        
        &:hover {
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
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
        padding: 8px 12px;
        background-color: rgba(128, 128, 128, 0.1);
        font-size: 0.9em;
        color: #555;
        border-bottom: 1px solid #e3e3e3;
        font-family: 'Fira Code', 'JetBrains Mono', monospace;

        [data-theme="dark"] & {
          color: #bbb;
          border-bottom-color: #333;
        }
        .code-lang {
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
      }
      .code-actions {
        display: flex;
        gap: 8px;
      }
      .copy-btn, .run-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        opacity: 0.7;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        
        &:hover { 
          opacity: 1;
          background-color: rgba(0, 0, 0, 0.05);
          
          [data-theme="dark"] & {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
      }
      code {
        padding: 12px !important;
        display: block;
        overflow-x: auto;
        font-family: "Roboto Mono","Courier New",'Fira Code', 'JetBrains Mono', monospace;
        margin: 0;
        background-color: inherit;
        color: #f56c6c;
        line-height: 1.6;
        scrollbar-width: none;
        
        [data-theme="dark"] & {
          color: #e0e0e0;
        }
      }
    }
      
    :deep(p) {
      margin-bottom: 0.5em;
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
  transition: opacity 0.15s;
  
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
  padding: 0.8rem 0;
  .loading-spinner {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
  .loading-text {
    font-size: 0.9rem;
    color: #555;
    [data-theme="dark"] & {
      color: #bbb;
    }
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
    color: rgba(255,255,255,0.8);
    background-color: rgba(0,0,0,0.25);
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
    
    [data-theme="dark"] &.role-assistant & {
        color: rgba(0,0,0,0.6);
        background-color: rgba(255,255,255,0.2);
    }
    .message-container.role-user & {
        color: rgba(255,255,255,0.9);
        background-color: rgba(0,0,0,0.3);
    }
}

:deep(table) {
  margin: 1em 0;
  font-size: 0.9em;
  font-family: sans-serif;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  border: 1px solid #dddddd;
  overflow: hidden;
  width: auto;
  max-width: 100%;
}

:deep(.table-container) {
  overflow-x: auto;
  max-width: 100%;
  margin: 1.5rem 0;
  border-radius: 6px;
  display: block;
}

:deep(thead tr) {
  background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #2c7a65 100%);
  color: #ffffff;
  text-align: left;
}

:deep(th) {
  position: relative;
  padding: 12px 15px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(th:nth-child(3n+1)) {
  background-color: rgba(231, 76, 60, 0.2);
}

:deep(th:nth-child(3n+2)) {
  background-color: rgba(243, 156, 18, 0.2);
}

:deep(th:nth-child(3n+3)) {
  background-color: rgba(44, 122, 101, 0.2);
}

:deep(th:last-child) {
  border-right: none;
}

:deep(td) {
  padding: 12px 15px;
  border-right: 1px solid #dddddd;
}

:deep(td:last-child) {
  border-right: none;
}

:deep(tbody tr) {
  border-bottom: 1px solid #dddddd;
}

:deep(tbody tr:nth-of-type(even)) {
  background-color: #f8f8f8;
}

:deep(tbody tr:hover) {
  background-color: #f1f1f1;
}

:deep(tbody tr:last-of-type) {
  border-bottom: 2px solid #2c7a65;
}

[data-theme="dark"] {
  :deep(table) {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    border: 1px solid #444;
  }
  
  :deep(thead tr) {
    background: linear-gradient(90deg, #c0392b 0%, #d35400 50%, #1e8449 100%);
    color: #e0e0e0;
  }
  
  :deep(th) {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  :deep(th:nth-child(3n+1)) {
    background-color: rgba(192, 57, 43, 0.2);
  }
  
  :deep(th:nth-child(3n+2)) {
    background-color: rgba(211, 84, 0, 0.2);
  }
  
  :deep(th:nth-child(3n+3)) {
    background-color: rgba(30, 132, 73, 0.2);
  }
  
  :deep(th:last-child) {
    border-right: none;
  }
  
  :deep(td) {
    border-right: 1px solid #444;
  }
  
  :deep(td:last-child) {
    border-right: none;
  }
  
  :deep(tbody tr) {
    border-bottom: 1px solid #444;
  }
  
  :deep(tbody tr:nth-of-type(even)) {
    background-color: #2a2a2a;
  }
  
  :deep(tbody tr:hover) {
    background-color: #333333;
  }
  
  :deep(td), :deep(th) {
    color: #e0e0e0;
  }
}

:deep(.code-block) {
  .code-header {
    margin-top: -20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background-color: #80808036;
    font-size: 0.9em;
    color: #555;
    border-bottom: 1px solid #e3e3e3;
    font-family: 'Fira Code', 'JetBrains Mono', monospace;

    [data-theme="dark"] & {
      color: #bbb;
      border-bottom-color: #333;
    }
    
    .code-lang {
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .code-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .copy-btn, .run-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    
    &:hover { 
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
      
      [data-theme="dark"] & {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
  
  .run-btn {
    color: #28a745;
    
    [data-theme="dark"] & {
      color: #4caf50;
    }
    
    &:hover {
      color: #218838;
      
      [data-theme="dark"] & {
        color: #3d8b40;
      }
    }
  }
}

.code-modal {
  display: none;
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  
  .modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 0;
    border: 1px solid #888;
    width: 85%;
    max-width: 800px;
    height: 80vh;
    max-height: 600px;
    border-radius: 8px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    [data-theme="dark"] & {
      background-color: #202123;
      border-color: #444;
    }
  }
  
  .modal-header {
    padding: 10px 10px;
    background-color: #171818e8;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #dee2e6;
    
    h3 {
      margin: 0;
      font-size: 1.2em;
    }
    
    .modal-actions {
      display: flex;
      gap: 10px;
    }
    
    .close-btn, .fullscreen-btn {
      color: #fff;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      line-height: 1;
      
      &:hover, &:focus {
        color: #eee;
        text-decoration: none;
      }
    }
  }
  
  .modal-body {
    flex: 1;
    padding: 0;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  
  #code-sandbox {
    flex: 1;
    width: 100%;
    height: 100%;
    border: none;
    background: #ffffff;
    
    [data-theme="dark"] & {
      background: #333;
    }
  }
  
  #status-bar {
    padding: 8px 15px;
    font-size: 0.9em;
    min-height: 1.5em;
    background-color: #f1f3f5;
    border-top: 1px solid #dee2e6;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 150px;
    overflow-y: auto;
    color: #333;
    
    [data-theme="dark"] & {
      background-color: #2a2a2a;
      border-color: #444;
      color: #ddd;
    }
    
    .status-running {
      color: #007bff;
    }
    
    .status-success {
      color: #28a745;
    }
    
    .status-error {
      color: #dc3545;
      font-weight: bold;
    }
    
    .status-timeout {
      color: #fd7e14;
      font-weight: bold;
    }
    
    .log-message {
      margin-left: 10px;
      font-family: monospace;
      font-size: 0.9em;
      display: block;
      margin-top: 3px;
    }
  }
  
  &.fullscreen .modal-content {
    width: 100% !important;
    height: 100% !important;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
}

:deep(.code-block-animate) {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

:deep(.table-animate) {
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-effect {
  position: relative;
  display: inline-block;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: currentColor;
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  transform-origin: center;
  will-change: opacity, transform;
}

@keyframes blink {
  0%, 100% { 
    opacity: 1;
    transform: scaleY(1);
  }
  40% { 
    opacity: 0.7;
    transform: scaleY(0.95);
  }
  50% { 
    opacity: 0.5;
    transform: scaleY(0.9);
  }
  60% { 
    opacity: 0.7;
    transform: scaleY(0.95);
  }
}

@keyframes thinkingDots {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* 加载动画样式 */
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  .spinner {
    animation: rotate 2s linear infinite;
    width: 20px;
    height: 20px;
    
    .path {
      stroke: black;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>

