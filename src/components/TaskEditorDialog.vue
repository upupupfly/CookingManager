<script setup lang="ts">
// B2.4 单步编辑弹窗：编辑本地副本，保存时校验通过后才提交到表单数据
// 视觉对齐 MasterGo「单步编辑弹窗」(layer 62:11102)：760 宽 / 24-32 内边距 / 100px 标签列
import { ref, computed, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { validateTask } from '@/utils/validate'
import { formatTimecode } from '@/utils/format'
import ActionRow from './ActionRow.vue'
import StageSelector from './StageSelector.vue'
import SuggestInput from './SuggestInput.vue'
import type { Task } from '@/types/domain'

const props = defineProps<{
  modelValue: boolean
  task: Task
  suggestions?: string[]
  /** 标题「第 x/y 步」的当前序号；缺省回退到 task.order_index */
  stepIndex?: number
  /** 标题「第 x/y 步」的步骤总数；缺省时标题只显示「第 x 步」 */
  stepTotal?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', task: Task): void
}>()

function cloneTask(t: Task): Task {
  return JSON.parse(JSON.stringify(t)) as Task
}

const draft = ref<Task>(cloneTask(props.task))

const stepMinutes = computed({
  get: () => Math.round((draft.value.time?.active_duration_sec || 0) / 60),
  set: (v: number) => {
    draft.value.time.active_duration_sec = (v || 0) * 60
  }
})

// 标题：正在编辑：第 2/4 步 · 热锅下油
const stepNo = computed(() => props.stepIndex ?? draft.value.order_index)
const heading = computed(() => {
  const step = props.stepTotal ? `第 ${stepNo.value}/${props.stepTotal} 步` : `第 ${stepNo.value} 步`
  return `正在编辑：${step} · ${draft.value.title || '未命名步骤'}`
})
const titleLength = computed(() => draft.value.title.length)

// 视频片段为只读展示；打点入口属 B3 页面，本轮不在这里提供跳转
const videoRange = computed(() => {
  const v = draft.value.video
  if (!v || v.start_sec == null || v.end_sec == null) return ''
  return `${formatTimecode(v.start_sec)} – ${formatTimecode(v.end_sec)}`
})

// 打开时从原任务克隆到本地副本
watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      draft.value = cloneTask(props.task)
    }
  }
)

function addAction() {
  draft.value.actions.push({ text: '', images: [] })
}
function removeAction(index: number) {
  draft.value.actions.splice(index, 1)
}
function addInput() {
  draft.value.inputs.push({ name: '', amount: '' })
}
function removeInput(index: number) {
  draft.value.inputs.splice(index, 1)
}

function close() {
  emit('update:modelValue', false)
}

function onSave() {
  // 校验一次只提示第一条：validateTask 按字段顺序返回，第一条即最靠上的待修正字段
  const list = validateTask(draft.value)
  if (list.length > 0) {
    // 先关掉已有消息，保证连续点击「保存」时屏幕上始终只有一条
    MessagePlugin.closeAll()
    MessagePlugin.error(list[0].message)
    return
  }
  emit('save', cloneTask(draft.value))
  close()
}
</script>

