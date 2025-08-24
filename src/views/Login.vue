<template>
  <div class="login">
    <div class="carousel">
      <el-carousel>
        <el-carousel-item v-for="item in images" :key="item">
          <img class="carousel-image" :src="item" alt="">
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="login-container">
      <div class="login-form" v-loading="Loading">
        <el-form :model="loginForm" :rules="rules" style="flex:1" ref="loginFormRef">
          <div class="header">
            <div class="title">讨论论坛登录</div>
            <div class="subtitle">欢迎使用讨论论坛后台管理系统</div>
          </div>

          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input type="password" :show-password="true" v-model="loginForm.password"
              prefix-icon="el-icon-lock"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleLogin" style="width:100%;">登录</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="footer">
        <div class="footer-content">
          <p>讨论论坛</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import img1 from '@/assets/images/back1.jpg'
import img2 from '@/assets/images/back2.jpg'
import img3 from '@/assets/images/back3.jpg'

export default {
  name: 'login',
  data() {
    return {
      Loading: false,
      captchaEnabled: true,
      redirect: undefined,
      images: [img1, img2, img3],
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
          { max: 20, message: '密码长度不能超过20位', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
  },
  methods: {
    handleLogin() {
      this.$refs.loginFormRef.validate(valid => {
        this.Loading = true
        if (valid) {
          this.$axios({
            method: 'post',
            url: '/login',
            data: {
              loginStr: this.loginForm.username,
              password: this.loginForm.password
            }
          }).then(res => {
            if (res.code == 200) {
              localStorage.setItem('token', res.token)
              localStorage.setItem('userId', res.userId)
              this.$message.success('登录成功')
              this.$router.push({ path: this.redirect || '/index' })
            }
            this.Loading = false
          }).catch(() => {
            this.Loading = false
          })
        } else {
          this.Loading = false
          this.$message.error('请填写完整信息')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 全局重置，禁止整页滚动 */
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.login {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .carousel {
    width: 40%;
    height: 100%;

    .el-carousel {
      height: 100%;
      overflow: hidden;

      .el-carousel__container {
        height: 100%;

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .login-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .login-form {
      width: 500px;
      height: 500px;
      margin: auto;
      display: flex;
      align-items: center;

      .header {
        margin-bottom: 40px;

        .title {
          font-size: 22px;
          font-weight: bold;
        }

        .subtitle {
          font-size: 14px;
          color: #999;
        }
      }

      .captcha-item {
        .el-form-item__content {
          display: flex;
          align-items: start;
          flex-wrap: nowrap;

          .el-input {
            flex: 1;
          }
        }

        .captcha-image {
          width: 80px;
          height: 36px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>