import { request } from './request'

// 预览票据（后端契约未覆盖，此处为建议形状，待后端确认）
export interface PreviewTicketResponse {
  ticket: string
}

export const createPreviewTicket = (dishId: string) =>
  request<PreviewTicketResponse>({ method: 'POST', url: `/dishes/${dishId}/preview-ticket` })
