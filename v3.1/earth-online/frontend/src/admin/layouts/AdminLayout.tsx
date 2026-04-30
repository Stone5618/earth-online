import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  FileText,
  ScrollText,
  Megaphone,
  CalendarDays,
  Download,
  Monitor,
  FileSearch,
  Settings,
  ShieldCheck,
  UserCog,
  LogOut,
  Trophy,
  BarChart3,
  Gamepad2,
} from 'lucide-react';
import { useAuthStore } from '@/admin/stores/authStore';
import { usePermission } from '@/admin/hooks/usePermission';
import { VisitedTabs } from '@/admin/components/VisitedTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const SIDEBAR_WIDTH = 256;

const navItems = [
  {
    group: '概览',
    items: [
      { icon: LayoutDashboard, label: '仪表盘', path: '/admin', permission: 'dashboard:view' },
    ],
  },
  {
    group: '权限管理',
    items: [
      { icon: ShieldCheck, label: '角色管理', path: '/admin/permission/roles', permission: 'system:user' },
      { icon: UserCog, label: '管理员管理', path: '/admin/permission/users', permission: 'system:user' },
    ],
  },
  {
    group: '玩家管理',
    items: [
      { icon: Gamepad2, label: '玩家列表', path: '/admin/players', permission: 'system:user' },
    ],
  },
  {
    group: '数据管理',
    items: [
      { icon: Users, label: '游戏角色管理', path: '/admin/data/characters', permission: 'character:view' },
      { icon: FileText, label: '事件管理', path: '/admin/data/events', permission: 'event:view' },
      { icon: Trophy, label: '成就管理', path: '/admin/data/achievements', permission: 'achievement:view' },
      { icon: BarChart3, label: '排行榜', path: '/admin/data/leaderboards', permission: 'leaderboard:view' },
    ],
  },
  {
    group: '运营工具',
    items: [
      { icon: Megaphone, label: '公告管理', path: '/admin/operations/announcements', permission: 'announcement:view' },
      { icon: CalendarDays, label: '活动管理', path: '/admin/operations/activities', permission: 'activity:view' },
      { icon: Download, label: '数据导出', path: '/admin/operations/export', permission: 'export:data' },
    ],
  },
  {
    group: '监控',
    items: [
      { icon: Monitor, label: '系统监控', path: '/admin/monitor/system', permission: 'system:monitor' },
      { icon: FileSearch, label: '错误日志', path: '/admin/monitor/logs/error', permission: 'audit:view' },
      { icon: ScrollText, label: '审计日志', path: '/admin/monitor/logs/audit', permission: 'audit:view' },
    ],
  },
  {
    group: '系统',
    items: [
      { icon: Settings, label: '系统配置', path: '/admin/settings', permission: 'system:config' },
    ],
  },
];

function getBreadcrumbItems(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const items: Array<{ label: string; path: string }> = [];
  let currentPath = '';
  const skipSegments = new Set(['logs']);
  for (const seg of segments) {
    if (skipSegments.has(seg)) continue;
    currentPath += `/${seg}`;
    const label = seg === 'admin' ? '管理后台'
      : seg === 'dashboard' ? '仪表盘'
      : seg === 'permission' ? '权限管理'
      : seg === 'data' ? '数据管理'
      : seg === 'operations' ? '运营工具'
      : seg === 'monitor' ? '监控'
      : seg === 'roles' ? '角色管理'
      : seg === 'users' ? '管理员管理'
      : seg === 'players' ? '玩家管理'
      : seg === 'characters' ? '游戏角色管理'
      : seg === 'events' ? '事件管理'
      : seg === 'achievements' ? '成就管理'
      : seg === 'leaderboards' ? '排行榜'
      : seg === 'announcements' ? '公告管理'
      : seg === 'activities' ? '活动管理'
      : seg === 'export' ? '数据导出'
      : seg === 'system' ? '系统监控'
      : seg === 'error' ? '错误日志'
      : seg === 'audit' ? '审计日志'
      : seg === 'settings' ? '系统配置'
      : seg;
    items.push({ label, path: currentPath });
  }
  return items;
}

function AdminHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const breadcrumbItems = getBreadcrumbItems(useLocation().pathname);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header
      className="sticky top-0 z-10 flex flex-col gap-0 border-b border-[rgba(0,210,255,0.15)] backdrop-blur"
      style={{ backgroundColor: '#0D1128' }}
    >
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" style={{ backgroundColor: 'rgba(0,210,255,0.15)' }} />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, i) => (
              <div key={item.path} className="flex items-center gap-2">
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {i < breadcrumbItems.length - 1 ? (
                    <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'default' }}>
                      {item.label}
                    </span>
                  ) : (
                    <BreadcrumbPage style={{ color: '#fff' }}>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 rounded-full px-2" style={{ background: 'transparent' }}>
                <Avatar className="h-8 w-8 border" style={{ borderColor: 'rgba(0,210,255,0.2)' }}>
                  <AvatarFallback style={{ backgroundColor: 'rgba(0,210,255,0.2)', color: '#00D2FF' }} className="text-xs font-bold">
                    {user?.username?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 text-left hidden md:block">
                  <p className="text-sm" style={{ color: '#fff' }}>{user?.username}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {user?.is_superuser ? '超级管理员' : user?.role_display_name ?? '未分配角色'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ backgroundColor: '#151A3A', borderColor: 'rgba(0,210,255,0.15)', color: '#fff' }}>
              <DropdownMenuItem onClick={handleLogout} style={{ color: '#f87171' }}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <VisitedTabs />
    </header>
  );
}

function AdminSidebarContent() {
  const { hasPermission, isSuperuser } = usePermission();

  return (
    <>
      <SidebarHeader className="py-3" style={{ borderBottom: '1px solid rgba(0,210,255,0.15)' }}>
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{ backgroundColor: 'rgba(0,210,255,0.2)', borderColor: 'rgba(0,210,255,0.3)' }}
          >
            <span className="text-lg">🌍</span>
          </div>
          <div className="sidebar-label">
            <p className="text-sm font-bold font-orbitron tracking-wider" style={{ color: '#fff' }}>地球Online</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>管理后台</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((group) => {
          const visibleItems = isSuperuser
            ? group.items
            : group.items.filter((item) => hasPermission(item.permission));
          if (visibleItems.length === 0) return null;
          return (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel style={{ color: 'rgba(255,255,255,0.4)' }}>{group.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link to={item.path} style={{ color: 'rgba(255,255,255,0.7)' }}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="py-2" style={{ borderTop: '1px solid rgba(0,210,255,0.15)' }}>
        <div className="px-3 py-2">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>地球Online v3.1</p>
        </div>
      </SidebarFooter>
    </>
  );
}

function AdminLayoutInner() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080B1A' }} />
    );
  }

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="z-20 border-r"
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          backgroundColor: '#0D1128',
          borderColor: 'rgba(0,210,255,0.15)',
        }}
      >
        <AdminSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset
        className="flex-1"
        style={{
          marginLeft: SIDEBAR_WIDTH,
          backgroundColor: '#080B1A',
        }}
      >
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </main>
      </SidebarInset>
    </>
  );
}

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full" style={{ backgroundColor: '#080B1A' }}>
        <AdminLayoutInner />
        <Toaster position="top-right" richColors />
      </div>
    </SidebarProvider>
  );
}