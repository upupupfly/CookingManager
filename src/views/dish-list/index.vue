<script setup lang="ts">
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { ButtonProps } from 'tdesign-vue-next';
import { reactive, ref, onMounted, createVNode } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { listDishes, deleteDish, getDish } from '@/services/dish'
import type { DishListItem, DishListParams } from '@/types/api'
import type { DishStatus, DishContent } from '@/types/domain'
import StatusTag from '@/components/StatusTag.vue'
import PublishDialog from '@/components/PublishDialog.vue'
import { formatDuration } from '@/utils/format'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/utils/constants'

const router = useRouter()
const route = useRoute()

// 筛选
const filter = reactive({
  status: null as null | DishStatus,
  category: null as null | string,
  difficulty: null as null | 'easy' | 'medium' | 'hard',
  q: ''
})

// 筛选项（数组方式，含「全部」= null，默认选中「全部」）
const statusOptions = [
  { label: '全部', value: null },
  { label: '未发布', value: 'draft' },
  { label: '已发布', value: 'published' }
]
const categoryOptions = [
  { label: '全部', value: null },
  ...CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))
]
const difficultyOptions = [
  { label: '全部', value: null },
  ...DIFFICULTY_OPTIONS.map((d) => ({ label: d.label, value: d.value }))
]

// 列表
const items = ref<DishListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(true)
const loadError = ref(false)

// 发布弹层
const publishVisible = ref(false)
const publishDishId = ref('')
const publishBaseRev = ref(0)
const publishContent = ref<DishContent | null>(null)

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const params: DishListParams = { page: page.value, page_size: pageSize.value }
    if (filter.status) params.status = filter.status
    if (filter.category) params.category = filter.category
    if (filter.difficulty) params.difficulty = filter.difficulty
    if (filter.q.trim()) params.q = filter.q.trim()
    const res = await listDishes(params)
    items.value = res.items
    total.value = res.total
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const renderIcon: ButtonProps['icon'] = () => {
  return createVNode(SearchIcon)
};

function onSearch() {
  page.value = 1
  load()
}
function onReset() {
  filter.status = null
  filter.category = null
  filter.difficulty = null
  filter.q = ''
  page.value = 1
  load()
}
function onPageChange(p: number) {
  page.value = p
  load()
}
function onPageSizeChange(v: number) {
  pageSize.value = v
  page.value = 1
  load()
}

// 操作
function onCreate() {
  router.push('/dishes/new')
}
function onEdit(item: DishListItem) {
  router.push(`/dishes/${item.dish_id}/edit`)
}
async function onPublish(item: DishListItem) {
  try {
    const res = await getDish(item.dish_id)
    publishDishId.value = item.dish_id
    publishBaseRev.value = res.draft.rev
    publishContent.value = res.draft.content
    publishVisible.value = true
  } catch (e) {
    MessagePlugin.error((e as { message?: string })?.message || '加载失败')
  }
}
function onPublished() {
  publishVisible.value = false
  MessagePlugin.success('发布成功')
  load()
}
function onPublishFix(section: string) {
  publishVisible.value = false
  router.push({ path: `/dishes/${publishDishId.value}/edit`, query: { section } })
}
function onDelete(item: DishListItem) {
  DialogPlugin.confirm({
    header: `删除「${item.name || '未命名菜品'}」？`,
    body: '删除后列表不再显示这道菜；线上版本与待发布草稿会一起删除；页面上无法恢复，也没有回收站。',
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'danger',
    onConfirm: () => confirmDelete(item)
  })
}
async function confirmDelete(item: DishListItem) {
  try {
    await deleteDish(item.dish_id)
    MessagePlugin.success('已删除')
    load()
  } catch (e) {
    MessagePlugin.error((e as { message?: string })?.message || '删除失败')
    throw e
  }
}

function difficultyLabel(v: string) {
  return DIFFICULTY_OPTIONS.find((o) => o.value === v)?.label ?? v
}

// TDesign Table 列定义
const columns = [
  { colKey: 'cover', title: '封面', width: 88 },
  { colKey: 'name', title: '菜品名称', minWidth: 400 },
  { colKey: 'category', title: '分类', width: 96 },
  { colKey: 'difficulty', title: '难度', width: 88 },
  { colKey: 'duration', title: '预估时长', width: 112 },
  { colKey: 'status', title: '状态', width: 112 },
  { colKey: 'operation', title: '操作', width: 300 }
]

const pageSizeOptions = [10, 20, 50]

onMounted(() => {
  const q = route.query
  if (q.status === 'draft' || q.status === 'published') filter.status = q.status
  if (typeof q.category === 'string') filter.category = q.category
  if (typeof q.difficulty === 'string') filter.difficulty = q.difficulty as 'easy' | 'medium' | 'hard'
  if (typeof q.q === 'string') filter.q = q.q
  load()
})
</script>

