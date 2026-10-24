<script setup lang="ts">
// C-22 保存状态指示器：未保存 / 保存中 / 已保存 / 失败 / 冲突 / 离线
// 失败态不用 Toast 代替，常驻页头
import type { SaveState } from '@/stores/dish'
import { formatClock } from '@/utils/format'

defineProps<{
  state: SaveState
  savedAt?: string
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <span class="save-status">
    <template v-if="state === 'idle'">未保存</template>
    <template v-else-if="state === 'saving'">
      <span class="saving">保存中…</span>
    </template>
    <template v-else-if="state === 'saved'">
      <span class="saved">✓ 已保存{{ savedAt ? ' · ' + formatClock(savedAt) : '' }}</span>
    </template>
    <template v-else-if="state === 'failed'">
      <span class="failed">没存上</span>
      <t-button size="small" theme="primary" variant="text" @click="$emit('retry')">重试</t-button>
    </template>
    <template v-else-if="state === 'conflict'">
      <span class="failed">保存冲突</span>
      <t-button size="small" theme="primary" variant="text" @click="$emit('retry')">处理</t-button>
    </template>
    <template v-else-if="state === 'offline'">
      <span class="failed">离线</span>
    </template>
  </span>
</template>

<style scoped>
.save-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}
.saving {
  color: rgba(0, 0, 0, 0.4);
}
.saved {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: #e3f9e9;
  border-radius: 3px;
  color: #2ba471;
  font-size: 12px;
  line-height: 20px;
}
.failed {
  color: #d54941;
}
</style>
