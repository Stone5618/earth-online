/**
 * XSS防护工具函数
 * 用于清理用户输入内容，防止跨站脚本攻击
 */

/**
 * HTML字符实体映射
 */
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * 转义HTML特殊字符
 * @param input - 原始字符串
 * @returns 转义后的安全字符串
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  return input.replace(/[&<>"'`=\/]/g, char => htmlEntities[char] || char);
}

/**
 * 移除HTML标签
 * @param input - 可能包含HTML的字符串
 * @returns 纯文本字符串
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  // 移除所有HTML标签
  const withoutTags = input.replace(/<[^>]*>/g, '');
  // 转换HTML实体
  return withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * 安全的文本格式化（移除危险字符）
 * @param input - 用户输入文本
 * @returns 安全的文本
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  // 移除潜在危险字符
  const safe = input
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
  return safe;
}

/**
 * 安全的URL验证
 * @param url - 待验证的URL
 * @returns 是否为安全URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // 只允许http和https协议
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 安全的URL转换（防止javascript:等协议）
 * @param url - 原始URL
 * @returns 安全的URL，如果不安全则返回空字符串
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim().toLowerCase();
  
  // 阻止危险协议
  const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:', 'ftp:'];
  if (dangerousProtocols.some(protocol => trimmed.startsWith(protocol))) {
    return '';
  }
  
  // 如果没有协议，添加https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

/**
 * 验证用户名（字母、数字、下划线，3-20字符）
 * @param username - 用户名
 * @returns 是否有效
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}