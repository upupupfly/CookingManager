<script setup lang="ts">
// C-15 材料条目行：名称（建议输入）+ 用量 + 提前处理对 + 删除
// 名称 placeholder「材料名称」，用量 placeholder「用量」
import { computed } from 'vue'
import type { Ingredient } from '@/types/domain'
import SuggestInput from './SuggestInput.vue'

const props = defineProps<{
  ingredient: Ingredient
  suggestions?: string[]
}>()

const emit = defineEmits<{ (e: 'remove'): void }>()

const leadTimeOn = computed({
  get: () => props.ingredient.lead_time_sec > 0 || !!props.ingredient.lead_time_desc,
  set: (v: boolean) => {
    if (!v) {
      props.ingredient.lead_time_desc = ''
      props.ingredient.lead_time_sec = 0
    }
  }
})
</script>

<template>
  <div class="ingredient-row">
    <SuggestInput
      v-model="ingredient.name"
      :suggestions="suggestions"
      placeholder="材料名称"
      class="col-name"
    />
    <t-input v-model="ingredient.amount" placeholder="用量" class="col-amount" />
    <span class="lead-label">提前处理</span>
    <t-switch v-model="leadTimeOn" size="small" />
    <template v-if="leadTimeOn">
      <t-input v-model="ingredient.lead_time_desc" placeholder="提前处理说明" class="col-lead" />
      <t-input-number v-model="ingredient.lead_time_sec" :min="0" placeholder="提前时长(秒)" class="col-lead-sec" />
    </template>
    <t-button size="small" variant="text" theme="danger" @click="emit('remove')">删除</t-button>
  </div>
</template>

<style scoped>
.ingredient-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.col-name {
  width: 220px;
}
.col-amount {
  width: 140px;
}
.lead-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
}
.col-lead {
  width: 200px;
}
.col-lead-sec {
  width: 140px;
}
</style>
