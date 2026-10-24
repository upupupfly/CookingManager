import { request } from './request'
import type {
  DishListParams,
  DishListResponse,
  DishDetailResponse,
  SaveDraftRequest,
  SaveDraftResponse,
  PublishRequest,
  PublishResponse,
  CreateDishResponse,
  DeleteDishResponse
} from '@/types/api'

// 列表（契约 §4）
export const listDishes = (params: DishListParams) =>
  request<DishListResponse>({ method: 'GET', url: '/dishes', params })

// 读取（契约 §5）
export const getDish = (dishId: string) =>
  request<DishDetailResponse>({ method: 'GET', url: `/dishes/${dishId}` })

// 保存草稿副本（契约 §2）
export const saveDraft = (dishId: string, data: SaveDraftRequest) =>
  request<SaveDraftResponse>({ method: 'PUT', url: `/dishes/${dishId}/draft`, data })

// 发布（契约 §3）
export const publishDish = (dishId: string, data: PublishRequest) =>
  request<PublishResponse>({ method: 'POST', url: `/dishes/${dishId}/publish`, data })

// 新建菜（后端契约未覆盖，建议形状）
export const createDish = () =>
  request<CreateDishResponse>({ method: 'POST', url: '/dishes' })

// 删除菜（软删，后端契约未覆盖，建议形状）
export const deleteDish = (dishId: string) =>
  request<DeleteDishResponse>({ method: 'DELETE', url: `/dishes/${dishId}` })
