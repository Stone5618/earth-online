/**
 * Admin Error Handler Utilities
 *
 * Specialized error handling for admin dashboard operations.
 */

import { toast } from 'sonner';
import adminApi from '@/admin/api/adminApi';

export interface AdminError {
  message: string;
  statusCode?: number;
  details?: any;
}

/**
 * Formats API errors for admin panel display
 */
export function formatAdminError(error: any): AdminError {
  if (!error) {
    return { message: '发生未知错误' };
  }

  if (error.response) {
    const { data, status } = error.response;
    
    if (data && data.detail) {
      return {
        message: data.detail,
        statusCode: status,
        details: data,
      };
    }
    
    if (data && data.message) {
      return {
        message: data.message,
        statusCode: status,
        details: data,
      };
    }
    
    const statusMessages: Record<number, string> = {
      400: '请求参数无效',
      401: '未授权，请重新登录',
      403: '没有执行此操作的权限',
      404: '请求的资源不存在',
      409: '数据冲突',
      422: '数据验证失败',
      429: '请求过于频繁，请稍后再试',
      500: '服务器内部错误',
      503: '服务暂时不可用',
    };
    
    return {
      message: statusMessages[status] || `请求失败 (${status})`,
      statusCode: status,
      details: data,
    };
  }

  if (error.message) {
    return { message: error.message };
  }

  return { message: '发生未知错误，请稍后再试' };
}

/**
 * Shows a user-friendly error toast
 */
export function showAdminErrorToast(error: any, fallback?: string) {
  const formatted = formatAdminError(error);
  toast.error(formatted.message);
  console.error('[Admin Error]', error);
}

/**
 * Shows a success toast
 */
export function showAdminSuccessToast(message: string) {
  toast.success(message);
}

/**
 * Wraps async admin operations with error handling
 */
export async function withAdminErrorHandler<T>(
  operation: () => Promise<T>,
  options?: {
    successMessage?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: AdminError) => void;
    suppressError?: boolean;
  }
): Promise<T | null> {
  try {
    const result = await operation();
    if (options?.successMessage) {
      showAdminSuccessToast(options.successMessage);
    }
    if (options?.onSuccess) {
      options.onSuccess(result);
    }
    return result;
  } catch (error) {
    const formattedError = formatAdminError(error);
    if (!options?.suppressError) {
      showAdminErrorToast(formattedError);
    }
    if (options?.onError) {
      options.onError(formattedError);
    }
    return null;
  }
}

/**
 * Common admin API operations with built-in error handling
 */
export const adminOperations = {
  /**
   * Delete an item with confirmation
   */
  async deleteItem<T>(
    deleteFn: () => Promise<T>,
    itemName: string,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) {
    return withAdminErrorHandler(
      deleteFn,
      {
        successMessage: `${itemName} 已删除`,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    );
  },

  /**
   * Update an item with error handling
   */
  async updateItem<T>(
    updateFn: () => Promise<T>,
    itemName: string,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) {
    return withAdminErrorHandler(
      updateFn,
      {
        successMessage: `${itemName} 已更新`,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    );
  },

  /**
   * Create an item with error handling
   */
  async createItem<T>(
    createFn: () => Promise<T>,
    itemName: string,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) {
    return withAdminErrorHandler(
      createFn,
      {
        successMessage: `${itemName} 已创建`,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    );
  },
};
