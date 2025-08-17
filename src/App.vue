<template>
  <div id="app">
    <Navbar />
    <div class="body">
      <Sidebar :menuList="simpleMenu" />
      <router-view class="content" />
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
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.body {
  display: flex;
  height: calc(100vh - 50px);
}

.sidebar {
  flex-shrink: 0;   /* 防止被压缩 */
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
