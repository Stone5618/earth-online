import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/admin/layouts/AdminLayout';
import { LoginPage } from '@/admin/pages/LoginPage';
import { DashboardPage } from '@/admin/pages/dashboard/DashboardPage';
import { RoleListPage } from '@/admin/pages/permission/RoleListPage';
import { UserListPage } from '@/admin/pages/permission/UserListPage';
import { PlayerListPage } from '@/admin/pages/players/PlayerListPage';
import { PlayerDetailPage } from '@/admin/pages/players/PlayerDetailPage';
import { AuditLogPage } from '@/admin/pages/monitor/AuditLogPage';
import { ErrorLogPage } from '@/admin/pages/monitor/ErrorLogPage';
import { EventListPage } from '@/admin/pages/content/EventListPage';
import { ConfigPage } from '@/admin/pages/settings/ConfigPage';
import { ExportPage } from '@/admin/pages/operations/ExportPage';
import { AnnouncementListPage } from '@/admin/pages/operations/AnnouncementListPage';
import { ActivityListPage } from '@/admin/pages/operations/ActivityListPage';
import { AchievementListPage } from '@/admin/pages/data/AchievementListPage';
import { LeaderboardPage } from '@/admin/pages/data/LeaderboardPage';
import { CharacterListPage } from '@/admin/pages/data/CharacterListPage';
import { AdminProtectedRoute, PermissionGuard } from '@/admin/components/ProtectedRoute';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SystemMonitorPage } from '@/admin/pages/monitor/SystemMonitorPage';
import { PERMISSIONS } from '@/admin/constants/permissions';

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="permission/roles" element={
          <PermissionGuard permission="system:user">
            <RoleListPage />
          </PermissionGuard>
        } />
        <Route path="permission/users" element={
          <PermissionGuard permission="system:user">
            <UserListPage />
          </PermissionGuard>
        } />
        <Route path="players" element={
          <PermissionGuard permission="system:user">
            <PlayerListPage />
          </PermissionGuard>
        } />
        <Route path="players/:id" element={
          <PermissionGuard permission="system:user">
            <PlayerDetailPage />
          </PermissionGuard>
        } />

        <Route path="monitor/logs/audit" element={
          <PermissionGuard permission={PERMISSIONS.AUDIT_VIEW}>
            <AuditLogPage />
          </PermissionGuard>
        } />

        <Route path="data/characters" element={
          <PermissionGuard permission={PERMISSIONS.CHARACTER_VIEW}>
            <CharacterListPage />
          </PermissionGuard>
        } />
        <Route path="data/events" element={
          <PermissionGuard permission={PERMISSIONS.EVENT_VIEW}>
            <EventListPage />
          </PermissionGuard>
        } />
        <Route path="data/achievements" element={
          <PermissionGuard permission={PERMISSIONS.ACHIEVEMENT_VIEW}>
            <AchievementListPage />
          </PermissionGuard>
        } />
        <Route path="data/leaderboards" element={
          <PermissionGuard permission={PERMISSIONS.LEADERBOARD_VIEW}>
            <LeaderboardPage />
          </PermissionGuard>
        } />
        <Route path="operations/announcements" element={
          <PermissionGuard permission={PERMISSIONS.ANNOUNCEMENT_VIEW}>
            <AnnouncementListPage />
          </PermissionGuard>
        } />
        <Route path="operations/activities" element={
          <PermissionGuard permission={PERMISSIONS.ACTIVITY_VIEW}>
            <ActivityListPage />
          </PermissionGuard>
        } />
        <Route path="operations/export" element={
          <PermissionGuard permission={PERMISSIONS.EXPORT_DATA}>
            <ExportPage />
          </PermissionGuard>
        } />
        <Route path="monitor/system" element={
          <PermissionGuard permission={PERMISSIONS.SYSTEM_MONITOR}>
            <SystemMonitorPage />
          </PermissionGuard>
        } />
        <Route path="monitor/logs/error" element={
          <PermissionGuard permission={PERMISSIONS.AUDIT_VIEW}>
            <ErrorLogPage />
          </PermissionGuard>
        } />
        <Route path="settings" element={
          <PermissionGuard permission={PERMISSIONS.SYSTEM_CONFIG}>
            <ConfigPage />
          </PermissionGuard>
        } />

        {/* 404 catch-all for admin routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-orbitron">{title}</h1>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">开发中，敬请期待</p>
      </div>
      <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-12 flex flex-col items-center justify-center text-[rgba(255,255,255,0.3)]">
        <div className="w-16 h-16 rounded-2xl bg-[#00D2FF]/10 flex items-center justify-center border border-[#00D2FF]/20 mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <p className="text-lg">{title}</p>
        <p className="text-sm mt-2">该功能正在开发中</p>
      </div>
    </div>
  );
}
