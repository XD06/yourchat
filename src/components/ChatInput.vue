<template>
  <!-- 聊天输入容器 -->
  <div class="chat-input-container">
    <div class="toolbar">
        <div class="toolbar-actions">
          <el-button 
            class="tool-btn role-btn"
            size="small" 
            type="text" 
            style="color: black;bottom: 10px;"
            title="快速选择ai角色"
            @click.stop="toggleRolePrompt"
          >
            <el-icon><Avatar /></el-icon>
            <span>角色</span>
          </el-button>
        </div>
      </div>
    <!-- 输入框和按钮的组合 -->
    <div class="input-wrapper">
      <!-- 添加文件上传区域 -->
      <div class="upload-area" v-if="showUpload">
        <el-upload
          class="upload-component"
          :action="null"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          multiple
        >
          <template #trigger>
            <el-button type="primary" :icon="Plus">添加文件</el-button>
          </template>
        </el-upload>
        
        <!-- 预览区域 -->
        <div class="preview-list" v-if="selectedFiles.length">
          <div v-for="(file, index) in selectedFiles" :key="index" class="preview-item">
            <!-- 图片预览 -->
            <img v-if="isImage(file)" :src="getPreviewUrl(file)" class="preview-image"/>
            <!-- 文件名预览 -->
            <div v-else class="file-preview">
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
            </div>
            <!-- 删除按钮 -->
            <el-button 
              class="delete-btn" 
              type="danger" 
              :icon="Delete" 
              circle
              @click="removeFile(index)"
            />
          </div>
        </div>
      </div>
      
      <!-- 工具栏区域 -->


      <div class="input-control-area">
        <el-input
          v-model="messageText"
          type="textarea"
          :rows="2"
          :autosize="{ minRows: 2, maxRows: 5 }"
          :placeholder="placeholder"
          resize="none"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact="newline"
          @input="adjustHeight"
          ref="inputRef"
        />
        
        <div class="button-group">
          <!-- 添加切换上传区域的按钮 -->
          <el-tooltip content="上传文件" placement="top">
            <el-button
              circle
              :icon="Upload"
              @click="toggleUpload"
            />
          </el-tooltip>
          
          <el-tooltip content="清空对话" placement="top">
            <el-button
              circle
              type="danger"
              :icon="Delete"
              @click="handleClear"
            />
          </el-tooltip>
          
          <el-button
            class="send-button"
            :class="{ 'pause-button': isGenerating }"
            type="primary"
            @click="isGenerating ? handlePause() : handleSend()"
          >
            <template #icon>
              <el-icon>
                <component :is="isGenerating ? 'VideoPause' : 'Position'"></component>
              </el-icon>
            </template>
            {{ isGenerating ? '暂停' : '发送' }}
          </el-button>
        </div>
      </div>
    </div>
    <!-- Token计数器 -->
    <div class="token-counter">
      已使用 Token: {{ tokenCount.total }} (提示: {{ tokenCount.prompt }}, 回复: {{ tokenCount.completion }})
      <el-tooltip content="Token 计算基于本地算法，可能与实际使用略有差异" placement="top">
        <el-icon class="info-icon"><InfoFilled /></el-icon>
      </el-tooltip>
    </div>
    
    <!-- 角色选择浮层，像三点菜单一样实现 -->
    <transition name="fade">
      <div class="role-popup-container" v-if="showRolePrompt">
        <div class="role-overlay" @click="toggleRolePrompt"></div>
        <div class="role-popup" ref="rolePopup">
          <div class="role-prompt-header">
            <h4>选择AI角色</h4>
            <el-button type="text" @click="toggleRolePrompt">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          
          <div class="role-categories">
            <div 
              v-for="(category, index) in roleCategories" 
              :key="index"
              class="role-category"
              :class="{ active: activeCategoryIndex === index }"
              @click="activeCategoryIndex = index"
            >
              {{ category.name }}
            </div>
          </div>
          
          <div class="role-list">
            <div 
              v-for="(role, index) in activeCategory.roles" 
              :key="index"
              class="role-item"
              @click="selectRole(role)"
            >
              <div class="role-icon" :style="{ backgroundColor: role.color }">
                {{ role.icon || role.name.charAt(0) }}
              </div>
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-desc">{{ role.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Delete, Position, Upload, Plus, Document, InfoFilled, VideoPause, Close } from '@element-plus/icons-vue'
import { Avatar } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'
import { ElMessageBox, ElMessage } from 'element-plus'
import { messageHandler } from '../utils/messageHandler'

