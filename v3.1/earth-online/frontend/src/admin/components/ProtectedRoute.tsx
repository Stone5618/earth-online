import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/admin/stores/authStore';

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E2A]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00D2FF]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export function PermissionGuard({
  permission,
  children,
  fallback,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E2A]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00D2FF]"></div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0E2A] text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">权限不足</h1>
          <p className="text-[rgba(255,255,255,0.5)]">您没有访问此页面的权限</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
