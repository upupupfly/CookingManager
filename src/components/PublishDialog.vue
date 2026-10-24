<script setup lang="ts">
// B4 发布校验弹层：先前端校验（validateDish），通过后再调后端发布
import { ref, watch } from 'vue'
import { usePublish } from '@/composables/usePublish'
import { validateDish } from '@/utils/validate'
import { SECTION_LABELS } from '@/utils/constants'
import type { DishContent } from '@/types/domain'
import type { ValidationItem } from '@/types/api'

const props = defineProps<{
  modelValue: boolean
  dishId: string
  baseRev: number
  content: DishContent
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'published'): void
  (e: 'fix', section: string): void
}>()

const { publishing, publish } = usePublish()

const blocking = ref<ValidationItem[]>([])
const published = ref(false)
const errorMsg = ref('')

function close() {
  // 发布请求飞行期间不允许关闭，避免关掉弹窗后继续编辑、与发布用的 base_rev 打架
  if (publishing.value) return
  emit('update:modelValue', false)
}

function sectionLabel(s: string) {
  return SECTION_LABELS[s] || s
}

function onFix(item: ValidationItem) {
  emit('fix', item.section || '')
  close()
}

async function doPublish() {
  blocking.value = []
  published.value = false
  errorMsg.value = ''

  // 1. 前端先校验
  const frontErrors = validateDish(props.content)
  if (frontErrors.length > 0) {
    blocking.value = frontErrors
    return
  }

  // 2. 后端校验（发布）
  const res = await publish(props.dishId, props.baseRev)
  if (res.kind === 'blocked') {
    blocking.value = res.blocking
  } else if (res.kind === 'success') {
    published.value = true
    emit('published')
  } else if (res.kind === 'warnings-only') {
    const r2 = await publish(props.dishId, props.baseRev, true)
    if (r2.kind === 'success') {
      published.value = true
      emit('published')
    } else if (r2.kind === 'error') {
      errorMsg.value = r2.message
    }
  } else {
    errorMsg.value = res.message
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) void doPublish()
  }
)
</script>

<template>
  <t-dialog
    :visible="modelValue"
    header="发布校验"
    :width="680"
    :footer="false"
    :close-on-esc-keydown="!publishing"
    :close-on-overlay-click="!publishing"
    @close="close"
  >
    <div v-if="published" class="result success">发布成功，菜品已上线</div>
    <div v-else-if="errorMsg" class="result error">{{ errorMsg }}</div>
    <template v-else>
      <p v-if="publishing" class="hint">正在校验…</p>
      <div v-else-if="blocking.length > 0" class="blocking">
        <p class="hint">还有 {{ blocking.length }} 项不满足发布条件：</p>
        <div v-for="item in blocking" :key="item.code + (item.field || '')" class="item">
          <span class="item-msg">{{ item.message }}</span>
          <span class="item-section">{{ sectionLabel(item.section) }}</span>
          <t-button size="small" variant="text" theme="primary" @click="onFix(item)">去修</t-button>
        </div>
      </div>
      <p v-else class="hint">校验通过，正在发布…</p>
    </template>
  </t-dialog>
</template>

<style scoped>
.result {
  padding: 32px 0;
  text-align: center;
  font-size: 15px;
}
.result.success {
  color: #2ba471;
}
.result.error {
  color: #d54941;
}
.hint {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}
.blocking {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow: auto;
}
.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff0ed;
  border-radius: 3px;
}
.item-msg {
  flex: 1;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
}
.item-section {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}
</style>
