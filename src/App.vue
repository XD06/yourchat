<template>
  <div id="app" :class="{ 'app-loaded': isAppLoaded }">
    <!-- Loading Screen -->
    <div class="loading-screen" v-if="!isAppLoaded">
      <div class="loading-content">
        <div class="loading-logo">
          <AppLogo :size="120" color="#000000" />
        </div>
        <h1 class="loading-title">MyChat</h1>
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p class="loading-message">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Main App Content -->
    <router-view v-show="isAppLoaded" />
    
    <!-- 滚动到底部按钮 - 更新为箭头图标 -->
    <!-- <div 
      class="scroll-to-bottom-btn" 
      v-show="showScrollButton" 
      @click="scrollToBottom"
      @touchstart="scrollToBottom"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="white"/>
        <path d="M7.41 15.59L12 20.17L16.59 15.59L18 17L12 23L6 17L7.41 15.59Z" fill="white"/>
      </svg>
    </div> -->
    
    <!-- 暗黑模式切换按钮 -->
   
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, nextTick, watch } from 'vue'
import { useSettingsStore } from './stores/settings'
import AppLogo from './components/AppLogo.vue'
import './assets/mobileFixStyles.css' // Import mobile fixes CSS

const settingsStore = useSettingsStore()
const isAppLoaded = ref(false)
const loadingMessage = ref('初始化应用...')
const showScrollButton = ref(false)
const isDarkMode = ref(false)
let scrolling = false
let scrollTimeout

// 监听应用加载状态，移除body上的loading类
watch(isAppLoaded, (newVal) => {
  if (newVal === true) {
    // 移除body上的loading类
    document.body.classList.remove('loading')
  }
})

// 初始化时获取当前主题状态
onBeforeMount(() => {
  isDarkMode.value = settingsStore.isDarkMode
})

// 切换主题模式
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
  settingsStore.isDarkMode = isDarkMode.value
}

// 简化的应用初始化流程，确保DOM渲染稳定性
const initApp = async () => {
  try {
    // 立即应用主题，不等待
    const isDarkModeVal = settingsStore.isDarkMode
    isDarkMode.value = isDarkModeVal
    document.documentElement.setAttribute('data-theme', isDarkModeVal ? 'dark' : 'light')
    
    // 确保DOM已更新
    await nextTick()
    
    // 无需延迟，允许页面立即显示
    // 仅做基本的API检查
    if (!settingsStore.actualApiEndpoint || !settingsStore.actualApiKey) {
      console.warn('API配置缺失，可能需要在设置中配置')
    }
    
    // 设置延迟只是为了确保平滑过渡
    setTimeout(() => {
      isAppLoaded.value = true
      // 初始化时立即检查滚动按钮状态
      setTimeout(() => {
        showScrollButton.value = true
        console.log('强制显示滚动按钮')
      }, 1000)
    }, 100)
  } catch (error) {
    console.error('应用初始化错误:', error)
    // 即使出错也显示应用
    isAppLoaded.value = true
  }
}

// 优化后的加载流程
onBeforeMount(() => {
  // 设置较短的超时以确保应用始终能够加载
  setTimeout(() => {
    if (!isAppLoaded.value) {
      console.warn('应用加载超时，强制显示')
      isAppLoaded.value = true
    }
  }, 1000)
})

// 检查是否需要显示滚动按钮
const checkScrollPosition = () => {
  // 标记正在滚动
  scrolling = true
  
  // 清除之前的计时器
  clearTimeout(scrollTimeout)
  
  // 设置新的计时器，滚动停止后才检查位置
  scrollTimeout = setTimeout(() => {
    scrolling = false
    updateScrollButtonVisibility()
  }, 150)
  
  // 如果正在滚动，隐藏按钮
  showScrollButton.value = false
}

// 更新滚动按钮可见性
const updateScrollButtonVisibility = () => {
  // 如果正在滚动，不更新
  if (scrolling) return
  
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight = document.documentElement.clientHeight
  
  // 计算距离底部的距离
  const distanceToBottom = scrollHeight - scrollTop - clientHeight
  
  // 测试期间始终显示按钮
  showScrollButton.value = true
  console.log('滚动按钮状态:', showScrollButton.value, '距离底部:', distanceToBottom)
}

