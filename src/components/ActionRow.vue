<script setup lang="ts">
// C-04 动作行：编号徽标 + 动作文字 + 配图（≤9）；徽标下方常驻删除图标按钮
// 视觉对齐 MasterGo「单步编辑弹窗」中的 action-item：徽标 20×20、文本域 456×54、图片组左缩进 28
// 左列固定为 20px 宽（徽标与删除按钮垂直堆叠），保证文本域左边缘 x 不变
import type { Action } from '@/types/domain'
import ImageUploader from './ImageUploader.vue'

defineProps<{
  action: Action
  index: number
}>()

const emit = defineEmits<{ (e: 'remove'): void }>()
</script>

<template>
  <div class="action-item">
    <div class="action-row">
      <div class="action-lead">
        <span class="action-no">{{ index + 1 }}</span>
        <!-- 删除图标按钮：与菜品编辑页「材料清单」/「本步用料」.del-btn 完全一致，常驻显示 -->
        <button type="button" class="del-btn" aria-label="删除动作" @click="emit('remove')">
          −
        </button>
      </div>
      <t-textarea v-model="action.text" class="action-text" placeholder="请输入动作描述" />
    </div>
    <ImageUploader v-model="action.images" :max="9" class="action-images" />
  </div>
</template>

<style scoped>
.action-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.action-lead {
  width: 20px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.action-no {
  width: 20px;
  height: 20px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0052d9;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  line-height: 20px;
}
.action-text {
  width: 456px;
  flex: none;
}
.action-text :deep(.t-textarea__inner) {
  height: 54px;
  min-height: 54px;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 22px;
}
.del-btn {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: none;
  background: #d54941;
  color: #ffffff;
  font-size: 14px;
  line-height: 14px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.action-images {
  padding-left: 28px;
}
</style>
