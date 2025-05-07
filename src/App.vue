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
import { ref, onMounted, onBeforeMount } from 'vue'
import { useSettingsStore } from './stores/settings'
import AppLogo from './components/AppLogo.vue'

const settingsStore = useSettingsStore()
const isAppLoaded = ref(false)
const loadingMessage = ref('正在加载应用...')

// 应用初始化并处理加载状态
const initApp = async () => {
  try {
    // 减少模拟加载的时间，但增加网络超时检测
    loadingMessage.value = '加载配置...'
    await new Promise(resolve => setTimeout(resolve, 400))
    
    loadingMessage.value = '初始化界面...'
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 加载设置并应用主题
    const isDarkMode = settingsStore.isDarkMode
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    
    // 检查API配置
    if (!settingsStore.actualApiEndpoint || !settingsStore.actualApiKey) {
      loadingMessage.value = '请在设置中配置API...'
      // 仍然继续加载应用
      await new Promise(resolve => setTimeout(resolve, 300))
    } else {
      loadingMessage.value = '准备就绪！'
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // 标记应用已加载完成
    isAppLoaded.value = true
  } catch (error) {
    console.error('应用初始化错误:', error)
    loadingMessage.value = '加载失败，请刷新页面重试'
    // 即使发生错误，5秒后也强制显示应用
    setTimeout(() => {
      isAppLoaded.value = true
    }, 5000)
  }
}

// 在组件挂载前开始初始化
onBeforeMount(() => {
  // 网络超时处理 - 更快地提示网络问题
  setTimeout(() => {
    if (!isAppLoaded.value) {
      loadingMessage.value = '加载时间较长，请检查网络连接...'
      
      // 再等待5秒后，如果仍未加载完成，则强制显示应用
      setTimeout(() => {
        if (!isAppLoaded.value) {
          loadingMessage.value = '网络状况不佳，但仍将继续加载...'
          isAppLoaded.value = true
        }
      }, 5000)
    }
  }, 3000) // 缩短到3秒
})

// 组件挂载时初始化应用
onMounted(() => {
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
}

// Loading Screen Styles
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.5s ease-out;
  
  .loading-content {
    text-align: center;
    max-width: 90%;
  }
  
  .loading-logo {
    margin-bottom: 20px;
    animation: pulse 2s infinite ease-in-out;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
  }
  
  .loading-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #333333;
    margin-bottom: 20px;
  }
  
  .loading-spinner {
    margin: 20px auto;
    width: 40px;
    height: 40px;
    
    .spinner {
      width: 100%;
      height: 100%;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #333333;
      animation: spin 1s linear infinite;
    }
  }
  
  .loading-message {
    font-size: 1rem;
    color: #666666;
    margin-top: 10px;
  }
}

// Animations
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
    filter: none;
  }
  50% { 
    transform: scale(1.05); 
    filter: none;
  }
}

// Dark mode for loading screen
[data-theme="dark"] .loading-screen {
  background-color: #121212;
  
  .loading-title {
    color: #f0f0f0;
  }
  
  .loading-message {
    color: #aaaaaa;
  }
  
  .loading-spinner .spinner {
    border-color: rgba(255, 255, 255, 0.1);
    border-top-color: #f0f0f0;
  }
  
  .loading-logo {
    filter: invert(1);
  }
}

.app-loaded .loading-screen {
  opacity: 0;
  pointer-events: none;
}
</style>

