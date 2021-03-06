import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login.vue'
import home from '../components/home.vue'
import welcome from '../components/welcome.vue'
import user from '../components/user/user.vue'
import right from '../components/power/right.vue'
import role from '../components/power/role.vue'
import cate from '../components/good/cate.vue'
import params from '../components/good/params.vue'
import list from '../components/good/list.vue'
import add from '../components/good/add.vue'
import order from '../components/order/order.vue'
import report from '../components/report/report.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: login },
  {
    path: '/home',
    component: home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: welcome },
      { path: '/users', component: user },
      { path: '/roles', component: role },
      { path: '/rights', component: right },
      { path: '/categories', component: cate },
      { path: '/params', component: params },
      { path: '/goods', component: list },
      { path: '/goods/add', component: add },
      { path: '/orders', component: order },
      { path: '/reports', component: report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂在路由守卫
router.beforeEach((to, from, next) => {
  // to 要访问的网页   from 从哪个路径跳转而来   next 一个函数 放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  window.sessionStorage.setItem('activePath', to.path)
  next()
})

export default router
