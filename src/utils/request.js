import axios from 'axios'
import router from '@/router' // 确保引入路由实例

const request = axios.create({
  baseURL: 'http://127.0.0.1:12050',
  timeout: 10000,
  withCredentials: true // 必须与后端 allowCredentials(true) 配对
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // const token = localStorage.getItem('token') || '' 
    const token ='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NTY4MjAwMTAsInVzZXJJZCI6MX0.EZ0Xb1Ck6QLQiogzNNzi1uSbZIK-VML3Xav5Km0kbnw'// 硬编码仅用于测试
    if (token) {
      config.headers['token'] = `${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  res => res.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request