import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import MathTest from '../components/MathTest.vue'
import MermaidTest from '../components/MermaidTest.vue'
import MermaidErrorTest from '../components/MermaidErrorTest.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatView
    },
    {
      path: '/math-test',
      name: 'math-test',
      component: MathTest
    },
    {
      path: '/mermaid-test',
      name: 'mermaid-test',
      component: MermaidTest
    },
    {
      path: '/mermaid-error-test',
      name: 'mermaid-error-test',
      component: MermaidErrorTest
    }
  ]
})

export default router
