// router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/index' },
  {
    path: '/index',
    name: 'index',
    component: () => import('@/views/index.vue'),
    meta: {
      title: '仪表盘',
      icon: 'set-up'
    }
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
  },
  {
    path: '/ForbiddenWords',
    name: 'ForbiddenWords',
    component: () => import('@/views/ForbiddenWords.vue'),
    meta: { title: '违禁词管理', icon: 'document-delete' }
  },
  {
    path: '/Audit',
    name: 'Audit',
    component: () => import('@/views/Audit.vue'),
    meta: { title: '审核', icon: 's-help' }
  },
  {
    path: '/Menu',
    name: 'Menu',
    component: () => import('@/views/Menu.vue'),
    meta: { title: '权限菜单', icon: 's-management' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),  // 假设新建了Login.vue
    meta: {
      title: '登录',
      hiddenNavbar: true, // 隐藏导航栏
      hiddenSidebar: true,  // 隐藏侧边栏
      hideInSidebar: true  // 新增：标记为侧边栏隐藏
    }
  }
]

const router = new VueRouter({
  routes
})

export default router