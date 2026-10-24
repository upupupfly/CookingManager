import { request } from './request'
import type { LoginRequest, LoginResponse } from '@/types/api'

export const login = (data: LoginRequest) =>
  request<LoginResponse>({ method: 'POST', url: '/auth/login', data })
