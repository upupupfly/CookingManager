import type { AxiosRequestConfig } from 'axios'
import type {
  DishListResponse,
  DishDetailResponse,
  SaveDraftResponse,
  PublishResponse,
  CreateDishResponse,
  DeleteDishResponse
} from '@/types/api'
import type { ApiError } from '@/types/api'
import type { DishContent } from '@/types/domain'
import { validateDish } from '@/utils/validate'
import { gongbaoContent, mockList } from './dishes'

// 内存态（mock 会话内）
let draftRev = 1
let draftContent: DishContent = gongbaoContent
let list = [...mockList]

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function apiError(code: string, message: string): ApiError {
  return { code, message }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function emptyDishContent(): DishContent {
  return {
    name: '',
    cover_image: '',
    difficulty: 'easy',
    category: '炒菜',
    tags: [],
    intro: '',
    time: { total_duration_sec: 0 },
    video: { url: '', duration_sec: 0, source: 'self_shot', source_credit: '', source_url: '', content_match: 'high' },
    ingredients: [],
    tasks: []
  }
}

export async function mockRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const method = (config.method ?? 'get').toLowerCase()
  const url = config.url ?? ''
  const data = config.data
  const params = (config.params ?? {}) as Record<string, unknown>

  await sleep(200)

  // 登录
  if (url === '/auth/login' && method === 'post') {
    if (!data?.password) throw apiError('INVALID_CREDENTIALS', '口令错误')
    return { token: 'mock-token-' + Date.now() } as T
  }

  // 列表
  if (url === '/dishes' && method === 'get') {
    let items = clone(list)
    if (params.status) items = items.filter((it) => it.status === params.status)
    if (params.category) items = items.filter((it) => it.category === params.category)
    if (params.difficulty) items = items.filter((it) => it.difficulty === params.difficulty)
    if (params.q) items = items.filter((it) => it.name.includes(String(params.q)))
    const resp: DishListResponse = {
      items,
      page: Number(params.page ?? 1),
      page_size: Number(params.page_size ?? 20),
      total: 128
    }
    return resp as T
  }

  // 新建菜
  if (url === '/dishes' && method === 'post') {
    const dishId = 'dish_' + Date.now()
    const content = emptyDishContent()
    draftContent = content
    draftRev = 1
    list.unshift({
      dish_id: dishId,
      name: '',
      category: '炒菜',
      difficulty: 'easy',
      total_duration_sec: 0,
      cover_image: null,
      status: 'draft',
      has_unpublished_changes: false,
      has_full_video: false,
      published_at: null
    })
    const resp: CreateDishResponse = { dish_id: dishId, rev: 1, content }
    return resp as T
  }

  // 删除菜（软删）
  if (url.startsWith('/dishes/') && method === 'delete') {
    const dishId = url.split('/')[2]
    const idx = list.findIndex((it) => it.dish_id === dishId)
    if (idx >= 0) list.splice(idx, 1)
    return { deleted: true } as T
  }

  // 保存草稿
  if (url.endsWith('/draft') && method === 'put') {
    const dishId = url.split('/')[2]
    draftRev = (Number(data?.base_rev) || 0) + 1
    draftContent = clone(data?.content as DishContent)
    const resp: SaveDraftResponse = {
      dish_id: dishId,
      layer: 'draft',
      rev: draftRev,
      content_hash: 'sha256:mock',
      saved_at: new Date().toISOString(),
      has_unpublished_changes: false,
      idempotent: false
    }
    return resp as T
  }

  // 发布（后端校验：与前端 validateDish 同规则）
  if (url.endsWith('/publish') && method === 'post') {
    const dishId = url.split('/')[2]
    const blocking = validateDish(draftContent)
    if (blocking.length > 0) {
      throw {
        code: 'PUBLISH_BLOCKED',
        message: `还有 ${blocking.length} 项不满足发布条件`,
        details: { checked_rev: data?.base_rev, warnings_only: false, blocking, warnings: [] }
      }
    }
    const resp: PublishResponse = {
      dish_id: dishId,
      status: 'published',
      published_at: new Date().toISOString(),
      source_rev: Number(data?.base_rev) || draftRev,
      content_hash: 'sha256:mock',
      no_op: false,
      has_unpublished_changes: false,
      warnings: [],
      checked_at: new Date().toISOString()
    }
    return resp as T
  }

  // 读取
  if (url.startsWith('/dishes/') && method === 'get') {
    const dishId = url.split('/')[2]
    const item = list.find((it) => it.dish_id === dishId)
    if (!item) throw apiError('DISH_NOT_FOUND', '这道菜不存在')
    const resp: DishDetailResponse = {
      dish_id: dishId,
      status: item.status,
      draft: {
        rev: draftRev,
        content: clone(draftContent),
        content_hash: 'sha256:mock',
        saved_at: new Date().toISOString()
      },
      published: item.status === 'published'
        ? { content_hash: 'sha256:mock', published_at: item.published_at ?? '' }
        : null,
      has_unpublished_changes: item.has_unpublished_changes
    }
    return resp as T
  }

  throw apiError('NOT_FOUND', `mock 未实现：${method.toUpperCase()} ${url}`)
}
