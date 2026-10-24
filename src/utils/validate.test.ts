import { describe, it, expect } from 'vitest'
import { validateDish, validateTask } from './validate'
import type { DishContent, Task } from '@/types/domain'

function emptyDish(): DishContent {
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

function emptyTask(id = 't1', order_index = 1): Task {
  return {
    id,
    stage: 'onsite_prep',
    order_index,
    title: '',
    actions: [],
    video: { has_video: false },
    inputs: [],
    time: { active_duration_sec: 0 },
    success_criteria: '',
    pitfalls: '',
    requires_completion: false
  }
}

function validDish(): DishContent {
  const d = emptyDish()
  d.name = '宫保鸡丁'
  d.time.total_duration_sec = 3300
  d.ingredients = [{ name: '鸡胸肉', amount: '250g', category: '主料', lead_time_desc: '', lead_time_sec: 0 }]
  d.tasks = [
    {
      ...emptyTask(),
      title: '切丁',
      stage: 'cooking',
      time: { active_duration_sec: 600 },
      actions: [{ text: '切丁', images: [] }],
      inputs: [{ name: '鸡胸肉', amount: '250g' }]
    }
  ]
  return d
}

describe('validateDish', () => {
  it('空菜品返回多个阻断', () => {
    const errors = validateDish(emptyDish())
    expect(errors.some((e) => e.code === 'V_NAME')).toBe(true)
    expect(errors.some((e) => e.code === 'V_DURATION')).toBe(true)
    expect(errors.some((e) => e.code === 'V_INGREDIENTS_MIN')).toBe(true)
    expect(errors.some((e) => e.code === 'V_TASKS_MIN')).toBe(true)
  })

  it('合法菜品无阻断', () => {
    expect(validateDish(validDish()).length).toBe(0)
  })

  it('总时长小于分步之和触发阻断', () => {
    const d = validDish()
    d.time.total_duration_sec = 100
    expect(validateDish(d).some((e) => e.code === 'V_DURATION_SUM')).toBe(true)
  })

  it('阶段回退触发阻断', () => {
    const d = validDish()
    d.tasks.push({
      ...emptyTask('t2', 2),
      title: '装盘',
      stage: 'onsite_prep',
      time: { active_duration_sec: 100 },
      actions: [{ text: '装盘', images: [] }],
      inputs: [{ name: '鸡胸肉', amount: '10g' }]
    })
    expect(validateDish(d).some((e) => e.code === 'V_STAGE_ORDER')).toBe(true)
  })

  it('材料提前处理时长小于等于 1 分钟触发阻断', () => {
    const d = validDish()
    d.ingredients[0].lead_time_desc = '泡发'
    d.ingredients[0].lead_time_sec = 30
    expect(validateDish(d).some((e) => e.code === 'V_LEAD_SEC')).toBe(true)
  })

  it('材料名称用量不成对触发阻断', () => {
    const d = validDish()
    d.ingredients[0].amount = ''
    expect(validateDish(d).some((e) => e.code === 'V_INGREDIENT_PAIR')).toBe(true)
  })
})

describe('validateTask', () => {
  it('空任务返回多个校验错误', () => {
    const errors = validateTask(emptyTask())
    expect(errors.some((e) => e.code === 'T_TITLE')).toBe(true)
    expect(errors.some((e) => e.code === 'T_ACTIONS_MIN')).toBe(true)
    expect(errors.some((e) => e.code === 'T_INPUTS_MIN')).toBe(true)
    expect(errors.some((e) => e.code === 'T_DURATION')).toBe(true)
  })

  it('合法任务无错误', () => {
    const t = emptyTask()
    t.title = '切丁'
    t.actions = [{ text: '切丁', images: [] }]
    t.inputs = [{ name: '鸡胸肉', amount: '250g' }]
    t.time.active_duration_sec = 300
    expect(validateTask(t).length).toBe(0)
  })
})
