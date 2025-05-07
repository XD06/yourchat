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
import { ref, onMounted, onBeforeMount, nextTick } from 'vue'
import { useSettingsStore } from './stores/settings'
import AppLogo from './components/AppLogo.vue'

const settingsStore = useSettingsStore()
const isAppLoaded = ref(false)
const loadingMessage = ref('正在初始化...')

// 优化后的应用初始化
const initApp = async () => {
  try {
    // 立即应用主题，不等待
    const isDarkMode = settingsStore.isDarkMode
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    
    // 减少不必要的等待时间
    loadingMessage.value = '检查配置...'
    
    // 确保DOM已更新
    await nextTick()
    
    // 检查API配置但不阻塞应用加载
    if (!settingsStore.actualApiEndpoint || !settingsStore.actualApiKey) {
      loadingMessage.value = '未检测到API配置'
      console.warn('API配置缺失，可能需要在设置中配置')
    } else {
      loadingMessage.value = '应用已就绪'
    }
    
    // 不再使用人为延迟，立即准备显示应用
    await nextTick()
    
    // 为了保证平滑过渡，增加一个短暂的延迟
    setTimeout(() => {
      isAppLoaded.value = true
    }, 300)
  } catch (error) {
    console.error('应用初始化错误:', error)
    loadingMessage.value = '初始化遇到问题，将继续加载...'
    
    // 即使发生错误，也尝试加载应用
    setTimeout(() => {
      isAppLoaded.value = true
    }, 1000)
  }
}

// 网络超时处理优化
onBeforeMount(() => {
  // 更快的超时检测
  setTimeout(() => {
    if (!isAppLoaded.value) {
      loadingMessage.value = '加载时间较长，即将完成...'
      
      // 再等待较短时间后继续
      setTimeout(() => {
        if (!isAppLoaded.value) {
          console.warn('应用加载超时，强制显示')
          isAppLoaded.value = true
        }
      }, 2000) // 减少到2秒
    }
  }, 2000) // 减少到2秒
  
  // 预初始化应用
  initApp()
})

// 可选的补充初始化
onMounted(() => {
  // 如果onBeforeMount的initApp已经完成了加载，这里可以不再执行
  if (!isAppLoaded.value) {
    console.log('应用在mounted钩子中继续初始化')
    // 用于确保应用在任何情况下都能加载完成
    setTimeout(() => {
      if (!isAppLoaded.value) {
        isAppLoaded.value = true
      }
    }, 1500)
  }
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
}
</style>

