<template>
  <el-menu :default-active="$route.path" router class="sidebar">
    <!-- 遍历「提前过滤后的菜单」，移除 v-if -->
    <el-menu-item v-for="item in filteredMenu" :key="item.path" :index="item.path">
      <i v-if="item.meta?.icon" :class="'el-icon-' + item.meta.icon" />
      <span slot="title">{{ item.meta?.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  props: {
    menuList: {
      type: Array,
      default: () => [] // 防止传入 undefined，避免报错
    }
  },
  computed: {
    // 🌟 关键：提前过滤需要隐藏的菜单，替代模板中的 v-if
    filteredMenu() {
      return this.menuList.filter(item => {
        // 逻辑：如果 meta 存在且 hideInSidebar 为 true → 过滤掉；否则保留
        return !(item.meta && item.meta.hideInSidebar);
      });
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