// 定义组件的属性
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  availableRoles: {
    type: Array,
    default: () => []
  }
})

// 定义组件的事件
const emit = defineEmits(['send', 'clear', 'role-selected', 'pause'])

// 使用聊天存储
const chatStore = useChatStore()
// 消息文本的响应式引用
const messageText = ref('')
// 是否正在生成消息的状态
const isGenerating = ref(false)

// 监听loading属性变化
watch(() => props.loading, (newValue) => {
  isGenerating.value = newValue
})

// 输入框的占位符
const placeholder = `输入消息，按Enter发送
Shift + Enter 换行`

// 计算属性，用于获取聊天存储中的Token计数
const tokenCount = computed(() => chatStore.tokenCount)

// 监听输入框内容变化，实时计算token
const currentInputTokens = computed(() => {
  return messageText.value ? messageHandler.countTokens(messageText.value) : 0
})

const showUpload = ref(false)
const selectedFiles = ref([])

// 角色选择功能
const showRolePrompt = ref(false)
const activeCategoryIndex = ref(0)

// 角色分类和角色列表
const roleCategories = [
  {
    name: "常用",
    roles: [
      {
        name: "通用助手",
        description: "有帮助、无害和诚实的AI助手",
        color: "#1890ff",
        prompt: "你是一个有帮助、无害和诚实的AI助手。"
      },
      {
        name: "编程专家",
        description: "精通编程和软件开发的专家",
        color: "#722ed1",
        prompt: "你是一位精通编程和软件开发的专家，拥有多种编程语言和框架的丰富知识。请提供详细、准确的代码示例和解释。"
      },
      {
        name: "创意写手",
        description: "富有创意的故事讲述者和内容创作者",
        color: "#eb2f96",
        prompt: "你是一位擅长讲故事、创意写作和内容创作的写手。请帮助撰写吸引人的叙事、故事和创意内容。"
      }
    ]
  },
  {
    name: "专业领域",
    roles: [
      {
        name: "商业分析师",
        description: "精通商业分析和战略的专家",
        color: "#52c41a",
        prompt: "你是一位技能娴熟的商业分析师，专长于市场分析、商业战略和组织规划。请提供有见地的分析和实用建议。"
      },
      {
        name: "学术研究员",
        description: "具有研究方法专业知识的学者",
        color: "#faad14",
        prompt: "你是一位学术研究员，在研究方法、文献综述和学术写作方面拥有丰富经验。请帮助解答研究问题、设计方法论和进行学术写作。"
      },
      {
        name: "法律顾问",
        description: "精通法律事务和法规的专家",
        color: "#13c2c2",
        prompt: "你是一位了解各种法律领域的专家。请提供一般性的法律信息和考虑因素，同时明确表示你不是在提供官方法律建议。"
      }
    ]
  },
  {
    name: "专业技能",
    roles: [
      {
        name: "数学导师",
        description: "精于解释数学概念的专家",
        color: "#fa8c16",
        prompt: "你是一位数学导师，善于用简单的语言解释复杂的数学概念。请逐步帮助解决数学问题，并解释基本原理。"
      },
      {
        name: "语言教练",
        description: "帮助语言学习和语言学的专家",
        color: "#a0d911",
        prompt: "你是一位语言教练，专门教授语言和解释语言学概念。请帮助学习语言、语法、词汇和发音。"
      },
      {
        name: "职业顾问",
        description: "职业发展和求职方面的专家",
        color: "#1890ff",
        prompt: "你是一位职业顾问，在专业发展、简历制作、面试准备和求职策略方面拥有专业知识。请为职业发展提供实用指导。"
      }
    ]
  }
]

// 当前选中的角色分类
const activeCategory = computed(() => {
  return roleCategories[activeCategoryIndex.value] || roleCategories[0]
})

