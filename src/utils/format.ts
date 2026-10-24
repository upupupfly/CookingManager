// 时长换算（秒 → 展示文案）
// 数据规格 v1.9 §7.1：≥60分钟折算小时；1~60分钟显示分钟；<1分钟显示秒
export function formatDuration(sec: number): string {
  if (sec >= 3600) return `${Math.round(sec / 3600)} 小时`
  if (sec >= 60) return `${Math.round(sec / 60)} 分钟`
  if (sec > 0) return `${sec} 秒`
  return '0 秒'
}

// 时间码 mm:ss.s（B3 打点用，本轮只做展示）
export function formatTimecode(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toFixed(1)
  return `${String(m).padStart(2, '0')}:${s.padStart(4, '0')}`
}

// ISO 时间 → HH:mm（保存三态「已保存 · HH:mm」用）
export function formatClock(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}
