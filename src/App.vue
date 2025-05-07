<template>
  <div id="app" :class="{ 'app-loaded': isAppLoaded }">
    <!-- Loading Screen -->
    <div class="loading-screen" v-if="!isAppLoaded">
      <div class="loading-content">
        <div class="loading-logo">
          <AppLogo :size="100" color="#333333" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, nextTick, watch } from 'vue'
import { useSettingsStore } from './stores/settings'
import AppLogo from './components/AppLogo.vue'

const settingsStore = useSettingsStore()
const isAppLoaded = ref(false)
const loadingMessage = ref('初始化应用...')

// 监听应用加载状态，移除body上的loading类
watch(isAppLoaded, (newVal) => {
  if (newVal === true) {
    // 移除body上的loading类
    document.body.classList.remove('loading')
  }
})

// 简化的应用初始化流程，确保DOM渲染稳定性
const initApp = async () => {
  try {
    // 立即应用主题，不等待
    const isDarkMode = settingsStore.isDarkMode
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    
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

// 在mounted时初始化应用
onMounted(() => {
  // 开始初始化
  initApp()
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

