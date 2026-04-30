/**
 * 统一日期时间格式化
 */

export function formatDate(dateStr: string | null | undefined, format: 'datetime' | 'date' | 'time' | 'relative' = 'datetime'): string {
  if (!dateStr) return '—';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  
  const now = new Date();
  
  if (format === 'relative') {
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHr < 24) return `${diffHr}小时前`;
    if (diffDay < 7) return `${diffDay}天前`;
  }
  
  const zhLocale = 'zh-CN';
  
  if (format === 'date') {
    return date.toLocaleDateString(zhLocale, { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  
  if (format === 'time') {
    return date.toLocaleTimeString(zhLocale, { hour: '2-digit', minute: '2-digit' });
  }
  
  // datetime
  return date.toLocaleString(zhLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDateTimeShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
