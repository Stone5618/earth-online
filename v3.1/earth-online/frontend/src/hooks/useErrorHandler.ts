/**
 * useErrorHandler
 *
 * A centralized hook for handling API errors and displaying user-friendly messages.
 * Integrates with the toast notification system automatically.
 */

import { useCallback } from 'react';
import { useToast } from '@/components/game/ToastNotification';
import type { ApiError } from '@/api/client';
import { formatApiError } from '@/constants/errorMessages';

interface ErrorHandlerOptions {
  /** Custom success message if operation succeeds */
  successMessage?: string;
  /** Custom error message override */
  errorMessage?: string;
  /** Whether to show success toast (default: false for read operations) */
  showSuccess?: boolean;
  /** Whether to re-throw the error after handling (default: false) */
  rethrow?: boolean;
}

export function useErrorHandler() {
  const { showToast } = useToast();

  const handleError = useCallback(
    (error: ApiError, options?: ErrorHandlerOptions) => {
      const { title, message, suggestion } = formatApiError(error);
      const fullMessage = suggestion ? `${message} ${suggestion}` : message;
      const userMessage = options?.errorMessage || fullMessage;

      showToast(userMessage, 'error');

      // Log the full error for debugging
      console.error('[ErrorHandler]', {
        type: error.type,
        message: error.message,
        statusCode: error.statusCode,
        originalError: error.originalError,
        originalErrorMessage: error.originalError ? 
          (error.originalError instanceof Error ? error.originalError.message : String(error.originalError)) 
          : "No original error",
      });

      if (options?.rethrow) {
        throw error;
      }
    },
    [showToast]
  );

  const handleSuccess = useCallback(
    (options?: ErrorHandlerOptions) => {
      if (options?.successMessage && options.showSuccess) {
        showToast(options.successMessage, 'success');
      }
    },
    [showToast]
  );

  /**
   * Wraps an async API call with error handling.
   * Usage: await withErrorHandling(api.getServers(), { successMessage: 'Updated!' });
   */
  const withErrorHandling = useCallback(
    async <T>(
      promise: Promise<T>,
      options?: ErrorHandlerOptions
    ): Promise<T | null> => {
      try {
        const result = await promise;
        handleSuccess(options);
        return result;
      } catch (error) {
        handleError(error as ApiError, options);
        return null;
      }
    },
    [handleError, handleSuccess]
  );

  return {
    handleError,
    handleSuccess,
    withErrorHandling,
  };
}
