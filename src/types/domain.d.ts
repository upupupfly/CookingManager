// 数据模型类型 —— 与数据规格 v1.9 §4 Schema、接口契约 v1.0 内容文档逐字一致
// 枚举一律用字面量联合类型，业务码禁止散落字符串，一律引用本文件。

export type DishStatus = 'draft' | 'published'
export type DishCategory = '炒菜' | '汤羹' | '炖菜' | '凉菜' | '主食'
export type DishDifficulty = 'easy' | 'medium' | 'hard'
export type TaskStage = 'advance_prep' | 'onsite_prep' | 'cooking'
export type IngredientCategory = '主料' | '辅料' | '调料' | '工具'
export type VideoSource = 'self_shot' | 'web_clip' | 'licensed'
export type ContentMatch = 'high' | 'medium' | 'low'

export interface DishTime {
  total_duration_sec: number
}

export interface DishVideo {
  url: string
  duration_sec: number
  source: VideoSource
  source_credit: string
  source_url: string
  content_match: ContentMatch
}

export interface Ingredient {
  name: string
  amount: string                    // 字符串单字段：'250g' | '2勺' | '适量'
  category: IngredientCategory
  lead_time_desc: string            // 与 lead_time_sec 成对（L1 校验）
  lead_time_sec: number
  shopping_note?: string
  is_pantry_staple?: boolean
}

export interface ActionImage {
  url: string
  note: string | null
}

export interface Action {
  text: string
  images: ActionImage[]             // ≤ 9 张
}

export interface TaskVideo {
  has_video: boolean
  url?: string
  start_sec?: number
  end_sec?: number
  loop?: boolean
}

export interface TaskInput {
  name: string
  amount: string
}

export interface Task {
  id: string                        // 版本内唯一
  stage: TaskStage
  order_index: number               // 正整数，版本内唯一
  title: string                     // ≤ 20 字
  actions: Action[]                 // 必填（值可为空，发布时 L3 校验）
  video: TaskVideo
  inputs: TaskInput[]
  time: { active_duration_sec: number }
  success_criteria: string          // 选填（V1 已作废，不阻断）
  pitfalls: string
  requires_completion: boolean      // 恒 false
}

export interface DishContent {
  name: string
  cover_image: string
  difficulty: DishDifficulty
  category: DishCategory
  tags: string[]
  intro: string
  time: DishTime
  video: DishVideo
  ingredients: Ingredient[]
  tasks: Task[]
}