<template>
  <t-dialog
    :visible="modelValue"
    :header="false"
    :footer="false"
    :close-btn="false"
    :width="760"
    placement="center"
    class="task-editor-dialog"
    @close="close"
  >
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">{{ heading }}</span>
        <button type="button" class="modal-close" aria-label="关闭" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- 步骤标题 -->
        <div class="field-row">
          <div class="field-label">
            <span class="label-text">步骤标题</span>
            <span class="label-star">*</span>
          </div>
          <t-input
            v-model="draft.title"
            class="title-input"
            placeholder="请输入步骤标题"
            :maxlength="20"
          />
          <span class="char-count">{{ titleLength }}/20 字</span>
        </div>

        <!-- 单步动作 -->
        <div class="field-row field-row-top">
          <div class="field-label">
            <span class="label-text">单步动作</span>
            <span class="label-star">*</span>
          </div>
          <div class="action-list">
            <ActionRow
              v-for="(a, i) in draft.actions"
              :key="i"
              :action="a"
              :index="i"
              @remove="removeAction(i)"
            />
            <div class="add-action-row" :class="{ 'is-tight': draft.actions.length > 0 }">
              <t-button size="small" variant="text" theme="default" @click="addAction">
                ＋ 添加动作
              </t-button>
            </div>
          </div>
        </div>

        <!-- 本步用料 -->
        <div class="field-row field-row-top">
          <div class="field-label">
            <span class="label-text">本步用料</span>
            <span class="label-star">*</span>
          </div>
          <div class="input-list">
            <div v-for="(inp, i) in draft.inputs" :key="i" class="input-row">
              <!-- 行首删除：与菜品编辑页「材料清单」.del-btn 完全一致的圆形图标按钮 -->
              <button type="button" class="del-btn" aria-label="删除用料" @click="removeInput(i)">
                −
              </button>
              <SuggestInput
                v-model="inp.name"
                :suggestions="suggestions"
                placeholder="材料名称"
                class="input-name"
              />
              <t-input v-model="inp.amount" placeholder="用量" class="input-amount" />
            </div>
            <div class="add-action-row">
              <t-button size="small" variant="text" theme="default" @click="addInput">
                ＋ 添加材料
              </t-button>
            </div>
          </div>
        </div>

        <!-- 阶段 -->
        <div class="field-row">
          <div class="field-label">
            <span class="label-text">阶段 stage</span>
            <span class="label-star">*</span>
          </div>
          <StageSelector v-model="draft.stage" />
        </div>

        <!-- 预估时长 -->
        <div class="field-row">
          <div class="field-label">
            <span class="label-text">预估时长</span>
            <span class="label-star">*</span>
          </div>
          <t-input-number v-model="stepMinutes" theme="row" :min="0" class="field-number" />
          <span class="unit-text">分钟</span>
        </div>

        <!-- 视频片段（只读） -->
        <div v-if="videoRange" class="field-row">
          <div class="field-label">
            <span class="label-text">视频片段</span>
          </div>
          <div class="video-interval">{{ videoRange }}</div>
        </div>

        <!-- 成功提示 -->
        <div class="field-row field-row-top">
          <div class="field-label">
            <span class="label-text">成功提示</span>
          </div>
          <t-textarea
            v-model="draft.success_criteria"
            class="filled hint-textarea"
            placeholder="成功判据（选填）"
          />
        </div>

        <!-- 避坑提示 -->
        <div class="field-row field-row-top">
          <div class="field-label">
            <span class="label-text">避坑提示</span>
          </div>
          <t-textarea
            v-model="draft.pitfalls"
            class="filled hint-textarea"
            placeholder="避坑提示（选填）"
          />
        </div>

        <!-- 校验失败不再内联展示：一次只弹一条 Message -->
      </div>

      <div class="modal-footer">
        <t-button variant="outline" @click="close">取消</t-button>
        <t-button theme="primary" @click="onSave">保存</t-button>
      </div>
    </div>
  </t-dialog>
</template>

<style>
/* 弹窗本体：设计稿 padding 24/32、1px #DCDCDC 描边、9px 圆角；
   TDesign 默认的 24/24 外内边距与 body 16px 上下内边距需清零 */
.task-editor-dialog .t-dialog {
  padding: 0;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 9px;
  /* 高度保护：视口不足时由表单区内部滚动，避免弹窗顶出屏幕。
     TDesign 居中容器自带上下各 48px 内边距，故按 96px 扣减 */
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 96px);
  overflow: hidden;
}
.task-editor-dialog .t-dialog__body {
  padding: 0;
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>

<style scoped>
.modal {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 24px 32px;
  box-sizing: border-box;
}

/* 头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}
.modal-close {
  width: 28px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  line-height: 17px;
  cursor: pointer;
}
.modal-close:hover {
  background: #f8f8f8;
}

/* 表单区 */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.field-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.field-row-top {
  align-items: flex-start;
}
.field-label {
  width: 100px;
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 2px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.6);
}
.label-star {
  color: #d54941;
  font-size: 14px;
  line-height: 17px;
}

.title-input {
  width: 320px;
  flex: none;
}
.char-count {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.4);
}

/* 动作 / 用料列表 */
.action-list,
.input-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.input-list {
  gap: 8px;
}
.add-action-row {
  display: flex;
}
.add-action-row.is-tight {
  margin-top: -8px;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-name {
  width: 240px;
  flex: none;
}
.input-amount {
  width: 120px;
  flex: none;
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

/* 预估时长 / 视频片段 */
.field-number {
  width: 144px;
  flex: none;
  border-radius: 3px;
}
.field-number :deep(.t-input__inner) {
  background: transparent;
}
.unit-text {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.6);
}
.video-interval {
  width: 220px;
  height: 32px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  border-radius: 3px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.9);
}

/* 成功 / 避坑 */
.hint-textarea {
  width: 420px;
  flex: none;
}

/* 成功 / 避坑文本域的字体与高度（均为白底正常态，与设计图一致） */
.filled :deep(.t-textarea__inner) {
  font-size: 14px;
  line-height: 22px;
}
.hint-textarea :deep(.t-textarea__inner) {
  height: 54px;
  min-height: 54px;
  padding: 6px 12px;
}

/* 底部操作 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
}
</style>
