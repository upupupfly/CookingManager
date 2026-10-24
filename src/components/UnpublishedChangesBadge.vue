<script setup lang="ts">
// C-23 未发布改动角标：纯展示、不可点击、不聚焦；无改动时不渲染
// 中性次要样式，不抢状态标签的视觉权重
defineProps<{
  show: boolean
}>()
</script>

<template>
  <span
    v-if="show"
    class="badge"
    title="这份菜的改动还没发布；用户端和列表仍显示上一版"
  >
    有未发布改动
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  font-size: 12px;
  line-height: 16px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f3f3f3;
  color: rgba(0, 0, 0, 0.6);
  max-width: 96px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