// 切换角色选择区域显示
const toggleRolePrompt = () => {
  console.log('Role button clicked, toggling prompt area', new Date().toISOString())
  showRolePrompt.value = !showRolePrompt.value
  console.log('showRolePrompt is now:', showRolePrompt.value)
  
  if (showRolePrompt.value) {
    showUpload.value = false // 关闭上传区域
    
    // 等待DOM更新后设置焦点到弹窗
    setTimeout(() => {
      if (rolePopup.value) {
        rolePopup.value.focus && rolePopup.value.focus()
        
        // 添加ESC键监听关闭弹窗
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            showRolePrompt.value = false
            document.removeEventListener('keydown', handleKeyDown)
          }
        }
        document.addEventListener('keydown', handleKeyDown)
      }
    }, 100)
  }
}

// 选择角色
const selectRole = (role) => {
  if (role && role.prompt) {
    showRolePrompt.value = false // 选择后关闭角色面板
    ElMessage.success(`已选择角色: ${role.name}`)
    // 触发角色选择事件，传递角色对象
    emit('role-selected', role)
  }
}

// 切换上传区域显示
const toggleUpload = () => {
  showUpload.value = !showUpload.value
  showRolePrompt.value = false // 关闭角色选择
}

// 处理文件选择
const handleFileChange = (file) => {
  selectedFiles.value.push(file.raw)
}

// 移除文件
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// 判断是否为图片文件
const isImage = (file) => {
  return file.type.startsWith('image/')
}

// 获取预览URL
const getPreviewUrl = (file) => {
  return URL.createObjectURL(file)
}

// 处理暂停生成
const handlePause = () => {
  console.log('按钮事件: 暂停生成');
  try {
    emit('pause');
    isGenerating.value = false;
    ElMessage.info('已暂停生成回复');
  } catch (error) {
    console.error('暂停生成失败:', error);
    ElMessage.error('暂停生成失败');
    isGenerating.value = false; // 确保状态重置
  }
}

// 修改发送处理函数
const handleSend = async () => {
  if ((!messageText.value.trim() && selectedFiles.value.length === 0) || isGenerating.value) return
  
  try {
    // 处理文件上传
    const fileContents = await Promise.all(
      selectedFiles.value.map(async (file) => {
        if (isImage(file)) {
          return await convertImageToBase64(file)
        } else {
          return await readFileContent(file)
        }
      })
    )

    // 组合消息内容
    let content = messageText.value
    if (fileContents.length > 0) {
      content = content + '\n' + fileContents.join('\n')
    }

    emit('send', content)
    isGenerating.value = true
    messageText.value = ''
    selectedFiles.value = []
    showUpload.value = false
  } catch (error) {
    console.error('发送失败:', error)
    ElMessage.error('发送失败，请重试')
  }
}

// 将图片转换为base64
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(`![${file.name}](${e.target.result})`)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 读取文件内容
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(`\`\`\`\n${e.target.result}\n\`\`\``)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// 处理换行的函数
const newline = (e) => {
  // 在消息文本中添加换行符
  messageText.value += '\n'
}

