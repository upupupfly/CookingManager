import type {
  DishCategory,
  DishDifficulty,
  TaskStage,
  IngredientCategory,
  VideoSource,
  ContentMatch
} from '@/types/domain'

// token 本地存储键（request 拦截器与 auth store 共用）
export const TOKEN_KEY = 'cooking_admin_token'

export const CATEGORY_OPTIONS: DishCategory[] = ['炒菜', '汤羹', '炖菜', '凉菜', '主食']

export const DIFFICULTY_OPTIONS: { value: DishDifficulty; label: string }[] = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' }
]

export const STAGE_OPTIONS: { value: TaskStage; label: string; color: string; theme: 'success' | 'primary' | 'danger' }[] = [
  { value: 'advance_prep', label: '提前准备', color: '#2BA471', theme: 'success' },
  { value: 'onsite_prep', label: '现场准备', color: '#0052D9', theme: 'primary' },
  { value: 'cooking', label: '下锅炒制', color: '#D54941', theme: 'danger' }
]

// 材料分组固定序
export const INGREDIENT_CATEGORY_ORDER: IngredientCategory[] = ['主料', '辅料', '调料', '工具']

export const VIDEO_SOURCE_OPTIONS: { value: VideoSource; label: string }[] = [
  { value: 'self_shot', label: '自己拍摄' },
  { value: 'web_clip', label: '网络素材' },
  { value: 'licensed', label: '已获授权' }
]

export const CONTENT_MATCH_OPTIONS: { value: ContentMatch; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
]

// 用量常用值快捷 chip
export const AMOUNT_CHIPS = [
  '100g', '250g', '500g', '10ml', '200ml',
  '1个', '2瓣', '1根', '1勺', '半勺', '1茶匙', '8~10g', '适量', '少许'
]

// 校验项「去修」定位分区 → 中文名（B4 展示用）
export const SECTION_LABELS: Record<string, string> = {
  'B2.1': '基本信息',
  'B2.2': '材料清单',
  'B2.3': '任务编排',
  'B2.4': '单步编辑',
  'B2.5': '动作配图',
  'B2.6': '视频与来源',
  'B2.7': '阶段与核对',
  B3: '视频打点'
}
