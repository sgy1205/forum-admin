<template>
  <el-menu
    :default-active="$route.path"
    router
    class="sidebar"
  >
    <el-menu-item
      v-for="item in menuList"
      :key="item.path"
      :index="item.path"
    >
      <i v-if="item.meta.icon" :class="'el-icon-' + item.meta.icon" />
      <span slot="title">{{ item.meta.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  props: {
    menuList: {
      type: Array
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: calc(100vh - 50px);
  background: #eef1f6;
}
</style>