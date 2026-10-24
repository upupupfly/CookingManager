// 接口请求 / 响应类型 —— 与接口契约 v1.0 逐字段对应
// 调用处写 request<T>(...) 即可拿到完整响应类型。
import type { DishContent, DishStatus } from './domain'

// —— 通用错误 ——
export interface ApiError {
  code: string
  message: string
  details?: any
}

// 校验条目（B4 阻断/提示项）
export interface ValidationItem {
  code: string                      // V2/V9/V10/V11/V13/V16/V17/L1/L3 | V8/V12/L2
  section: string                   // B2.1~B2.7 / B3（「去修」定位分区）
  field?: string                    // 内容文档定位路径，如 tasks[3].stage
  message: string
}

// —— 登录（后端契约未覆盖，此处为建议形状）——
export interface LoginRequest { password: string }
export interface LoginResponse { token: string }

// —— 接口① 保存（契约 §2）——
export interface SaveDraftRequest {
  base_rev: number
  request_id: string                // UUID v4，幂等键
  content: DishContent
}
export interface SaveDraftResponse {
  dish_id: string
  layer: 'draft'
  rev: number                       // 新 rev = base_rev + 1
  content_hash: string
  saved_at: string
  has_unpublished_changes: boolean  // B2 页头角标就地刷新
  idempotent: boolean
}

// —— 接口② 发布（契约 §3）——
export interface PublishRequest {
  base_rev: number
  acknowledge_warnings?: boolean
}
export interface PublishResponse {
  dish_id: string
  status: 'published'
  published_at: string
  source_rev: number
  content_hash: string
  no_op: boolean
  has_unpublished_changes: boolean  // 恒 false（角标熄灭）
  warnings: ValidationItem[]
  checked_at: string
}
export interface PublishBlockedDetails {
  checked_rev: number
  warnings_only: boolean            // true = 无阻断只有提示 → 「继续发布」
  blocking: ValidationItem[]
  warnings: ValidationItem[]
}

// —— 接口③ 列表（契约 §4）——
export interface DishListItem {
  dish_id: string
  name: string                      // 线上层（draft 为其唯一内容）
  category: string
  difficulty: string
  total_duration_sec: number
  cover_image: string | null
  status: DishStatus
  has_unpublished_changes: boolean  // 派生只读，前端不自算
  has_full_video: boolean           // false → 「缺整片」
  published_at: string | null
}
export interface DishListParams {
  status?: DishStatus
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'   // 难度筛选（后端契约未覆盖，前端新增）
  q?: string
  page?: number
  page_size?: number
}
export interface DishListResponse {
  items: DishListItem[]
  page: number
  page_size: number
  total: number
}

// —— 读取（契约 §5）——
export interface DishDetailResponse {
  dish_id: string
  status: DishStatus
  draft: { rev: number; content: DishContent; content_hash: string; saved_at: string | null }
  published: { content_hash: string; published_at: string } | null
  has_unpublished_changes: boolean
}

// —— 新建菜（后端契约未覆盖，此处为建议形状）——
export interface CreateDishResponse {
  dish_id: string
  rev: number
  content: DishContent
}

// —— 删除菜（软删，后端契约未覆盖，此处为建议形状）——
export interface DeleteDishResponse {
  deleted: boolean
}
