import { createRouter, createWebHistory } from 'vue-router'
import { TOKEN_KEY } from '@/utils/constants'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: { public: true }
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/dishes',
      children: [
        {
          path: 'dishes',
          name: 'dish-list',
          component: () => import('@/views/dish-list/index.vue')
        },
        {
          path: 'dishes/new',
          name: 'dish-create',
          component: () => import('@/views/dish-edit/index.vue')
        },
        {
          path: 'dishes/:dishId/edit',
          name: 'dish-edit',
          component: () => import('@/views/dish-edit/index.vue')
        }
      ]
    },
    {
      path: '/preview/:dishId',
      name: 'preview',
      component: () => import('@/views/preview/index.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dishes'
    }
  ]
})

// 登录守卫：无 token 挡在登录页外（token 存 localStorage，新窗口同源可读）
router.beforeEach((to) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!to.meta.public && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && token) {
    return { path: '/dishes' }
  }
})

export default router