// 处理清空对话的函数
const handleClear = async () => {
  try {
    // 使用Element Plus的消息框组件，提示用户是否确定清空对话记录
    await ElMessageBox.confirm(
      '确定要清空所有对话记录吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    // 如果用户确认清空，则触发clear事件
    emit('clear')
  } catch {
    // 如果用户取消操作，则不做任何事情
  }
}

const inputRef = ref(null)

// 调整输入框高度的方法
const adjustHeight = () => {
  if (inputRef.value) {
    const textarea = inputRef.value.$el.querySelector('textarea')
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }
}

const rolePopup = ref(null)
</script>

<style lang="scss" scoped>
// 聊天输入容器的样式
.chat-input-container {
  // padding: 1rem; // 由 .modern-chat-input 在 ChatView.vue 中控制外部间距
  background-color: transparent;
  width: 100%; // 继承父容器的宽度
  box-sizing: border-box; // 确保 padding 和 border 不会增加总宽度
  
  // 移动端适配 - 内部间距可以小一些
  @media (max-width: 768px) {
    // padding: 0.75rem 0.5rem; // 由 .modern-chat-input 控制
  }
}

// 输入框和按钮组合的样式
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  background-color: var(--chat-input-bg, white); // 使用CSS变量以支持主题切换
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: visible; // 允许角色弹窗等溢出
  padding: 8px; // 给内部元素一些空间
  
  [data-theme="dark"] & {
    --chat-input-bg: #2d2d33;
    background-color: var(--chat-input-bg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    border: 1px solid #3a3a3c;
  }
  
  @media (max-width: 768px) {
    border-radius: 12px; // 移动端圆角可以小点
    gap: 0.5rem;
    padding: 6px;
  }
}

.input-control-area {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  position: relative;
  padding: 12px 16px;
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 10px 12px;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .el-input {
    flex: 1;
    
    :deep(.el-textarea__inner) {
      transition: all 0.3s;
      line-height: 1.6;
      padding: 12px 0;
      border: none;
      border-radius: 0;
      resize: none;
      box-shadow: none;
      font-size: 15px;
      background-color: transparent;
      
      // 暗黑模式
      [data-theme="dark"] & {
        color: #e0e0e0;
        
        &::placeholder {
          color: #777;
        }
      }
      
      &:focus {
        box-shadow: none;
      }
      
      // 移动端适配
      @media (max-width: 768px) {
        font-size: 14px;
        padding: 8px 0;
      }
    }
  }
  
  .input-actions {
    display: flex;
    gap: 8px;
    margin-right: 4px;
    align-items: flex-end;
    margin-bottom: 8px;
    
    .role-btn {
      color: #909399;
      background-color: #f5f7fa;
      
      // 暗黑模式
      [data-theme="dark"] & {
        background-color: #3a3a3c;
        color: #c0c0c0;
      }
      
      &:hover {
        background-color: #ecf5ff;
        color: #4284f5;
        
        // 暗黑模式
        [data-theme="dark"] & {
          background-color: #4a4a4c;
          color: #5c9cff;
        }
      }
    }
  }
}

// 按钮组的样式
.button-group {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  
  // 移动端适配
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
  
  // 为发送按钮添加特定样式
  .send-button {
    background-color: #202123 !important; 
    border-color: #202123 !important;
    color: white;
    min-width: 80px;
    transition: all 0.2s ease;
    border-radius: 8px;
    
    // 暗黑模式
    [data-theme="dark"] & {
      background-color: #4284f5 !important;
      border-color: #4284f5 !important;
    }
    
    &:hover {
      background-color: #353740 !important;
      border-color: #353740 !important;
      
      // 暗黑模式
      [data-theme="dark"] & {
        background-color: #539bff !important;
        border-color: #539bff !important;
      }
    }
    
    &:active {
      opacity: 0.9;
    }
    
    // 暂停按钮样式
    &.pause-button {
      background-color: #ef4444 !important;
      border-color: #ef4444 !important;
      
      &:hover {
        background-color: #dc2626 !important;
        border-color: #dc2626 !important;
      }
    }
    
    // 移动端适配
    @media (max-width: 768px) {
      min-width: 0;
      flex-grow: 1;
    }
  }
  
  .el-button {
    border-radius: 8px;
    background-color: #f5f5f7!important;
    border: none;
    color: #666;
    
    // 暗黑模式
    [data-theme="dark"] & {
      background-color: #3a3a3c !important;
      color: #c0c0c0;
    }
    
    &:hover {
      background-color: #eaeaec!important;
      color: #202123;
      
      // 暗黑模式
      [data-theme="dark"] & {
        background-color: #4a4a4c !important;
        color: #e0e0e0;
      }
    }
  }
}

// Token计数器的样式
.token-counter {
  font-size: 0.8rem;
  color: #888;
  text-align: right;
  padding: 0 8px 4px; // 调整padding使其在input-wrapper内部对齐
  width: 100%;
  box-sizing: border-box;
  
  // 暗黑模式
  [data-theme="dark"] & {
    color: #888; // 暗黑模式下颜色调整
  }
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 0 6px 3px;
  }
  
  .info-icon {
    cursor: help;
    color: #999;
    
    // 暗黑模式
    [data-theme="dark"] & {
      color: #777;
    }
  }
}

