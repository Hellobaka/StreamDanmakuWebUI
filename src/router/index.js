import Vue from 'vue'
import VueRouter from 'vue-router'
import { readLocalStorage } from '../utils/tools'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: '后台',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: '登录',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

const whiteList = ['/login', '/register']
router.beforeEach(async (to, from, next) => {
  document.title = `${to.name} - 后台`
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  const hasUser = await readLocalStorage('danmaku-login')
  if (!hasUser) {
    // debugger
    router.replace('/login')
  } else {
    next()
  }
})
export default router
