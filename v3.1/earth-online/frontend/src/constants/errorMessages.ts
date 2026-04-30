/**
 * Error messages mapping
 * Provides user-friendly localized messages for each error type.
 */

import type { ApiErrorType } from '@/api/client';

interface ErrorMessageMap {
  title: string;
  message: string;
  suggestion?: string;
}

export const ERROR_MESSAGES: Record<ApiErrorType, ErrorMessageMap> = {
  network: {
    title: '网络连接失败',
    message: '无法连接到服务器，请检查网络连接',
    suggestion: '尝试刷新页面或稍后再试',
  },
  timeout: {
    title: '请求超时',
    message: '服务器响应时间过长，请求已超时',
    suggestion: '请检查网络连接或稍后重试',
  },
  auth: {
    title: '登录验证失败',
    message: '您的登录凭证无效或已过期',
    suggestion: '请重新登录',
  },
  validation: {
    title: '输入验证失败',
    message: '请检查您的输入是否符合要求',
  },
  rate_limit: {
    title: '请求过于频繁',
    message: '您的操作太频繁了，请稍后再试',
    suggestion: '请等待1分钟后再尝试',
  },
  server: {
    title: '服务器错误',
    message: '服务器遇到了问题，请稍后再试',
    suggestion: '如果问题持续存在，请联系管理员',
  },
  unknown: {
    title: '未知错误',
    message: '遇到了一个未知的错误',
    suggestion: '请刷新页面重试',
  },
};

export function getErrorMessage(errorType: ApiErrorType): ErrorMessageMap {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.unknown;
}

export function formatApiError(error: { type: ApiErrorType; message?: string }): { title: string; message: string; suggestion?: string } {
  const defaultMsg = getErrorMessage(error.type);
  return {
    title: defaultMsg.title,
    message: error.message || defaultMsg.message,
    suggestion: defaultMsg.suggestion,
  };
}
