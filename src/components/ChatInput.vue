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
  position: relative;
  margin-top: auto; // 确保输入框始终在底部

  // 移动端优化
  @media (max-width: 768px) {
    padding: 0.5rem 0.5rem 0.5rem 0.5rem; // 减小内边距
    border-radius: 0; // 移除圆角
    border-top: 1px solid rgba(0, 0, 0, 0.1); // 添加顶部边框增强分隔感
    position: sticky; // 固定在底部
    bottom: 0;
    background-color: var(--chat-input-bg, #ffffff);
    z-index: 100; // 确保输入框始终在顶层
    backdrop-filter: blur(10px); // 模糊背景效果
    margin-top: 1rem; // 添加与消息的间距
  }
}

// 输入区与按钮的容器
.input-wrapper {
  position: relative;
  border-radius: 8px;
  background-color: var(--chat-input-bg, #ffffff);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  @media (max-width: 768px) {
    box-shadow: none;
    border-radius: 8px;
    margin-bottom: 0;
  }
}

// 输入控制区域
.input-control-area {
  display: flex;
  align-items: flex-end;
  width: 100%;
  background-color: var(--chat-input-bg, #ffffff);
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 8px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 12px; // 增加圆角
    margin-bottom: 5px; // 底部边距
  }

  :deep(.el-textarea__inner) {
    resize: none;
    padding: 12px 50px 12px 12px; // 右侧留出空间给按钮
    border: none;
    background-color: transparent;
    font-size: 0.95rem;
    line-height: 1.5;
    min-height: 60px; // 设定最小高度
    max-height: 150px; // 设定最大高度

    @media (max-width: 768px) {
      padding: 10px 12px; // 简化内边距
      min-height: 50px; // 减小最小高度
      font-size: 0.9rem; // 略微减小字体
    }
  }
}

// 按钮组样式
.button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 10px;
  position: absolute;
  right: 0;
  bottom: 10px;

  @media (max-width: 768px) {
    bottom: 5px; // 按钮位置上移
    padding-right: 8px; // 减少右侧内边距
    gap: 4px; // 减小按钮间距
    
    // 缩小移动端的按钮尺寸
    .el-button {
      padding: 6px !important;
      font-size: 12px !important;
      height: auto !important;

      .el-icon {
        font-size: 16px !important; // 减小图标尺寸
      }
    }
  }
}

// 发送按钮样式
.send-button {
  transition: all 0.3s ease;
  margin-left: 4px;

  @media (max-width: 768px) {
    margin-left: 2px; // 减小间距
    // 可以考虑在移动端仅显示图标，不显示文字
    span:not(.el-icon) {
      display: none; // 隐藏文字，只保留图标
    }
  }

  &.pause-button {
    background-color: #ff9800;
    border-color: #ff9800;
  }
}

// 文件上传区域样式
.upload-area {
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: var(--chat-input-bg, #ffffff);
  padding: 10px;
  border: 1px solid var(--border-color, #dcdfe6);

  @media (max-width: 768px) {
    margin-bottom: 8px;
    padding: 8px;
  }
  
  // 省略其他上传区样式...
}

// 工具栏样式
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    margin-bottom: 5px; // 减少底部间距
    
    // 工具栏按钮也需要更小
    .tool-btn {
      padding: 4px 8px !important;
      font-size: 12px !important;
      
      .el-icon {
        font-size: 14px !important;
      }
    }
  }
}

// Token计数器样式
.token-counter {
  font-size: 0.75rem;
  color: #888;
  text-align: right;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 768px) {
    font-size: 0.7rem; // 更小的字体
    margin-top: 2px;
    opacity: 0.7; // 略微透明以减少视觉干扰
  }
}

// 角色选择浮层
.role-popup-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    // 移动端下的角色选择器应该从底部弹出
    align-items: flex-end;
  }

  .role-popup {
    background-color: var(--chat-input-bg, #ffffff);
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    width: 450px;
    max-width: 80vw;
    max-height: 70vh;
    overflow-y: auto;
    z-index: 2;
    
    @media (max-width: 768px) {
      width: 100%; // 占满全宽
      max-width: 100%;
      max-height: 80vh;
      border-radius: 16px 16px 0 0; // 只圆角上部
    }
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
