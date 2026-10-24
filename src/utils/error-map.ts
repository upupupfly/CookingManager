// 错误码 → 文案集中映射（页面不散落 if-else）
// 依据接口契约 v1.0 §6 错误码总表
export const errorMap: Record<string, string> = {
  STRUCTURE_INVALID: '数据格式不正确，请检查填写内容',
  MISSING_BASE_REV: '缺少版本号',
  INVALID_QUERY: '筛选条件不正确',
  UNAUTHENTICATED: '登录已失效，请重试',
  DISH_NOT_FOUND: '这道菜不存在',
  DISH_DELETED: '这道菜已删除',
  REV_CONFLICT: '这份菜品已被其他会话修改，你的改动没有保存',
  PUBLISH_REV_CONFLICT: '内容已更新，请重新发布',
  DRAFT_NOT_READY: '草稿尚未就绪，请重试',
  PAYLOAD_TOO_LARGE: '内容过大',
  SAVE_FAILED: '保存失败',
  PUBLISH_FAILED: '没发布成功，重试',
  LIST_FAILED: '没加载出来'
}
