import { describe, it, expect } from 'vitest'
import { formatDuration, formatTimecode, formatClock } from './format'

describe('formatDuration', () => {
  it('≥60分钟折算小时', () => {
    expect(formatDuration(14400)).toBe('4 小时')
  })
  it('1~60分钟显示分钟', () => {
    expect(formatDuration(3300)).toBe('55 分钟')
    expect(formatDuration(1200)).toBe('20 分钟')
  })
  it('<1分钟显示秒', () => {
    expect(formatDuration(30)).toBe('30 秒')
  })
  it('0显示0秒', () => {
    expect(formatDuration(0)).toBe('0 秒')
  })
})

describe('formatTimecode', () => {
  it('mm:ss.s', () => {
    expect(formatTimecode(62)).toBe('01:02.0')
  })
})

describe('formatClock', () => {
  it('返回 HH:mm 格式', () => {
    expect(formatClock('2026-10-17T14:32:05+08:00')).toMatch(/^\d{2}:\d{2}$/)
  })
  it('空串返回空', () => {
    expect(formatClock('')).toBe('')
  })
})
