<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import type { UploadFile } from 'tdesign-vue-next'
import draggable from 'vuedraggable'
import { useDishDraft } from '@/composables/useDishDraft'
import { createDish } from '@/services/dish'
import type { Ingredient, IngredientCategory, Task } from '@/types/domain'
import SaveStatusIndicator from '@/components/SaveStatusIndicator.vue'
import PublishDialog from '@/components/PublishDialog.vue'
import TaskEditorDialog from '@/components/TaskEditorDialog.vue'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS, STAGE_OPTIONS } from '@/utils/constants'

const router = useRouter()
const route = useRoute()

const {
  content,
  status,
  hasUnpublishedChanges,
  saveState,
  savedAt,
  dirty,
  loading,
  loadError,
  dishId,
  rev,
  load,
  startCreate,
  doSave,
  markDirty
} = useDishDraft()

// —— 标题：新增=「新增菜品」；编辑=进入时的原菜名（固定，不随编辑变化）——
const originalName = ref('')
const pageTitle = computed(() => originalName.value || '新增菜品')

const activeSection = ref('b2-1')
const sections = [
  { key: 'b2-1', label: '基本信息' },
  { key: 'b2-2', label: '材料清单' },
  { key: 'b2-3', label: '步骤编排' }
]
const SECTION_TO_ANCHOR: Record<string, string> = {
  'B2.1': 'b2-1',
  'B2.2': 'b2-2',
  'B2.3': 'b2-3',
  'B2.4': 'b2-3',
  'B2.5': 'b2-3',
  'B2.6': 'b2-1'
}

const publishVisible = ref(false)
const publishBaseRev = ref(0)
const editVisible = ref(false)
const editingTask = ref<Task | null>(null)

// 单步编辑弹窗标题「正在编辑：第 x/y 步 · 标题」
const editingStepNo = computed(() => {
  if (!editingTask.value) return 0
  return content.value.tasks.findIndex((t) => t.id === editingTask.value!.id) + 1
})
const taskCount = computed(() => content.value.tasks.length)

// 选项（数组方式）
const categoryOptions = CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))
const difficultyOptions = DIFFICULTY_OPTIONS.map((d) => ({ label: d.label, value: d.value }))
const ingredientCategories: IngredientCategory[] = ['主料', '辅料', '调料', '工具']

// 总时长（分钟 ↔ 秒）
const totalMinutes = computed({
  get: () => Math.round(content.value.time.total_duration_sec / 60),
  set: (v: number) => {
    content.value.time.total_duration_sec = (v || 0) * 60
  }
})

// 材料
function ingredientsOf(cat: IngredientCategory): Ingredient[] {
  return content.value.ingredients.filter((i) => i.category === cat)
}
function addIngredient(cat: IngredientCategory) {
  content.value.ingredients.push({ name: '', amount: '', category: cat, lead_time_desc: '', lead_time_sec: 0 })
}
function removeIngredient(ing: Ingredient) {
  const idx = content.value.ingredients.indexOf(ing)
  if (idx >= 0) content.value.ingredients.splice(idx, 1)
}
function leadOn(ing: Ingredient) {
  return ing.lead_time_sec > 0 || !!ing.lead_time_desc
}
function setLead(ing: Ingredient, on: boolean) {
  if (!on) {
    ing.lead_time_desc = ''
    ing.lead_time_sec = 0
  }
}
function leadMinutes(ing: Ingredient) {
  return Math.round(ing.lead_time_sec / 60)
}
function setLeadMinutes(ing: Ingredient, v: number) {
  ing.lead_time_sec = (v || 0) * 60
}

// 步骤
function newTask(stage: Task['stage'] = 'onsite_prep'): Task {
  return {
    id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    stage,
    order_index: content.value.tasks.length + 1,
    title: '',
    actions: [],
    video: { has_video: false },
    inputs: [],
    time: { active_duration_sec: 0 },
    success_criteria: '',
    pitfalls: '',
    requires_completion: false
  }
}
function addTask() {
  content.value.tasks.push(newTask())
  renumberTasks()
}
function insertTask(index: number) {
  content.value.tasks.splice(index + 1, 0, newTask())
  renumberTasks()
}
function removeTask(index: number) {
  content.value.tasks.splice(index, 1)
  renumberTasks()
}
function renumberTasks() {
  content.value.tasks.forEach((t, i) => {
    t.order_index = i + 1
  })
}
function onDragEnd() {
  renumberTasks()
  markDirty()
}
function stageLabel(v: string) {
  return STAGE_OPTIONS.find((o) => o.value === v)?.label ?? v
}
function stageTheme(v: string) {
  return STAGE_OPTIONS.find((o) => o.value === v)?.theme ?? 'default'
}
function stepSummary(t: Task) {
  const imgCount = t.actions.reduce((n, a) => n + a.images.length, 0)
  return `动作 ${t.actions.length} 条 · 用料 ${t.inputs.length} 项 · 图 ${imgCount} 张 · ${t.video.has_video ? '有视频' : '无视频'}`
}

