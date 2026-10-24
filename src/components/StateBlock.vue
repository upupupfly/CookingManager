<script setup lang="ts">
// C-09 状态块：空态 / 骨架屏（3 条）/ 错误态
defineProps<{
  state: 'empty' | 'loading' | 'error'
  emptyText?: string
  errorText?: string
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div class="state-block">
    <template v-if="state === 'loading'">
      <div v-for="i in 3" :key="i" class="skeleton-row" />
    </template>
    <template v-else-if="state === 'empty'">
      <div class="empty">{{ emptyText || '还没有内容' }}</div>
    </template>
    <template v-else-if="state === 'error'">
      <div class="error">
        <span>{{ errorText || '没加载出来' }}</span>
        <t-button size="small" theme="primary" variant="outline" @click="$emit('retry')">重试</t-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.state-block {
  padding: 40px 0;
}
.skeleton-row {
  height: 44px;
  margin-bottom: 12px;
  background: #f3f3f3;
  border-radius: 4px;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.empty,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  color: rgba(0, 0, 0, 0.4);
  font-size: 14px;
}
</style>
