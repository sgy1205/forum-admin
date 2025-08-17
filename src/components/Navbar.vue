<template>
  <header class="navbar">
    <!-- 第一行：讨论论坛后台管理 + 面包屑 -->
    <div class="bread-line">
      <div class="logo">讨论论坛后台管理</div>
      <div class="breadcrumb">
        <template v-if="currentPageTitle !== '仪表盘'">
          <router-link to="/index">首页</router-link>
          <span>/</span>
          <span>{{ currentPageTitle }}</span>
        </template>
        <template v-else>
          仪表盘
        </template>
      </div>
    </div>

    <!-- 第二行：按钮栏（直接跟在面包屑下方，左对齐） -->
    <div class="btn-row">
      <!-- 固定仪表盘 -->
      <router-link
        to="/index"
        class="tag fixed"
        :class="{ active: $route.path === '/index' }"
      >
        仪表盘
      </router-link>

      <!-- 动态标签 -->
      <router-link
        v-for="tag in dynamicTags"
        :key="tag.path"
        :to="tag.path"
        class="tag"
        :class="{ active: tag.path === $route.path }"
      >
        {{ tag.title }}
        <i class="el-icon-close" @click.prevent="closeTag(tag)" />
      </router-link>
    </div>
  </header>
</template>

<script>
export default {
  data () {
    return { dynamicTags: [] }
  },
  computed: {
    currentPageTitle () {
      return this.$route.meta?.title || '仪表盘'
    }
  },
  watch: {
    $route (to) {
      if (to.name === 'index') return
      const exists = this.dynamicTags.some(t => t.path === to.path)
      if (!exists) {
        this.dynamicTags.push({ path: to.path, title: to.meta.title })
      }
    }
  },
  methods: {
    closeTag (tag) {
      const idx = this.dynamicTags.findIndex(t => t.path === tag.path)
      if (idx > -1) {
        this.dynamicTags.splice(idx, 1)
        if (tag.path === this.$route.path) this.$router.replace('/index')
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  flex-direction: column;
  height: auto;
  padding: 8px 20px 12px;
  background: #304156;
  color: #fff;
}

/* 第一行：讨论论坛后台管理 + 面包屑（水平排列） */
.bread-line {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.logo {
  font-size: 18px;
  font-weight: 600;
  margin-right: 16px;
}
.breadcrumb {
  font-size: 16px;
  color: #c0c4cc;
}
.breadcrumb a { color: #c0c4cc; text-decoration: none; }
.breadcrumb a:hover { color: #fff; }
.breadcrumb span { margin: 0 4px; }

/* 第二行：按钮栏（左对齐） */
.btn-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 10px;
  padding-left:160px;
}
.tag {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 13px;
  color: #c0c4cc;
  border: 1px solid #4c5259;
  border-radius: 4px;
  text-decoration: none;
}
.tag.active { background: #409eff; color: #fff; border-color: #409eff; }
.tag.fixed { border-color: #555; }
.tag .el-icon-close { margin-left: 6px; cursor: pointer; }
</style>