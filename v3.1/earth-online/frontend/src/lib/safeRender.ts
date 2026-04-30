/**
 * safeRender — 通用安全渲染工具函数
 *
 * 将任意值安全地转换为可渲染的字符串，防止对象直接渲染导致的 [object Object] 或崩溃。
 * 适用于从后端获取的未知类型数据、动态内容等场景。
 */

/**
 * 将任意值安全地转换为字符串
 * @param val - 任意值
 * @param fallback - 当值无效时的回退字符串，默认为空字符串
 * @returns 安全的字符串，可直接用于 JSX 渲染
 */
export function safeRender(val: unknown, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '是' : '否';
  // 拒绝对象和数组，返回 fallback
  if (typeof val === 'object') return fallback;
  // 其他类型（如 function, symbol）
  try {
    const str = String(val);
    return str === '[object Object]' ? fallback : str;
  } catch {
    return fallback;
  }
}

/**
 * 将任意值安全地转换为数字
 * @param val - 任意值
 * @param fallback - 当值无效时的回退数字，默认为 0
 * @returns 安全的数字
 */
export function safeNumber(val: unknown, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : fallback;
  }
  if (typeof val === 'string') {
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (typeof val === 'boolean') {
    return val ? 1 : 0;
  }
  return fallback;
}

/**
 * 验证值是否为安全的可渲染类型（字符串或数字）
 * @param val - 任意值
 * @returns 如果是字符串或数字则返回 true
 */
export function isSafeRenderable(val: unknown): val is string | number {
  return typeof val === 'string' || typeof val === 'number';
}

/**
 * 安全地渲染对象中的值，确保只返回字符串或数字
 * @param val - 任意值
 * @param fallback - 当值无效时的回退字符串，默认为空字符串
 * @returns 安全的字符串或数字
 */
export function safeRenderValue(val: unknown, fallback: string | number = ''): string | number {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'boolean') return val ? '是' : '否';
  if (val === null || val === undefined) return fallback;
  // 拒绝对象和数组
  if (typeof val === 'object') return fallback;
  return fallback;
}
