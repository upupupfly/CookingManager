<script setup lang="ts">
// C-01 左侧分区锚点导航
defineProps<{
  items: { key: string; label: string }[]
  active: string
}>()

const emit = defineEmits<{ (e: 'select', key: string): void }>()
</script>

<template>
  <nav class="anchor-rail">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="anchor-item"
      :class="{ active: active === item.key }"
      @click="emit('select', item.key)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<style scoped>
.anchor-rail {
  position: sticky;
  top: 76px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 200px;
  flex-shrink: 0;
  align-self: flex-start;
}
.anchor-item {
  text-align: left;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 3px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
}
.anchor-item:hover {
  background: #f3f3f3;
}
.anchor-item.active {
  background: #f2f3ff;
  color: #0052d9;
  font-weight: 500;
}
</style>