.upload-area {
  margin-bottom: 0;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f2f5;
  background-color: white;
  
  // 暗黑模式
  [data-theme="dark"] & {
    background-color: #2d2d33;
    border-bottom: 1px solid #3a3a3c;
  }
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
  
  .upload-component {
    display: flex;
    justify-content: center;
  }
  
  .preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
    
    // 移动端适配
    @media (max-width: 768px) {
      gap: 0.75rem;
      margin-top: 0.75rem;
    }
    
    .preview-item {
      position: relative;
      width: 100px;
      height: 100px;
      
      // 移动端适配
      @media (max-width: 768px) {
        width: 80px;
        height: 80px;
      }
      
      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
      
      .file-preview {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        
        // 暗黑模式
        [data-theme="dark"] & {
          background-color: #3a3a3c;
          border-color: #4a4a4c;
        }
        
        .el-icon {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          color: #666;
          
          // 暗黑模式
          [data-theme="dark"] & {
            color: #c0c0c0;
          }
        }
        
        span {
          font-size: 0.8rem;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 90%;
          color: #333;
          
          // 暗黑模式
          [data-theme="dark"] & {
            color: #e0e0e0;
          }
        }
      }
      
      .delete-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        padding: 4px;
        transform: scale(0.8);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

// 角色按钮容器，用于定位下拉菜单
.role-button-container {
  position: relative;
}

// 角色提示区域样式
.role-popup-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //background-color: rgba(0, 0, 0, 0.5);
  z-index: 1999;
}

.role-popup {
  position: absolute;
  //top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //width: 600px;
  max-width: 90vw;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 16px;
  max-height: 80vh;
  overflow: auto;
  
  .role-prompt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    h4 {
      font-size: 16px;
      margin: 0;
      color: #333;
    }
  }
  
  .role-categories {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    
    .role-category {
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
      
      &:hover {
        color: #4284f5;
      }
      
      &.active {
        color: #4284f5;
        font-weight: 500;
        border-bottom-color: #4284f5;
      }
    }
  }
  
  .role-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    
    .role-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      background-color: #f9fafb;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #eaeaea;
      
      &:hover {
        background-color: #f0f2f5;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
      }
      
      .role-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 500;
        font-size: 14px;
        flex-shrink: 0;
      }
      
      .role-info {
        flex: 1;
        
        .role-name {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
          color: #333;
        }
        
        .role-desc {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
  
  // 确保在移动端不会过宽
  @media (max-width: 768px) {
    max-width: calc(100vw - 20px); // 考虑屏幕边缘留白
    left: 50%;
    transform: translateX(-50%); 
    // bottom: auto; // 如果输入框不在屏幕底部，可能需要调整bottom或top
    // top: 100%; // 例如，显示在输入框下方
    // margin-top: 8px; 
  }
}

// 暗色模式
[data-theme="dark"] {
  .input-wrapper {
    background-color: #2d2d33;
  }
  
  .input-control-area {
    .el-input {
      :deep(.el-textarea__inner) {
        color: #ddd;
      }
    }
    
    .input-actions {
      .role-btn {
        background-color: #353740;
        color: #aaa;
        
        &:hover {
          background-color: #424450;
          color: #ddd;
        }
      }
    }
  }
  
  .button-group {
    .el-button {
      background-color: #353740;
      color: #aaa;
      
      &:hover {
        background-color: #424450;
        color: #ddd;
      }
    }
  }
  
  .token-counter {
    color: #777;
    
    .info-icon {
      color: #666;
    }
  }
  
  .upload-area {
    background-color: #2d2d33;
    border-color: #424450;
    
    .preview-item {
      .file-preview {
        background-color: #353740;
        border-color: #424450;
        
        .el-icon {
          color: #aaa;
        }
        
        span {
          color: #ddd;
        }
      }
    }
  }
  
  .role-popup-container {
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .role-popup {
    background-color: #202123;
    border-color: #353740;
  }
}

// 暗色模式下的角色按钮
[data-theme="dark"] .input-actions .role-btn {
  background-color: #2d2d33;
  color: #aaa;
  
  &:hover {
    background-color: #353740;
    color: #61a0ff;
  }
}
</style>
