<template>
  <div class="app-container home">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>开发团队信息</span>
      </div>
      <div v-for="(value, key) in developerTeam" :key="key" class="text item">
        <div class="key">{{ key }}:</div>
        <a class="value" :href="value" target="_blank" rel="noopener">
          {{ value }}
        </a>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      developerTeam: {
        OfficialSite: 'https://example.com',
        DevTeam: 'https://devteam.example.com',
        GitHub后端: 'https://github.com/sgy1205/forum.git',
        GitHub前端: 'https://github.com/sgy1205/forum-admin.git'
      }
    }
  }
}
</script>

<style lang="scss">
body.dark {
  .el-card {
    background: #232324 !important;
    border: 0 !important;
    color: #fff !important;

    .el-card__header {
      border-bottom: 1px solid #444 !important;
    }
  }
}

.text {
  font-size: 14px;
  display: flex;
  gap: 10px;

  .key {
    font-weight: bold;
  }

  a {
    color: #a374ff;
    text-decoration: underline;
  }
}

.item {
  margin-bottom: 18px;
}

.clearfix {

  &:before,
  &:after {
    display: table;
    content: '';
  }

  &:after {
    clear: both;
  }
}

.box-card {
  width: 100%;
  margin-bottom: 50px;
}
</style>