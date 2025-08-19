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
        <template v-else>仪表盘</template>
      </div>

      <!-- 头像 + 下拉菜单 -->
      <el-dropdown trigger="click" class="avatar-dropdown">
        <div class="avatar-box">
          <img :src="user.avatar || require('@/assets/images/默认头像.jpg')" />
        </div>

        <el-dropdown-menu slot="dropdown">
          <!-- 替换为“修改密码”弹窗触发 -->
          <el-dropdown-item icon="el-icon-setting" @click.native="openPasswordDialog">
            修改密码
          </el-dropdown-item>
          <el-dropdown-item divided icon="el-icon-switch-button" @click.native="logout">
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 第二行：按钮栏 -->
    <div class="btn-row">
      <router-link to="/index" class="tag fixed" :class="{ active: $route.path === '/index' }">
        仪表盘
      </router-link>

      <router-link v-for="tag in dynamicTags" :key="tag.path" :to="tag.path" class="tag"
        :class="{ active: tag.path === $route.path }">
        {{ tag.title }}
        <i class="el-icon-close" @click.prevent="closeTag(tag)" />
      </router-link>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog title="设置密码" :visible.sync="dialogVisible" width="400px" append-to-body>
      <el-form :model="form" :rules="rules" ref="passwordForm" label-width="80px">
        <el-form-item label="原密码" prop="oldPwd">
          <el-input type="password" v-model="form.oldPwd" placeholder="请输入原密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input type="password" v-model="form.newPwd" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPwd">
          <el-input type="password" v-model="form.confirmPwd" placeholder="请再次输入密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="danger" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </header>
</template>

<script>
export default {
  data() {
    return { 
      dynamicTags: [],
      user: {}, // 修正：用户信息应为对象，而非数组
      dialogVisible: false, // 弹窗显隐控制
      form: { // 密码表单数据
        oldPwd: '',
        newPwd: '',
        confirmPwd: ''
      },
      rules: { // 表单校验规则
        oldPwd: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '新密码至少6位', trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: this.validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUser();
  },
  computed: {
    currentPageTitle() {
      return this.$route.meta?.title || '仪表盘'
    }
  },
  watch: {
    $route(to) {
      if (to.name === 'index') return
      const exists = this.dynamicTags.some(t => t.path === to.path)
      if (!exists) {
        this.dynamicTags.push({ path: to.path, title: to.meta.title })
      }
    }
  },
  methods: {
    // 关闭标签页
    closeTag(tag) {
      const idx = this.dynamicTags.findIndex(t => t.path === tag.path)
      if (idx > -1) {
        this.dynamicTags.splice(idx, 1)
        if (tag.path === this.$route.path) this.$router.replace('/index')
      }
    },
    // 获取用户信息
    getUser(){
      const userId = localStorage.getItem('userId')
      this.$axios.get(`/userInfo/${userId}`).then(res => {
        this.user = res.data // 假设接口返回用户对象
      }).catch(() => {
        this.$message.error('获取用户信息失败')
      })
    },
    // 退出登录
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      this.$message.success('已退出登录')
      this.$router.push('/login')
    },
    // 打开修改密码弹窗
    openPasswordDialog() {
      this.dialogVisible = true;
      // 重置表单（需等DOM更新后执行）
      this.$nextTick(() => {
        this.$refs.passwordForm.resetFields();
      });
    },
    // 校验确认密码与新密码一致
    validateConfirm(rule, value, callback) {
      if (value !== this.form.newPwd) {
        callback(new Error('两次输入的新密码不一致'));
      } else {
        callback();
      }
    },
    // 提交修改密码
    handleSubmit() {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          const userId = localStorage.getItem('userId');
          // 调用修改密码接口
          this.$axios({
            method: 'post',
            url: '/user/updatePassword',
            data: {
              oldPassword: this.form.oldPwd,
              newPassword: this.form.newPwd
            }
          }).then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg || '密码修改成功');
              this.dialogVisible = false; // 关闭弹窗
              this.logout(); // 修改成功后退出登录
            }
          }).catch(err => {
            console.error(err);
            this.$message.error('网络错误，修改失败');
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.navbar {
  min-height: 75px;
  display: flex;
  flex-direction: column;
  padding: 8px 20px 12px;
  background: #304156;
  color: #fff;
}

/* ---------- 第一行 ---------- */
.bread-line {
  display: flex;
  align-items: center;
  position: relative;
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
  flex: 1;
}

.breadcrumb a {
  color: #c0c4cc;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #fff;
}

.breadcrumb span {
  margin: 0 4px;
}

/* ---------- 头像区域 ---------- */
.avatar-dropdown {
  margin-left: auto;
  cursor: pointer;
}

.avatar-box {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---------- 第二行 ---------- */
.btn-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 10px;
  padding-left: 160px;
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

.tag.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.tag.fixed {
  border-color: #555;
}

.tag .el-icon-close {
  margin-left: 6px;
  cursor: pointer;
}

/* 弹窗footer对齐（可选） */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>