// 滚动到页面底部
const scrollToBottom = () => {
  console.log('滚动到底部按钮被点击')
  const scrollHeight = document.documentElement.scrollHeight
  
  // 使用平滑滚动
  window.scrollTo({
    top: scrollHeight,
    behavior: 'smooth'
  })
  
  // 点击后立即隐藏按钮
  showScrollButton.value = false
}

// 在mounted时初始化应用
onMounted(() => {
  // 开始初始化
  initApp()
  
  // 监听滚动事件
  window.addEventListener('scroll', checkScrollPosition, { passive: true })
  
  // 初始检查滚动位置
  updateScrollButtonVisibility()
  
  // Add global touch event handler to prevent unwanted behaviors
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      // Allow default behavior for inputs
      return;
    }
    
    // This helps prevent potential highlight issues in various mobile browsers
    if (e.target.classList.contains('mobile-input') ||
        e.target.closest('.mobile-input-wrapper')) {
      e.preventDefault();
    }
  }, { passive: false });
})
</script>

<style lang="scss">
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #ffffff;
  
  [data-theme="dark"] & {
    background-color: #121212;
  }
}

/* Global fix for mobile input highlight issues */
* {
  -webkit-tap-highlight-color: transparent;
}

// Optimized Loading Screen Styles
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: inherit; // Use inherited background
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.3s ease;
  
  .loading-content {
    text-align: center;
    max-width: 90%;
  }
  
  .loading-logo {
    margin-bottom: 20px;
    // Simplified animation with transformed properties
    animation: simple-pulse 1.5s infinite ease-in-out;
    transform: translateZ(0); // Only essential hardware acceleration
  }
  
  .loading-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: #333333;
    margin-bottom: 20px;
    
    [data-theme="dark"] & {
      color: #f0f0f0;
    }
  }
  
  .loading-spinner {
    margin: 20px auto;
    width: 36px;
    height: 36px;
    
    .spinner {
      width: 100%;
      height: 100%;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #333333;
      animation: spin 0.8s linear infinite;
      
      [data-theme="dark"] & {
        border-color: rgba(255, 255, 255, 0.1);
        border-top-color: #f0f0f0;
      }
    }
  }
  
  .loading-message {
    font-size: 0.95rem;
    color: #666666;
    margin-top: 10px;
    
    [data-theme="dark"] & {
      color: #aaaaaa;
    }
  }
}

// 滚动到底部按钮样式 - 完全重新设计
.scroll-to-bottom-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background-color: #4284f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1999; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  opacity: 0.95;
  border: 2px solid rgba(255, 255, 255, 0.6);
  
  &:hover {
    transform: translateY(-3px);
    opacity: 1;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  }
  
  &:active {
    transform: translateY(0);
    opacity: 0.9;
  }
  
  svg {
    width: 30px;
    height: 30px;
    // 添加轻微的上下弹跳动画
    animation: bounce 2s ease infinite;
  }
  
  // 深色模式下的样式
  [data-theme="dark"] & {
    background-color: #4284f5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
    }
  }
  
  // 移动端样式优化
  @media (max-width: 768px) {
    bottom: 25px;
    right: 25px;
    width: 50px;
    height: 50px;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
}

// 主题切换按钮样式
.theme-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 34px;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  @media (max-width: 768px) {
    top: 15px;
    right: 15px;
    width: 50px;
    height: 28px;
  }
}

// 添加动画
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-2px);
  }
}

// Streamlined animations
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes simple-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

// Optimized dark mode for loading logo
[data-theme="dark"] .loading-logo {
  filter: brightness(0) invert(1);
}

// Improved transition for app loading
.app-loaded .loading-screen {
  opacity: 0;
  pointer-events: none;
  visibility: hidden; // 完全隐藏元素
  transition: opacity 0.3s ease, visibility 0.3s ease; // 同时过渡可见性属性
}
</style>

