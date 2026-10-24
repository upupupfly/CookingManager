import { ref, watch } from 'vue'
import { getDish, saveDraft } from '@/services/dish'
import type { DishContent, Ingredient, DishStatus } from '@/types/domain'
import type { SaveState } from '@/stores/dish'

// 材料清单默认空数据：除「工具」外每类一条空数据
function emptyIngredients(): Ingredient[] {
  return [
    { name: '', amount: '', category: '主料', lead_time_desc: '', lead_time_sec: 0 },
    { name: '', amount: '', category: '辅料', lead_time_desc: '', lead_time_sec: 0 },
    { name: '', amount: '', category: '调料', lead_time_desc: '', lead_time_sec: 0 }
  ]
}

function emptyDish(): DishContent {
  return {
    name: '',
    cover_image: '',
    difficulty: 'easy',
    category: '炒菜',
    tags: [],
    intro: '',
    time: { total_duration_sec: 0 },
    video: { url: '', duration_sec: 0, source: 'self_shot', source_credit: '', source_url: '', content_match: 'high' },
    ingredients: emptyIngredients(),
    tasks: []
  }
}

function genUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function useDishDraft() {
  const dishId = ref('')
  const status = ref<DishStatus>('draft')
  const rev = ref(0)
  const savedAt = ref('')
  const hasUnpublishedChanges = ref(false)
  const saveState = ref<SaveState>('idle')
  const content = ref<DishContent>(emptyDish())
  const dirty = ref(false)
  const loading = ref(true)
  const loadError = ref(false)

  let loaded = false
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let saving = false
  // 内容变更序号：用于判断「保存请求飞行期间内容是否又被改过」
  let changeSeq = 0

  // 深度监听内容变化 → 标记脏 + 防抖自动保存
  watch(
    content,
    () => {
      if (!loaded) return
      changeSeq++
      dirty.value = true
      scheduleSave(1500)
    },
    { deep: true }
  )

  async function load(id: string) {
    dishId.value = id
    loading.value = true
    loadError.value = false
    try {
      const res = await getDish(id)
      status.value = res.status
      rev.value = res.draft.rev
      savedAt.value = res.draft.saved_at ?? ''
      hasUnpublishedChanges.value = res.has_unpublished_changes
      loaded = false
      content.value = res.draft.content
      if (content.value.ingredients.length === 0) {
        content.value.ingredients = emptyIngredients()
      }
      setTimeout(() => {
        loaded = true
      }, 0)
      dirty.value = false
      saveState.value = savedAt.value ? 'saved' : 'idle'
    } catch {
      loadError.value = true
    } finally {
      loading.value = false
    }
  }

  // 新增模式：不请求详情，直接用空内容进入编辑态，等首次保存时再创建
  function startCreate() {
    dishId.value = ''
    status.value = 'draft'
    rev.value = 0
    savedAt.value = ''
    hasUnpublishedChanges.value = false
    content.value = emptyDish()
    dirty.value = false
    loading.value = false
    loadError.value = false
    saveState.value = 'idle'
    setTimeout(() => {
      loaded = true
    }, 0)
  }

  function scheduleSave(ms: number) {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void doSave()
    }, ms)
  }

  async function doSave(): Promise<boolean> {
    // 新增模式尚未创建菜品（dishId 为空）时不能发草稿请求：
    // 否则地址会变成 /dishes//draft，看起来保存成功但内容没落到任何菜品上，
    // 脏标记被清空后，首次点「存草稿」就不会再写入内容。
    // 这里直接跳过并保留 dirty，交由页面在首次保存时先创建菜品。
    if (!dishId.value) return false
    if (!dirty.value || saving) return false
    saving = true
    saveState.value = 'saving'
    const seqAtStart = changeSeq
    try {
      const res = await saveDraft(dishId.value, {
        base_rev: rev.value,
        request_id: genUuid(),
        content: JSON.parse(JSON.stringify(content.value)) as DishContent
      })
      rev.value = res.rev
      savedAt.value = res.saved_at
      hasUnpublishedChanges.value = res.has_unpublished_changes
      if (changeSeq !== seqAtStart) {
        // 请求飞行期间内容又被改过：不能清脏，尽快补存一次，否则这次编辑会永久丢失
        dirty.value = true
        saveState.value = 'saved'
        scheduleSave(300)
        return true
      }
      dirty.value = false
      saveState.value = 'saved'
      return true
    } catch (e) {
      const code = (e as { code?: string }).code
      saveState.value = code === 'REV_CONFLICT' ? 'conflict' : 'failed'
      return false
    } finally {
      saving = false
    }
  }

  function markDirty() {
    dirty.value = true
    scheduleSave(1500)
  }

  return {
    dishId,
    status,
    rev,
    savedAt,
    hasUnpublishedChanges,
    saveState,
    content,
    dirty,
    loading,
    loadError,
    load,
    startCreate,
    doSave,
    markDirty
  }
}