<template>
  <div class="dish-list-page">
    <div class="page-card">
      <!-- 筛选卡（全部 TDesign 组件） -->
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <t-select v-model="filter.status" :options="statusOptions" :clearable="false" :style="{ width: '160px' }" />
          </div>
          <div class="filter-item">
            <span class="filter-label">分类</span>
            <t-select v-model="filter.category" :options="categoryOptions" :clearable="false" :style="{ width: '160px' }" />
          </div>
          <div class="filter-item">
            <span class="filter-label">难度</span>
            <t-select v-model="filter.difficulty" :options="difficultyOptions" :clearable="false" :style="{ width: '160px' }" />
          </div>
          <div class="filter-item">
            <span class="filter-label">关键词</span>
            <t-input v-model="filter.q" placeholder="按菜品名称搜索" :style="{ width: '280px' }" @enter="onSearch" />
          </div>
          <div class="filter-actions">
            <t-button theme="primary" :icon="renderIcon" @click="onSearch">查询</t-button>
            <t-button theme="default" variant="outline" @click="onReset">重置</t-button>
          </div>
        </div>
        <t-button theme="primary" @click="onCreate">
          <template #icon><add-icon /></template>
          新建菜品
        </t-button>
      </div>

      <!-- 表格：TDesign t-table -->
      <div class="table-area">
        <t-table
        :data="items"
        :columns="columns"
        row-key="dish_id"
        :loading="loading"
        :bordered="false"
        :hover="true"
        class="dish-table"
      >
        <template #cover="{ row }">
          <img v-if="row.cover_image" :src="row.cover_image" class="cover" alt="" />
          <span v-else class="cover-empty">无图</span>
        </template>
        <template #name="{ row }">
          <div class="name-cell">
            <span class="dish-name">{{ row.name }}</span>
            <t-tag v-if="row.has_unpublished_changes" theme="warning" variant="light" size="small">有未发布改动</t-tag>
            <t-tag v-if="!row.has_full_video" theme="warning" variant="light" size="small">缺整片</t-tag>
          </div>
        </template>
        <template #difficulty="{ row }">{{ difficultyLabel(row.difficulty) }}</template>
        <template #duration="{ row }">{{ formatDuration(row.total_duration_sec) }}</template>
        <template #status="{ row }">
          <StatusTag :status="row.status" />
        </template>
        <template #operation="{ row }">
          <div class="action-group">
            <t-button size="small" variant="outline" theme="default" @click="onEdit(row)">编辑</t-button>
            <t-button v-if="row.status === 'draft'" size="small" variant="outline" theme="primary" @click="onPublish(row)">发布</t-button>
            <t-button size="small" variant="outline" theme="danger" @click="onDelete(row)">删除</t-button>
          </div>
        </template>
        <template #empty>
          <div class="state-block">
            <template v-if="loadError">
              <span>没加载出来</span>
              <t-button size="small" theme="primary" variant="outline" @click="load">重试</t-button>
            </template>
            <span v-else>还没有菜品</span>
          </div>
        </template>
      </t-table>
      </div>

      <!-- 分页：TDesign t-pagination -->
      <div class="pagination-bar">
        <t-pagination
          :total="total"
          :current="page"
          :page-size="pageSize"
          :page-size-options="pageSizeOptions"
          show-page-size
          @current-change="onPageChange"
          @page-size-change="onPageSizeChange"
        />
      </div>
    </div>

    <PublishDialog
      v-if="publishContent"
      v-model="publishVisible"
      :dish-id="publishDishId"
      :base-rev="publishBaseRev"
      :content="publishContent!"
      @published="onPublished"
      @fix="onPublishFix"
    />
  </div>
</template>

<style scoped>
.dish-list-page {
  display: flex;
  width: 100%;
  height: 100%;
}
.page-card {
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.table-area {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
/* 筛选卡 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px;
  box-sizing: border-box;
  flex-shrink: 0;
}
.filter-left {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 24px;
}
.filter-label {
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.9);
  white-space: nowrap;
}
.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
/* 表格 */
.dish-table {
  padding: 0 15px 15px 15px;
}
.dish-table :deep(.t-table__th-cell) {
  background: #ffffff;
  color: rgba(0, 0, 0, 0.4);
  font-weight: 400;
}
.cover {
  width: 64px;
  height: 48px;
  border-radius: 2px;
  object-fit: cover;
  display: block;
}
.cover-empty {
  width: 64px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f3f3;
  border-radius: 2px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dish-name {
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.9);
}
.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.state-block {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
}
/* 分页 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
  flex-shrink: 0;
}
.total-text {
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}
</style>