function onEditTask(task: Task) {
  editingTask.value = task
  editVisible.value = true
}
function onTaskSave(edited: Task) {
  if (!editingTask.value) return
  const idx = content.value.tasks.findIndex((t) => t.id === editingTask.value!.id)
  if (idx >= 0) content.value.tasks[idx] = edited
  markDirty()
}

// 封面 / 视频上传：统一走 TDesign t-upload（主题 image，auto-upload=false 本地先预览）
const coverFiles = ref<UploadFile[]>([])
const videoFiles = ref<UploadFile[]>([])
function onCoverChange(files: UploadFile[], context: { trigger: string }) {
  if (context.trigger === 'add' && files[0]?.raw) {
    content.value.cover_image = URL.createObjectURL(files[0].raw as File)
  }
}

// 用隐藏 <video> 读取视频元数据，取时长（秒）
function probeVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const el = document.createElement('video')
    el.preload = 'metadata'
    let settled = false
    const done = (d: number) => {
      if (settled) return
      settled = true
      resolve(Number.isFinite(d) && d > 0 ? Math.round(d) : 0)
    }
    el.onloadedmetadata = () => {
      // 部分容器（如无索引 WebM）duration 为 Infinity，seek 到末尾再读
      if (el.duration === Infinity) {
        el.currentTime = 1e101
        el.ontimeupdate = () => {
          el.ontimeupdate = null
          el.currentTime = 0
          done(el.duration)
        }
      } else {
        done(el.duration)
      }
    }
    el.onerror = () => done(0)
    setTimeout(() => done(el.duration), 8000)
    el.src = url
  })
}

async function onVideoChange(files: UploadFile[], context: { trigger: string }) {
  if (context.trigger === 'add' && files[0]?.raw) {
    const url = URL.createObjectURL(files[0].raw as File)
    content.value.video.url = url
    content.value.video.duration_sec = await probeVideoDuration(url)
  }
}

