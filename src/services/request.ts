import axios, { type AxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'
import { errorMap } from '@/utils/error-map'
import { TOKEN_KEY } from '@/utils/constants'
import { mockRequest } from '@/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000
})

// 1) 自动注入 token（直接读 localStorage，避免与 Pinia 循环依赖）
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 2) 统一错误归一化：后端 { error: { code, message, details } } → 抛 ApiError
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const body = err.response?.data
    const status: number | undefined = err.response?.status
    const code: string = body?.error?.code ?? (status != null ? String(status) : 'NETWORK')
    const message: string = body?.error?.message ?? errorMap[code] ?? '网络异常'
    const apiErr: ApiError = { code, message, details: body?.error?.details }
    return Promise.reject(apiErr)
  }
)

// 3) 泛型请求：调用处通过 T 拿到响应类型
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  if (USE_MOCK) {
    return mockRequest<T>(config)
  }
  // 响应拦截器已把 res.data 解包，这里用断言收敛为 T（与拦截器行为一致）
  return http.request(config) as Promise<T>
}

export { http }
