<script setup lang="ts">
// 菜品发布预览：新窗口只读渲染，数据取最新一次保存/发布的内容（getDish → draft）
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDish } from '@/services/dish'
import type { DishContent } from '@/types/domain'
import { formatDuration } from '@/utils/format'
import { STAGE_OPTIONS, INGREDIENT_CATEGORY_ORDER } from '@/utils/constants'

const route = useRoute()

const content = ref<DishContent | null>(null)
const loading = ref(true)
const loadError = ref(false)

function stageInfo(v: string) {
  return STAGE_OPTIONS.find((o) => o.value === v)
}

function difficultyLabel(v: string) {
  return v === 'easy' ? '简单' : v === 'medium' ? '中等' : v === 'hard' ? '困难' : v
}

function ingredientsOf(cat: string) {
  return content.value?.ingredients.filter((i) => i.category === cat) || []
}

function closePreview() {
  window.close()
}

onMounted(async () => {
  const id = route.params.dishId as string
  try {
    const res = await getDish(id)
    content.value = res.draft.content
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="preview-page">
    <!-- 顶部只读条 -->
    <div class="preview-bar">
      <t-tag theme="warning" variant="light">预览 · 未发布</t-tag>
      <t-button theme="default" size="small" @click="closePreview">关闭预览</t-button>
    </div>

    <div v-if="loading" class="state">加载中…</div>
    <div v-else-if="loadError" class="state">没加载出来</div>
    <template v-else-if="content">
      <!-- 菜品信息 -->
      <div class="dish-info">
        <h1 class="dish-name">{{ content.name || '未命名菜品' }}</h1>
        <div class="dish-meta">
          <span>{{ content.category }}</span>
          <span>{{ difficultyLabel(content.difficulty) }}</span>
          <span>预估 {{ formatDuration(content.time.total_duration_sec) }}</span>
        </div>
      </div>

      <!-- 材料清单 -->
      <div class="section">
        <h2 class="section-title">材料清单</h2>
        <template v-for="cat in INGREDIENT_CATEGORY_ORDER" :key="cat">
          <template v-if="ingredientsOf(cat).length > 0">
            <div class="ing-group-title">{{ cat }}</div>
            <div v-for="(ing, i) in ingredientsOf(cat)" :key="i" class="ing-row">
              <span class="ing-name">{{ ing.name }}</span>
              <span class="ing-amount">{{ ing.amount }}</span>
            </div>
          </template>
        </template>
      </div>

      <!-- 步骤列表 -->
      <div class="section">
        <h2 class="section-title">步骤</h2>
        <div v-for="(task, i) in content.tasks" :key="task.id" class="step">
          <div class="step-head">
            <span class="step-no">第 {{ i + 1 }}/{{ content.tasks.length }} 步</span>
            <span class="step-title">{{ task.title || '未命名步骤' }}</span>
            <t-tag size="small" variant="light" :theme="stageInfo(task.stage)?.theme || 'default'">
              {{ stageInfo(task.stage)?.label || task.stage }}
            </t-tag>
          </div>
          <div v-if="task.inputs.length > 0" class="step-inputs">
            <span v-for="(inp, j) in task.inputs" :key="j" class="input-chip">
              {{ inp.name }}{{ inp.amount ? ' ' + inp.amount : '' }}
            </span>
          </div>
          <ol v-if="task.actions.length > 0" class="step-actions">
            <li v-for="(a, j) in task.actions" :key="j">{{ a.text }}</li>
          </ol>
          <p v-if="task.success_criteria" class="step-criteria">成功判据：{{ task.success_criteria }}</p>
          <p v-if="task.pitfalls" class="step-pitfalls">避坑：{{ task.pitfalls }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.preview-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 20px 40px;
  background: #f5f5f5;
  min-height: 100vh;
}
.preview-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  margin: -16px -20px 16px;
  padding-left: 20px;
  padding-right: 20px;
}
.state {
  padding: 48px 0;
  text-align: center;
  color: rgba(0, 0, 0, 0.4);
  font-size: 14px;
}
.dish-info {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 16px;
}
.dish-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}
.dish-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}
.section {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 16px;
}
.section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}
.ing-group-title {
  margin: 8px 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}
.ing-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f3f3f3;
}
.ing-name {
  color: rgba(0, 0, 0, 0.9);
  font-size: 14px;
}
.ing-amount {
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
}
.step {
  padding: 12px 0;
  border-bottom: 1px solid #f3f3f3;
}
.step-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.step-no {
  color: rgba(0, 0, 0, 0.4);
  font-size: 13px;
  white-space: nowrap;
}
.step-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}
.step-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}
.input-chip {
  font-size: 12px;
  padding: 2px 8px;
  background: #f3f3f3;
  border-radius: 3px;
  color: rgba(0, 0, 0, 0.6);
}
.step-actions {
  margin: 4px 0;
  padding-left: 20px;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
}
.step-criteria {
  margin: 4px 0;
  font-size: 13px;
  color: #2ba471;
}
.step-pitfalls {
  margin: 4px 0;
  font-size: 13px;
  color: #e37318;
}
</style>
