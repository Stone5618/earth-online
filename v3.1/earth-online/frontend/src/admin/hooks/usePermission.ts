import { useCallback } from 'react';
import { useAuthStore } from '@/admin/stores/authStore';

export function usePermission() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const user = useAuthStore((s) => s.user);

  const hasAnyPermission = useCallback(
    (codes: string[]) => codes.some(hasPermission),
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (codes: string[]) => codes.every(hasPermission),
    [hasPermission],
  );

  return { hasPermission, hasAnyPermission, hasAllPermissions, isSuperuser: user?.is_superuser ?? false };
}
