<template>
  <div id="app">
    <!-- 导航栏：默认显示，路由meta.hiddenNavbar为true时隐藏 -->
    <Navbar class="navbar-fixed" v-if="!$route.meta.hiddenNavbar" />
    <!-- 主体容器：动态调整顶部padding -->
    <div class="body-container" :style="{ 'padding-top': $route.meta.hiddenNavbar ? '0' : '50px' }">
      <!-- 侧边栏：默认显示，路由meta.hiddenSidebar为true时隐藏 -->
      <Sidebar :menuList="simpleMenu" class="sidebar-fixed" v-if="!$route.meta.hiddenSidebar" />
      <!-- 内容容器：动态调整左侧margin -->
      <div class="content-container">
        <router-view class="content" />
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'

export default {
  components: { Navbar, Sidebar },
  computed: {
    simpleMenu() {
      return this.$router.options.routes.filter(r => r.meta)
    }
  }
}
</script>

<style>
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  /* 隐藏body的滚动条 */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100%;
}

/* 固定导航栏在顶部 */
.navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  /* 确保在内容上方 */
  height: 50px;
  /* 明确设置高度，与下面的margin对应 */
}

/* 主体容器样式 */
.body-container {
  display: flex;
  height: 100%;
  padding-top: 50px;
  /* 默认值，通过动态样式覆盖 */
  box-sizing: border-box;
}

/* 固定侧边栏在左侧 */
.sidebar-fixed {
  width: 200px;
  /* 固定宽度 */
  flex-shrink: 0;
  height: 100%;
  position: fixed;
  /* 固定定位 */
  top: 50px;
  /* 导航栏高度 */
  bottom: 0;
  overflow-y: auto;
  /* 侧边栏内容过多时可滚动 */
}

/* 内容容器，可滚动 */
.content-container {
  flex: 1;
  margin-left: 0px;
  /* 默认值，通过动态样式覆盖 */
  height: 100%;
  overflow-y: auto;
  /* 内容区域可滚动 */
}

.content {
  padding: 50px;
}
</style>