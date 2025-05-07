# MyChat 技术文档

本文档详细介绍了MyChat应用程序的技术实现细节，重点说明关键功能的代码结构和设计思路。

## 目录

1. [项目架构](#项目架构)
2. [聊天界面实现](#聊天界面实现)
3. [滚动到底部功能实现](#滚动到底部功能实现)
4. [API和模型集成](#API和模型集成)
5. [暗黑模式实现](#暗黑模式实现)
6. [数据存储和持久化](#数据存储和持久化)
7. [性能优化](#性能优化)
8. [移动端适配](#移动端适配)

## 项目架构

MyChat采用Vue 3的组合式API构建，使用Pinia进行状态管理，Element Plus作为UI组件库。

### 主要文件结构

- `/src/views/ChatView.vue` - 主聊天界面
- `/src/components/` - 可复用组件目录
  - `ChatMessage.vue` - 聊天消息组件
  - `ChatInput.vue` - 聊天输入组件
  - `AppLogo.vue` - 应用程序Logo组件
- `/src/stores/` - Pinia状态管理
  - `chat.js` - 聊天消息状态
  - `settings.js` - 应用设置状态
- `/src/utils/` - 工具函数
  - `messageHandler.js` - 消息处理工具

### 技术栈

- Vue 3 - 前端框架
- Pinia - 状态管理
- Element Plus - UI组件库
- SCSS - 样式预处理
- Vite - 构建工具

## 聊天界面实现

聊天界面是应用程序的核心，由多个组件协同工作实现。

### 容器结构

```html
<div class="chat-view-container">
    <div class="icon-sidebar">...</div>
    <div class="sidebar">...</div>
    <div class="main-chat-area">
        <div class="chat-header">...</div>
        <div class="messages-container" ref="messagesContainer" @scroll="handleScroll">...</div>
        <chat-input ref="chatInputRef" .../>
    </div>
</div>
```

### 消息处理流程

1. 用户通过`ChatInput`组件输入消息
2. `handleSend`方法接收内容并添加到消息列表
3. 消息通过API发送到模型获取回复
4. 流式响应通过回调函数更新助手消息内容
5. 完成后更新状态和Token计数

```javascript
const handleSend = async (content) => {
  // 添加用户消息
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: content,
    timestamp: new Date().toISOString()
  };
  chatStore.addMessage(userMessage);
  
  // 添加空的AI回复消息
  const assistantMessage = {
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    completed: false
  };
  chatStore.messages.push(assistantMessage);
  
  // API调用流程...
}
```

## 滚动到底部功能实现

滚动到底部功能允许用户在查看历史消息后快速返回到最新消息位置。

### HTML结构

```html
<div 
    class="scroll-to-bottom-btn" 
    :class="{ 'visible': showScrollButton }"
    @click="scrollToBottom"
>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="7 13 12 18 17 13"></polyline>
        <polyline points="7 6 12 11 17 6"></polyline>
    </svg>
</div>
```

### 核心实现

#### 1. 检测滚动位置

```javascript
// 判断是否滚动到底部
const isScrolledToBottom = () => {
  if (!messagesContainer.value) return true;
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  // 容差值为10像素
  const tolerance = 10;
  return scrollHeight - scrollTop - clientHeight <= tolerance;
};
```

#### 2. 滚动事件处理

```javascript
// 处理滚动事件
const handleScroll = () => {
  if (!messagesContainer.value) return;
  
  // 清除之前的定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  // 判断是否已经滚动到底部
  const atBottom = isScrolledToBottom();
  
  // 如果没有在底部，显示按钮
  if (!atBottom) {
    showScrollButton.value = true;
  } else {
    showScrollButton.value = false;
  }
  
  // 设置定时器，如果在1秒内没有继续滚动则检查是否在底部
  scrollTimeout = setTimeout(() => {
    // 延迟后再次检查是否在底部
    if (isScrolledToBottom()) {
      showScrollButton.value = false;
    }
  }, 1000);
};
```

#### 3. 滚动到底部方法

```javascript
// 滚动到底部的辅助函数
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};
```

#### 4. CSS样式

```css
.scroll-to-bottom-btn {
    position: fixed;
    bottom: 175px;
    left: 60%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: none;
    border: none;
    outline: none;
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
    z-index: 100;
    
    &.visible {
        opacity: 1;
        visibility: visible;
        animation: bounce 1s ease infinite;
    }
    
    &:hover {
        color: rgba(0, 0, 0, 0.8);
        transform: translateX(-50%) translateY(-2px);
    }
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
}
```

#### 5. 自动滚动逻辑

在消息发送或接收时，根据当前滚动位置决定是否自动滚动到底部：

```javascript
// 在发送消息时
await nextTick();
// 检查是否应该自动滚动到底部
const wasAtBottom = isScrolledToBottom();
if (wasAtBottom) {
  scrollToBottom();
} else {
  // 如果发送消息前不在底部，则显示滚动到底部按钮
  showScrollButton.value = true;
}
```

## API和模型集成

### API调用流程

应用使用`messageHandler.js`中定义的工具函数与AI模型API交互：

```javascript
// 调用API发送消息并获取响应
let result = await messageHandler.sendMessage(
  apiMessages,
  settingsStore.actualApiKey,
  endpoint,
  {
    model: settingsStore.model,
    temperature: settingsStore.temperature,
    max_tokens: settingsStore.maxTokens
  },
  (updatedContent, done) => {
    // 更新逻辑
  }
);
```

### 流式响应处理

通过回调函数实时更新消息内容，实现打字机效果：

```javascript
// 回调函数示例
(updatedContent, done) => {
  // 更新最后一条消息内容
  const lastMessage = chatStore.messages[chatStore.messages.length - 1];
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.content = updatedContent;
  }
  
  if (done) {
    lastMessage.completed = true;
    // 更新token统计等
  }
}
```

## 暗黑模式实现

通过CSS变量和动态类切换实现暗黑模式：

```javascript
// 切换暗黑模式
const toggleDarkMode = () => {
  settingsStore.toggleDarkMode();
};

// CSS实现
[data-theme="dark"] {
  .chat-view-container {
    background-color: #1a1a1a;
  }
  
  .sidebar {
    background-color: #202123;
    border-color: #333;
  }
  
  // 其他暗黑模式样式...
}
```

## 数据存储和持久化

应用使用本地存储保存聊天历史和设置：

```javascript
// 保存聊天历史到localStorage
const saveChatHistory = () => {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory.value))
}

// 保存消息
const saveMessages = () => {
  localStorage.setItem('currentChat', JSON.stringify(chatStore.messages));
}

// 加载数据
onMounted(() => {
  // 加载保存的聊天历史
  const savedHistory = localStorage.getItem('chatHistory');
  if (savedHistory) {
    try {
      chatHistory.value = JSON.parse(savedHistory);
    } catch (e) {
      console.error('加载聊天历史失败:', e);
      chatHistory.value = [];
    }
  }
  
  // 加载当前聊天
  const savedCurrentChat = localStorage.getItem('currentChat');
  if (savedCurrentChat) {
    try {
      const savedMessages = JSON.parse(savedCurrentChat);
      if (savedMessages.length > 0) {
        chatStore.setMessages(savedMessages);
      }
    } catch (e) {
      console.error('加载当前聊天失败:', e);
    }
  }
});
```

## 性能优化

### 虚拟滚动

对于长消息列表，考虑实现虚拟滚动以提高性能。

### 滚动优化

使用节流技术和`requestAnimationFrame`优化滚动事件处理：

```javascript
let scrollTimeout = null;

const handleScroll = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  scrollTimeout = setTimeout(() => {
    // 处理滚动逻辑
  }, 100); // 延迟100ms执行
}
```

## 移动端适配

### 响应式设计

采用flexbox和媒体查询实现响应式布局：

```css
.chat-view-container {
    display: flex;
    width: 100%;
    height: 100vh;
    
    @media (max-width: 768px) {
        font-family: "Microsoft YaHei", "PingFang SC", "Heiti SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
        font-weight: 400;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        letter-spacing: 0.015em;
    }
}
```

### 触摸优化

针对移动设备优化触摸交互，包括按钮大小和点击区域：

```css
@media (max-width: 768px) {
    .scroll-to-bottom-btn {
        bottom: 100px;
        right: 16px;
        left: auto;
        transform: none;
        width: 36px;
        height: 36px;
    }
}
```

### 侧边栏适配

实现移动端侧边栏的弹出菜单：

```javascript
// 移动端侧边栏切换
const toggleMobileSidebar = () => {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
    // 添加/移除body的overflow以防止背景滚动
    if (isMobileSidebarOpen.value) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}
```

```css
// 移动端侧边栏样式
@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        left: -280px;
        top: 0;
        bottom: 0;
        height: 100%;
        z-index: 200;
        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        &.sidebar-open-mobile {
            left: 0;
        }
    }
}
```

## 总结

MyChat应用采用现代化的Vue 3技术栈构建，通过组件化和响应式设计实现了良好的用户体验。滚动到底部功能的实现展示了如何通过细节设计提升用户体验，而移动端适配和暗黑模式则提供了更广泛的适用性。 