const videoDurationText = computed(() => {
  const s = content.value.video.duration_sec
  if (!s) return ''
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

// 新增模式：/dishes/new
const isCreateMode = computed(() => route.name === 'dish-create' || route.params.dishId === 'new')

// 新增模式下首次保存/发布前先创建菜，拿到 id 后替换为编辑路由
async function ensureCreated(): Promise<boolean> {
  if (dishId.value) return true
  try {
    const res = await createDish()
    dishId.value = res.dish_id
    rev.value = res.rev
    router.replace(`/dishes/${res.dish_id}/edit`)
    return true
  } catch (e) {
    MessagePlugin.error((e as { message?: string })?.message || '新建失败')
    return false
  }
}

// 操作
async function onSave() {
  // 无改动时不创建空草稿：新增模式下「存草稿」只保存用户实际填写过的内容
  if (!dirty.value) {
    MessagePlugin.info(dishId.value ? '没有需要保存的改动' : '还没有需要保存的内容')
    return
  }
  if (!(await ensureCreated())) return
  await doSave()
}
async function onPreview() {
  if (!(await ensureCreated())) return
  if (dirty.value) {
    const ok = await doSave()
    if (!ok) {
      MessagePlugin.warning('请先保存再预览')
      return
    }
  }
  window.open(`/preview/${dishId.value}`, '_blank')
}
async function onPublish() {
  if (!(await ensureCreated())) return
  if (dirty.value) {
    const ok = await doSave()
    if (!ok) {
      MessagePlugin.warning('请先保存再发布')
      return
    }
  }
  publishBaseRev.value = rev.value
  publishVisible.value = true
}
function onPublished() {
  publishVisible.value = false
  MessagePlugin.success('发布成功')
  router.push('/dishes')
}
function onPublishFix(section: string) {
  const anchor = SECTION_TO_ANCHOR[section]
  if (anchor) scrollTo(anchor)
}
function onBack() {
  if (dirty.value) {
    const dialog = DialogPlugin.confirm({
      header: '有未保存的更改',
      body: '返回列表会丢失未保存的改动，建议先存草稿。',
      confirmBtn: '放弃并返回',
      cancelBtn: '留下',
      theme: 'warning',
      onConfirm: () => {
        router.push('/dishes')
        dialog.destroy()
      }
    })
    return
  }
  router.push('/dishes')
}
function scrollTo(key: string) {
  activeSection.value = key
  document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (dirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(async () => {
  if (isCreateMode.value) {
    startCreate()
    originalName.value = '' // 新增 → 标题固定「新增菜品」
  } else {
    const id = route.params.dishId as string
    await load(id)
    // 记录进入页面时的菜名；为空说明是“新增”
    originalName.value = content.value.name
  }
  window.addEventListener('beforeunload', onBeforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<template>
  <div class="dish-edit-page" :class="{ 'is-publishing': publishVisible }">
    <!-- 页头 -->
    <header class="page-header">
      <div class="header-left">
        <span class="dish-title">{{ pageTitle }}</span>
        <t-tag v-if="status === 'published'" theme="success" variant="light" size="small">已发布</t-tag>
        <t-tag v-else theme="warning" variant="light" size="small">未发布</t-tag>
        <t-tag v-if="hasUnpublishedChanges" theme="warning" variant="light" size="small">有未发布改动</t-tag>
        <SaveStatusIndicator :state="saveState" :saved-at="savedAt" @retry="doSave" />
      </div>
      <div class="header-actions">
        <t-button variant="outline" @click="onSave">存草稿</t-button>
        <t-button variant="outline" @click="onPreview">预览</t-button>
        <t-button theme="primary" size="large" @click="onPublish">发布</t-button>
        <t-button variant="text" @click="onBack">返回列表</t-button>
      </div>
    </header>

    <!-- 主体 -->
    <div class="page-body">
      <nav class="anchor-nav">
        <button
          v-for="s in sections"
          :key="s.key"
          type="button"
          class="anchor-item"
          :class="{ active: activeSection === s.key }"
          @click="scrollTo(s.key)"
        >
          <span class="anchor-bar" />
          <span class="anchor-text">{{ s.label }}</span>
        </button>
      </nav>

      <div class="sections">
        <div v-if="loading" class="loading-box">加载中…</div>
        <div v-else-if="loadError" class="error-box">没加载出来</div>
        <template v-else>
          <!-- 基本信息 -->
          <section id="b2-1" class="section">
            <h3 class="section-title">基本信息</h3>

            <div class="field-row">
              <span class="field-label">菜品名称 *</span>
              <t-input v-model="content.name" placeholder="请输入菜品名称" :style="{ width: '320px' }" />
            </div>

            <div class="field-row">
              <span class="field-label">分类 *</span>
              <t-select
                v-model="content.category"
                :options="categoryOptions"
                :clearable="false"
                :style="{ width: '200px' }"
              />
            </div>

            <div class="field-row">
              <span class="field-label">难度</span>
              <t-radio-group v-model="content.difficulty" :options="difficultyOptions" />
            </div>

            <div class="field-row">
              <span class="field-label">总时长 *</span>
              <t-input-number v-model="totalMinutes" :min="0" :style="{ width: '144px' }" />
              <span class="unit">分钟</span>
            </div>

            <div class="field-row">
              <span class="field-label">封面图</span>
              <t-upload
                v-model="coverFiles"
                :auto-upload="false"
                :max="1"
                accept="image/*"
                theme="image"
                :showImageFileName="false"
                class="upload-container"
                @change="onCoverChange"
              />
            </div>

            <div class="field-row">
              <span class="field-label">菜品视频</span>
              <div class="video-upload">
                <t-upload
                  v-model="videoFiles"
                  :auto-upload="false"
                  :max="1"
                  accept="video/*"
                  theme="image"
                  :showImageFileName="false"
                  :locale="{ triggerUploadText: { image: '点击上传视频' } }"
                  class="upload-container"
                  @change="onVideoChange"
                />
                <div class="video-meta">
                  <span class="video-hint">{{ videoDurationText }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 材料清单 -->
          <section id="b2-2" class="section">
            <h3 class="section-title">材料清单</h3>

            <div v-for="cat in ingredientCategories" :key="cat" class="ingredient-group">
              <div class="group-title">{{ cat }}</div>

              <div v-for="(ing, idx) in ingredientsOf(cat)" :key="idx" class="ingredient-row">
                <button type="button" class="del-btn" @click="removeIngredient(ing)">−</button>
                <t-input v-model="ing.name" placeholder="材料名称" :style="{ width: cat === '工具' ? '240px' : '240px' }" />
                <template v-if="cat !== '工具'">
                  <t-input v-model="ing.amount" placeholder="用量" :style="{ width: '120px' }" />
                  <div class="lead-toggle">
                    <t-switch :value="leadOn(ing)" size="small" @change="(v: boolean) => setLead(ing, v)" />
                    <span class="lead-label">需提前处理</span>
                  </div>
                  <template v-if="leadOn(ing)">
                    <t-input v-model="ing.lead_time_desc" placeholder="提前处理说明" :style="{ width: '350px' }" />
                    <t-input-number
                      :value="leadMinutes(ing)"
                      :min="0"
                      :style="{ width: '144px' }"
                      @change="(v: number) => setLeadMinutes(ing, v)"
                    />
                    <span class="unit">分钟</span>
                  </template>
                </template>
              </div>

              <div class="group-add">
                <t-button variant="text" size="small" @click="addIngredient(cat)">＋ 添加材料</t-button>
              </div>
            </div>
          </section>

          <!-- 步骤编排 -->
          <section id="b2-3" class="section">
            <h3 class="section-title">步骤编排</h3>

            <draggable
              v-model="content.tasks"
              item-key="id"
              ghost-class="ghost"
              :animation="200"
              class="step-list"
              @end="onDragEnd"
            >
              <template #item="{ element, index }">
                <div class="step-card">
                  <span class="drag-handle">⋮⋮</span>
                  <span class="step-index">第 {{ index + 1 }}/{{ content.tasks.length }} 步</span>
                  <span class="step-title">{{ element.title || '未命名步骤' }}</span>
                  <t-tag size="small" variant="light" :theme="stageTheme(element.stage)">
                    {{ stageLabel(element.stage) }}
                  </t-tag>
                  <span class="step-summary">{{ stepSummary(element) }}</span>
                  <div class="step-actions">
                    <t-button size="small" variant="text" @click="onEditTask(element)">编辑</t-button>
                    <t-button size="small" variant="text" @click="insertTask(index)">插入</t-button>
                    <t-button size="small" variant="text" theme="danger" @click="removeTask(index)">删除</t-button>
                  </div>
                </div>
              </template>
            </draggable>

            <t-button variant="text" size="small" class="add-task-btn" @click="addTask">＋ 新增步骤</t-button>
          </section>
        </template>
      </div>
    </div>

    <PublishDialog
      v-model="publishVisible"
      :dish-id="dishId"
      :base-rev="publishBaseRev"
      :content="content"
      @published="onPublished"
      @fix="onPublishFix"
    />
    <TaskEditorDialog
      v-if="editingTask"
      v-model="editVisible"
      :task="editingTask!"
      :step-index="editingStepNo"
      :step-total="taskCount"
      :suggestions="[]"
      @save="onTaskSave"
    />

    <!-- 发布期间锁住整页操作：遮罩在弹窗之下（弹窗 teleport 到 body），关掉弹窗才恢复编辑 -->
    <div v-if="publishVisible" class="publish-lock" aria-hidden="true" />
  </div>
</template>

<style scoped>
.dish-edit-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

/* 页头 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88px;
  padding: 0 32px;
  background: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}
.dish-title {
  font-size: 20px;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* 主体 */
.page-body {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  box-sizing: border-box;
}
.anchor-nav {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: sticky;
  top: 32px;
}
.anchor-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 16px;
  border: none;
  background: transparent;
  border-radius: 3px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
}
.anchor-item.active {
  background: #ffffff;
  color: #0052d9;
}
.anchor-bar {
  width: 2px;
  height: 16px;
  background: transparent;
  flex-shrink: 0;
}
.anchor-item.active .anchor-bar {
  background: #0052d9;
}

.sections {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.section {
  background: #ffffff;
  border-radius: 3px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.section-title {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.9);
}

/* 字段行 */
.field-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.field-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.6);
}
.unit {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.6);
}

/* 缩略图 */
.thumb,
.thumb-empty {
  width: 160px;
  height: 90px;
  border-radius: 2px;
  background: #f3f3f3;
  overflow: hidden;
  flex-shrink: 0;
}
.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}
.video-thumb-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.video-upload {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.upload-container :deep(.t-upload__card-container),
.upload-container :deep(.t-upload__card-content) {
  width: 160px;
  height: 120px;
}
.video-thumb {
  width: 160px;
  height: 90px;
  border-radius: 3px;
  object-fit: cover;
  background: #000;
  display: block;
}
.video-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.video-hint {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.4);
}

/* 材料 */
.ingredient-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.group-title {
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.9);
}
.ingredient-row {
  display: flex;
  align-items: center;
  gap: 8px;
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
.lead-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 120px;
  flex-shrink: 0;
}
.lead-label {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}
.group-add {
  display: flex;
  align-items: center;
}

/* 步骤 */
.step-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.step-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #e7e7e7;
  border-radius: 3px;
  box-sizing: border-box;
}
.drag-handle {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.4);
  cursor: grab;
  flex-shrink: 0;
}
.step-index {
  width: 72px;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.4);
}
.step-title {
  width: 180px;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.step-summary {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.step-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.ghost {
  opacity: 0.5;
  background: #f2f3ff;
}
.add-task-btn {
  width: 80px;
}

/* 状态块 */
.loading-box,
.error-box {
  padding: 48px 0;
  text-align: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
}

/* 发布期间：锁住页头与表单，避免与发布使用的 base_rev 冲突 */
.is-publishing .page-header,
.is-publishing .page-body {
  pointer-events: none;
  user-select: none;
}
.publish-lock {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}
</style>
