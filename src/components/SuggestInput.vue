<script setup lang="ts">
// C-12 建议输入：自由文本 + 输入建议（材料名 / 本步用料名）
// 基于 TDesign Select 的 filterable + creatable：可搜索、可自由输入新值
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string
  suggestions?: string[]
  placeholder?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const options = computed(() => (props.suggestions || []).map((s) => ({ label: s, value: s })))

function onChange(value: unknown) {
  emit('update:modelValue', String(value ?? ''))
}
</script>

<template>
  <t-select
    :value="modelValue"
    :options="options"
    filterable
    creatable
    clearable
    :placeholder="placeholder || '请输入'"
    @change="onChange"
  />
</template>
