<script setup lang="ts">
// C-03 步骤卡片：摘要 + 操作（编辑/上移/下移/删除）。
// 按钮加 no-drag 类，由 SortableJS filter 排除，保证可点击而非拖动。
import type { Task } from '@/types/domain'
import { STAGE_OPTIONS } from '@/utils/constants'

defineProps<{
  task: Task
  index: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'move-up'): void
  (e: 'move-down'): void
  (e: 'remove'): void
}>()

function stageLabel(v: string) {
  return STAGE_OPTIONS.find((o) => o.value === v)?.label ?? v
}
function stageTheme(v: string) {
  return STAGE_OPTIONS.find((o) => o.value === v)?.theme ?? 'default'
}
</script>

<template>
  <div class="task-card">
    <div class="card-body">
      <span class="seq">第 {{ index + 1 }}/{{ total }} 步</span>
      <span class="title">{{ task.title || '未命名步骤' }}</span>
      <t-tag size="small" variant="light" :theme="stageTheme(task.stage)">{{ stageLabel(task.stage) }}</t-tag>
      <span class="summary">
        {{ task.actions.length }} 个动作 · {{ task.inputs.length }} 项用料
      </span>
    </div>
    <div class="actions">
      <t-button class="no-drag" size="small" variant="text" theme="primary" @click="emit('edit')">编辑</t-button>
      <t-button class="no-drag" size="small" variant="text" theme="default" :disabled="index === 0" @click="emit('move-up')">上移</t-button>
      <t-button class="no-drag" size="small" variant="text" theme="default" :disabled="index === total - 1" @click="emit('move-down')">下移</t-button>
      <t-button class="no-drag" size="small" variant="text" theme="danger" @click="emit('remove')">删除</t-button>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 3px;
  margin-bottom: 8px;
}
.card-body {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  cursor: grab;
}
.seq {
  color: rgba(0, 0, 0, 0.4);
  font-size: 13px;
  white-space: nowrap;
}
.title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.summary {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}
.actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
