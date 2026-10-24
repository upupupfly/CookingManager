<script setup lang="ts">
// C-05 图片上传器：多图 ≤ max（默认 9），每图可加说明，可删。
// 上传思路：先传对象存储拿地址，再存业务端。当前无对象存储，先用本地 object URL 预览（占位）。
// 视觉对齐 MasterGo「单步编辑弹窗」：缩略图 144×108、说明输入 144、虚线上传块 144×108
import { ref } from 'vue'
import type { ActionImage } from '@/types/domain'

const props = withDefaults(
  defineProps<{
    modelValue: ActionImage[]
    max?: number
  }>(),
  { max: 9 }
)

const emit = defineEmits<{ (e: 'update:modelValue', value: ActionImage[]): void }>()

const fileInput = ref<HTMLInputElement>()

function onPick() {
  fileInput.value?.click()
}

function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return
  const remain = props.max - props.modelValue.length
  if (remain <= 0) return
  const added: ActionImage[] = Array.from(files)
    .slice(0, remain)
    .map((f) => ({ url: URL.createObjectURL(f), note: null }))
  if (added.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...added])
  }
  input.value = ''
}

function onRemove(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function onNoteChange(index: number, value: unknown) {
  const next = props.modelValue.map((img, i) =>
    i === index ? { ...img, note: value == null ? null : String(value) } : img
  )
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="image-uploader">
    <div v-for="(img, index) in modelValue" :key="index" class="img-item">
      <div class="thumb-wrap">
        <img :src="img.url" class="thumb" alt="" />
        <button type="button" class="remove" aria-label="删除图片" @click="onRemove(index)">×</button>
      </div>
      <t-input
        :value="img.note ?? ''"
        class="note-input"
        placeholder="图片说明"
        @change="onNoteChange(index, $event)"
      />
    </div>

    <div v-if="modelValue.length < max" class="upload-item">
      <button type="button" class="upload-box" @click="onPick">
        <t-icon name="add" size="24px" />
        <span class="upload-text">点击上传图片</span>
      </button>
      <span class="upload-count">已上传 {{ modelValue.length }}/{{ max }}</span>
    </div>

    <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFiles" />
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.img-item {
  width: 144px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.thumb-wrap {
  position: relative;
  width: 144px;
  height: 108px;
}
.thumb {
  width: 144px;
  height: 108px;
  object-fit: cover;
  border-radius: 3px;
  display: block;
}
.remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  line-height: 20px;
  text-align: center;
  padding: 0;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s;
}
.thumb-wrap:hover .remove,
.thumb-wrap:focus-within .remove {
  opacity: 1;
}
.note-input {
  width: 144px;
}
.upload-item {
  width: 144px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.upload-box {
  width: 144px;
  height: 108px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background: #eeeeee;
  border: 1px dotted #dcdcdc;
  color: rgba(0, 0, 0, 0.81);
  cursor: pointer;
}
.upload-text {
  width: 88px;
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.4);
  text-align: center;
}
.upload-count {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.4);
}
</style>
