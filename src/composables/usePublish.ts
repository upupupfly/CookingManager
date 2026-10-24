import { ref } from 'vue'
import { publishDish } from '@/services/dish'
import type { ApiError, ValidationItem, PublishResponse, PublishBlockedDetails } from '@/types/api'

// 发布两段式结果（B4 弹层消费）
export type PublishResult =
  | { kind: 'success'; data: PublishResponse }
  | { kind: 'blocked'; blocking: ValidationItem[]; warnings: ValidationItem[] }
  | { kind: 'warnings-only'; warnings: ValidationItem[] }
  | { kind: 'error'; code: string; message: string }

export function usePublish() {
  const publishing = ref(false)

  async function publish(dishId: string, baseRev: number, acknowledge = false): Promise<PublishResult> {
    publishing.value = true
    try {
      const data = await publishDish(dishId, { base_rev: baseRev, acknowledge_warnings: acknowledge })
      return { kind: 'success', data }
    } catch (e) {
      const err = e as ApiError
      if (err.code === 'PUBLISH_BLOCKED') {
        const d = err.details as PublishBlockedDetails
        if (d.warnings_only) return { kind: 'warnings-only', warnings: d.warnings }
        return { kind: 'blocked', blocking: d.blocking, warnings: d.warnings }
      }
      return { kind: 'error', code: err.code, message: err.message || '发布失败' }
    } finally {
      publishing.value = false
    }
  }

  return { publishing, publish }
}
