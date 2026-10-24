import { describe, it, expect } from 'vitest'
import { errorMap } from './error-map'

describe('errorMap', () => {
  it('保存/发布/列表失败码有文案', () => {
    expect(errorMap.SAVE_FAILED).toBeTruthy()
    expect(errorMap.PUBLISH_FAILED).toBeTruthy()
    expect(errorMap.LIST_FAILED).toBeTruthy()
  })
  it('409 冲突码有文案', () => {
    expect(errorMap.REV_CONFLICT).toBeTruthy()
    expect(errorMap.PUBLISH_REV_CONFLICT).toBeTruthy()
  })
})
