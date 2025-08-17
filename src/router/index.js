import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/index' },
  {
    path: '/index',
    name: 'index',
    component: () => import('@/views/index.vue'),
    meta: { title: '仪表盘', icon: 'set-up' }
  },
  {
    path: '/UserManager',
    name: 'UserManager',
    component: () => import('@/views/UserManager.vue'),
    meta: { title: '用户管理', icon: 'user' }
  },
  {
    path: '/PostManager',
    name: 'PostManager',
    component: () => import('@/views/PostManager.vue'),
    meta: { title: '帖子管理', icon: 'notebook-2' }
  }
]

const router = new VueRouter({
  routes
})

export default router