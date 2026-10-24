import { defineStore } from 'pinia'
import type { DishContent } from '@/types/domain'

// 保存三态（对应 UX-B C-22 SaveStatusIndicator）
export type SaveState = 'idle' | 'saving' | 'saved' | 'failed' | 'conflict' | 'offline'

// 当前编辑菜品的跨组件共享状态。
// B2 页内的草稿表单态、脏标记、写入队列由 useDishDraft composable 承载（页面开发轮实现），
// 本 store 只保留最少的跨分区共享字段。
export const useDishStore = defineStore('dish', {
  state: () => ({
    dishId: '',
    rev: 0,
    saveState: 'idle' as SaveState,
    savedAt: '',
    hasUnpublishedChanges: false
  }),
  actions: {
    openDish(dishId: string, rev: number, hasUnpublishedChanges: boolean) {
      this.dishId = dishId
      this.rev = rev
      this.hasUnpublishedChanges = hasUnpublishedChanges
      this.saveState = 'idle'
      this.savedAt = ''
    },
    setSaved(rev: number, savedAt: string, hasUnpublishedChanges: boolean) {
      this.rev = rev
      this.savedAt = savedAt
      this.hasUnpublishedChanges = hasUnpublishedChanges
      this.saveState = 'saved'
    },
    setSaveState(state: SaveState) {
      this.saveState = state
    },
    reset() {
      this.dishId = ''
      this.rev = 0
      this.saveState = 'idle'
      this.savedAt = ''
      this.hasUnpublishedChanges = false
    }
  }
})

export type { DishContent }
