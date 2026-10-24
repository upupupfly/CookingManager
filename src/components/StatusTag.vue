<script setup lang="ts">
// C-14 状态标签：只有两态，无第三态
// 依据 TDesign 对齐规范 v1.0：已发布=success、未发布=warning
import type { DishStatus } from '@/types/domain'

defineProps<{
  status: DishStatus
}>()
</script>

<template>
  <t-tag v-if="status === 'draft'" theme="warning" variant="light">未发布</t-tag>
  <t-tag v-else theme="success" variant="light">已发布</t-tag>
</template>
