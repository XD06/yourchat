import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'

// 重要：同步导入 Element Plus 以避免 DOM 渲染问题
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

// 导入并初始化Mermaid
import mermaid from 'mermaid'
import { reinitializeMermaidTheme, renderMermaidDiagrams } from './utils/mermaid-plugin'

// 初始Mermaid配置在mermaid-plugin.js中设置，这里只初始化一次

// 使用深色代码主题, 异步按需加载
import './assets/styles/main.scss'
import './assets/styles/element-overrides.scss'
// 导入代码执行模态框样式
import './assets/main.css'
// 导入Markdown扩展样式
import './assets/styles/markdown-extensions.scss'

// 优先创建应用实例，提前渲染初始UI
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 优先注册pinia和router, 这些是核心功能
app.use(pinia)
app.use(router)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 核心功能注册
app.use(ElementPlus)

// 启动应用并挂载到DOM
app.mount('#app')

// 延迟加载非关键资源
setTimeout(() => {
  // 异步加载代码高亮样式（可以延迟）
  import('highlight.js/styles/github-dark.css')
    .catch(error => console.error('Failed to load syntax highlighting:', error))
  
  // 从设置中获取当前主题模式并更新Mermaid配置
  import('./stores/settings').then(({ useSettingsStore }) => {
    const settingsStore = useSettingsStore()
    // 同步Mermaid主题配置
    reinitializeMermaidTheme(settingsStore.isDarkMode)
    
    // 监听主题变化
    settingsStore.$subscribe((mutation, state) => {
      if (mutation.type === 'patch object' && 'isDarkMode' in mutation.payload) {
        // 当暗黑模式设置变化时，更新Mermaid主题
        reinitializeMermaidTheme(state.isDarkMode)
        // 延迟后重新渲染所有图表
        setTimeout(() => {
          renderMermaidDiagrams();
        }, 300);
      }
    })
    
    // 确保页面上的图表都正确渲染
    setTimeout(() => {
      renderMermaidDiagrams();
    }, 1000);
  })
}, 100)
