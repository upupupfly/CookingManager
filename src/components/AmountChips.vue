<script setup lang="ts">
// C-13 用量快捷 chip：点选填入用量输入框（chip 不抢焦点环）
import { AMOUNT_CHIPS } from '@/utils/constants'

defineEmits<{ (e: 'select', value: string): void }>()
</script>

<template>
  <div class="amount-chips">
    <span
      v-for="chip in AMOUNT_CHIPS"
      :key="chip"
      class="chip"
      role="button"
      @click="$emit('select', chip)"
    >
      {{ chip }}
    </span>
  </div>
</template>

<style scoped>
.amount-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 3px;
  background: #f3f3f3;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  user-select: none;
}
.chip:hover {
  background: #e8e8e8;
}
</style>
