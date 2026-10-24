import { defineStore } from 'pinia'
import { login as loginApi } from '@/services/auth'
import { TOKEN_KEY } from '@/utils/constants'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(password: string) {
      const res = await loginApi({ password })
      this.token = res.token
      localStorage.setItem(TOKEN_KEY, res.token)
    },
    logout() {
      this.token = ''
      localStorage.removeItem(TOKEN_KEY)
    }
  }
})
