import type { DishContent, Task } from '@/types/domain'
import type { ValidationItem } from '@/types/api'

// 阶段固定顺序：提前准备 → 现场准备 → 下锅炒制
const STAGE_ORDER: Record<string, number> = {
  advance_prep: 0,
  onsite_prep: 1,
  cooking: 2
}

// B2 页级校验（发布时前端先校验，通过后再走后端）
export function validateDish(content: DishContent): ValidationItem[] {
  const errors: ValidationItem[] = []

  // 菜品名称必填
  if (!content.name.trim()) {
    errors.push({ code: 'V_NAME', section: 'B2.1', field: 'name', message: '菜品名称不能为空' })
  }
  // 分类必填
  if (!content.category) {
    errors.push({ code: 'V_CATEGORY', section: 'B2.1', field: 'category', message: '分类必填' })
  }
  // 难度必填
  if (!content.difficulty) {
    errors.push({ code: 'V_DIFFICULTY', section: 'B2.1', field: 'difficulty', message: '难度必填' })
  }
  // 总时长必填且 > 0
  if (content.time.total_duration_sec <= 0) {
    errors.push({ code: 'V_DURATION', section: 'B2.1', field: 'time.total_duration_sec', message: '总时长必填且大于 0' })
  }
  // 总时长 >= 各分步预估时长之和
  const stepSum = content.tasks.reduce((s, t) => s + (t.time?.active_duration_sec || 0), 0)
  if (stepSum > content.time.total_duration_sec) {
    errors.push({
      code: 'V_DURATION_SUM',
      section: 'B2.1',
      field: 'time.total_duration_sec',
      message: '总时长不能小于各分步预估时长之和'
    })
  }
  // 材料清单至少一条
  if (content.ingredients.length === 0) {
    errors.push({ code: 'V_INGREDIENTS_MIN', section: 'B2.2', message: '材料清单至少一条数据' })
  }
  // 材料字段成对 + 提前处理
  content.ingredients.forEach((ing, i) => {
    const label = ing.name.trim() || `第 ${i + 1} 条材料`
    const hasName = !!ing.name.trim()
    const hasAmount = !!ing.amount.trim()
    if (hasName !== hasAmount) {
      errors.push({
        code: 'V_INGREDIENT_PAIR',
        section: 'B2.2',
        field: `ingredients[${i}]`,
        message: `「${label}」名称和用量需同时填写`
      })
    }
    const leadOn = ing.lead_time_sec > 0 || !!ing.lead_time_desc.trim()
    if (leadOn) {
      if (!ing.lead_time_desc.trim()) {
        errors.push({
          code: 'V_LEAD_DESC',
          section: 'B2.2',
          field: `ingredients[${i}].lead_time_desc`,
          message: `「${label}」提前处理说明必填`
        })
      }
      if (ing.lead_time_sec <= 60) {
        errors.push({
          code: 'V_LEAD_SEC',
          section: 'B2.2',
          field: `ingredients[${i}].lead_time_sec`,
          message: `「${label}」提前时长必须大于 1 分钟`
        })
      }
    }
  })
  // 步骤编排至少一条
  if (content.tasks.length === 0) {
    errors.push({ code: 'V_TASKS_MIN', section: 'B2.3', message: '步骤编排至少一条数据' })
  }
  // 固定阶段顺序
  for (let i = 1; i < content.tasks.length; i++) {
    const prev = content.tasks[i - 1].stage
    const cur = content.tasks[i].stage
    if (prev && cur && STAGE_ORDER[prev] > STAGE_ORDER[cur]) {
      errors.push({
        code: 'V_STAGE_ORDER',
        section: 'B2.3',
        field: `tasks[${i}].stage`,
        message: '阶段顺序必须为 提前准备 → 现场准备 → 下锅炒制'
      })
      break
    }
  }

  return errors
}

// B2.4 单步编辑弹窗校验
export function validateTask(task: Task): ValidationItem[] {
  const errors: ValidationItem[] = []
  if (!task.title.trim()) {
    errors.push({ code: 'T_TITLE', section: 'B2.4', field: 'title', message: '步骤标题必填' })
  }
  if (task.actions.length === 0) {
    errors.push({ code: 'T_ACTIONS_MIN', section: 'B2.4', field: 'actions', message: '单步动作至少一条' })
  }
  task.actions.forEach((a, i) => {
    if (!a.text.trim()) {
      errors.push({ code: 'T_ACTION_TEXT', section: 'B2.4', field: `actions[${i}].text`, message: `动作 ${i + 1} 说明必填` })
    }
  })
  if (task.inputs.length === 0) {
    errors.push({ code: 'T_INPUTS_MIN', section: 'B2.4', field: 'inputs', message: '用料至少一条' })
  }
  task.inputs.forEach((inp, i) => {
    if (!inp.name.trim()) {
      errors.push({ code: 'T_INPUT_NAME', section: 'B2.4', field: `inputs[${i}].name`, message: `用料 ${i + 1} 名称必填` })
    }
    if (!inp.amount.trim()) {
      errors.push({ code: 'T_INPUT_AMOUNT', section: 'B2.4', field: `inputs[${i}].amount`, message: `用料 ${i + 1} 用量必填` })
    }
  })
  if (!task.stage) {
    errors.push({ code: 'T_STAGE', section: 'B2.4', field: 'stage', message: '阶段必填' })
  }
  if ((task.time?.active_duration_sec || 0) <= 0) {
    errors.push({ code: 'T_DURATION', section: 'B2.4', field: 'time.active_duration_sec', message: '预估时长必填' })
  }
  return errors
}
