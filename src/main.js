import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'

// 使用深色代码主题, 异步按需加载
import './assets/styles/main.scss'

// 优先创建应用实例，提前渲染初始UI
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 优先注册pinia和router, 这些是核心功能
app.use(pinia)
app.use(router)

// 异步加载非关键资源
const loadNonCriticalResources = async () => {
  try {
    // 动态加载Element Plus相关资源
    const [
      ElementPlus, 
      ElementPlusIconsVue,
      elementStyles
    ] = await Promise.all([
      import('element-plus'),
      import('@element-plus/icons-vue'),
      import('./assets/styles/element-overrides.scss')
    ])

    // 异步注册Element Plus所有组件
    app.use(ElementPlus.default)
    
    // 异步注册所有图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    // 异步加载代码高亮样式
    import('highlight.js/styles/github-dark.css')
  } catch (error) {
    console.error('Failed to load non-critical resources:', error)
  }
}

// 启动应用并挂载到DOM
app.mount('#app')

// 应用挂载后再加载非关键资源
loadNonCriticalResources()
