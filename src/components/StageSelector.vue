<script setup lang="ts">
// C-11 阶段选择：三档单选（提前准备 / 现场准备 / 下锅炒制）
// 视觉对齐 MasterGo「单步编辑弹窗」中的 Select 选择器：200 宽、白底描边（设计图为正常态，非 filled）
import type { TaskStage } from '@/types/domain'
import { STAGE_OPTIONS } from '@/utils/constants'

const props = defineProps<{ modelValue?: TaskStage }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: TaskStage): void }>()

const options = STAGE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))

function onChange(value: unknown) {
  emit('update:modelValue', value as TaskStage)
}
</script>

<template>
  <t-select
    :value="props.modelValue"
    :options="options"
    class="stage-select"
    @change="onChange"
  />
</template>

<style scoped>
.stage-select {
  width: 200px;
  flex: none;
}
</style>
