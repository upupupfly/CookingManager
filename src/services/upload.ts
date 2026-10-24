import { request } from './request'

// 对象存储上传签名（后端契约未覆盖，此处为建议形状，待后端确认）
export interface UploadSignatureResponse {
  upload_url: string
  key: string
  token?: string
}

export const getUploadSignature = (fileName: string, contentType: string) =>
  request<UploadSignatureResponse>({
    method: 'POST',
    url: '/upload/signature',
    data: { file_name: fileName, content_type: contentType }
  })
