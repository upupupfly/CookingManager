import type { DishContent } from '@/types/domain'
import type { DishListItem } from '@/types/api'
import coverFanqie from '@/assets/dishes/dish-fanqie.jpg'
import coverGongbao from '@/assets/dishes/dish-gongbao.jpg'
import coverHongshao from '@/assets/dishes/dish-hongshao.jpg'
import coverZicai from '@/assets/dishes/dish-zicai.jpg'

// 样板菜「宫保鸡丁」完整内容（与数据规格 v1.9 Schema 同构）
export const gongbaoContent: DishContent = {
  name: '宫保鸡丁',
  cover_image: coverGongbao,
  difficulty: 'medium',
  category: '炒菜',
  tags: ['川菜', '下饭'],
  intro: '酸甜微辣，鸡丁嫩滑，花生酥脆。',
  time: { total_duration_sec: 3300 },
  video: {
    url: 'https://cdn.example.com/gongbao.mp4',
    duration_sec: 400,
    source: 'web_clip',
    source_credit: '素材来源说明',
    source_url: 'https://example.com/src',
    content_match: 'medium'
  },
  ingredients: [
    { name: '鸡胸肉', amount: '250g', category: '主料', lead_time_desc: '', lead_time_sec: 0 },
    { name: '干木耳', amount: '15g', category: '辅料', lead_time_desc: '冷水泡发', lead_time_sec: 14400 },
    { name: '花生米', amount: '50g', category: '辅料', lead_time_desc: '', lead_time_sec: 0 },
    { name: '盐', amount: '10g', category: '调料', lead_time_desc: '', lead_time_sec: 0 },
    { name: '料酒', amount: '10ml', category: '调料', lead_time_desc: '', lead_time_sec: 0 }
  ],
  tasks: [
    {
      id: 't_001',
      stage: 'advance_prep',
      order_index: 1,
      title: '木耳冷水泡发',
      actions: [
        { text: '冷水没过木耳', images: [] },
        { text: '冷藏静置 4 小时', images: [] }
      ],
      video: { has_video: false },
      inputs: [{ name: '干木耳', amount: '15g' }],
      time: { active_duration_sec: 120 },
      success_criteria: '朵完全舒展，捏起来厚实有弹性',
      pitfalls: '热水泡发口感发硬',
      requires_completion: false
    },
    {
      id: 't_002',
      stage: 'onsite_prep',
      order_index: 2,
      title: '鸡胸切丁',
      actions: [
        { text: '顺纹切片', images: [] },
        { text: '切成 1.5cm 见方的丁', images: [] }
      ],
      video: { has_video: true, start_sec: 62, end_sec: 84, loop: true },
      inputs: [{ name: '鸡胸肉', amount: '250g' }],
      time: { active_duration_sec: 300 },
      success_criteria: '丁约 1.5cm 见方，大小均匀',
      pitfalls: '带筋膜炒后发硬',
      requires_completion: false
    },
    {
      id: 't_003',
      stage: 'cooking',
      order_index: 3,
      title: '滑炒鸡丁',
      actions: [
        { text: '热锅冷油，下鸡丁快速划散', images: [] },
        { text: '倒入碗汁翻炒收汁', images: [] }
      ],
      video: { has_video: true, start_sec: 120, end_sec: 160, loop: true },
      inputs: [
        { name: '盐', amount: '5g' },
        { name: '料酒', amount: '5ml' }
      ],
      time: { active_duration_sec: 240 },
      success_criteria: '鸡丁表面全部变白、边缘微卷',
      pitfalls: '油温不够就下锅会脱浆',
      requires_completion: false
    }
  ]
}

// 列表 mock（与设计图 7 行对齐）
export const mockList: DishListItem[] = [
  {
    dish_id: 'dish_fanqie',
    name: '番茄炒蛋',
    category: '炒菜',
    difficulty: 'easy',
    total_duration_sec: 900,
    cover_image: coverFanqie,
    status: 'published',
    has_unpublished_changes: true,
    has_full_video: true,
    published_at: '2026-10-20T10:00:00+08:00'
  },
  {
    dish_id: 'dish_tudousi',
    name: '酸辣土豆丝',
    category: '炒菜',
    difficulty: 'easy',
    total_duration_sec: 1200,
    cover_image: coverGongbao,
    status: 'draft',
    has_unpublished_changes: false,
    has_full_video: true,
    published_at: null
  },
  {
    dish_id: 'dish_hongshao',
    name: '红烧肉',
    category: '炒菜',
    difficulty: 'hard',
    total_duration_sec: 5400,
    cover_image: coverHongshao,
    status: 'published',
    has_unpublished_changes: true,
    has_full_video: false,
    published_at: '2026-10-18T09:00:00+08:00'
  },
  {
    dish_id: 'dish_zicai',
    name: '紫菜蛋花汤',
    category: '汤羹',
    difficulty: 'easy',
    total_duration_sec: 600,
    cover_image: coverZicai,
    status: 'published',
    has_unpublished_changes: false,
    has_full_video: true,
    published_at: '2026-10-17T09:00:00+08:00'
  },
  {
    dish_id: 'dish_liangban',
    name: '凉拌黄瓜',
    category: '凉菜',
    difficulty: 'easy',
    total_duration_sec: 600,
    cover_image: coverGongbao,
    status: 'draft',
    has_unpublished_changes: false,
    has_full_video: true,
    published_at: null
  },
  {
    dish_id: 'dish_xianggu',
    name: '香菇炖鸡汤',
    category: '炖菜',
    difficulty: 'medium',
    total_duration_sec: 7200,
    cover_image: coverHongshao,
    status: 'published',
    has_unpublished_changes: false,
    has_full_video: true,
    published_at: '2026-10-16T09:00:00+08:00'
  },
  {
    dish_id: 'dish_xihongshi',
    name: '西红柿鸡蛋面',
    category: '主食',
    difficulty: 'medium',
    total_duration_sec: 1500,
    cover_image: coverFanqie,
    status: 'published',
    has_unpublished_changes: true,
    has_full_video: true,
    published_at: '2026-10-15T09:00:00+08:00'
  }
]
