import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVisitedTabsStore } from '@/admin/stores/visitedTabsStore';
import { X, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    group: '概览',
    items: [
      { label: '仪表盘', path: '/admin' },
    ],
  },
  {
    group: '权限管理',
    items: [
      { label: '角色管理', path: '/admin/permission/roles' },
      { label: '管理员管理', path: '/admin/permission/users' },
    ],
  },
  {
    group: '玩家管理',
    items: [
      { label: '玩家列表', path: '/admin/players' },
      { label: '玩家详情', path: '/admin/players/detail' },
    ],
  },
  {
    group: '数据管理',
    items: [
      { label: '游戏角色管理', path: '/admin/data/characters' },
      { label: '事件管理', path: '/admin/data/events' },
      // TODO: 以下页面待实现，暂时保留导航定义
      // { label: '成就管理', path: '/admin/data/achievements' },
      // { label: '排行榜', path: '/admin/data/leaderboards' },
    ],
  },
  // TODO: 运营工具和监控模块待开发
  // {
  //   group: '运营工具',
  //   items: [
  //     { label: '公告管理', path: '/admin/operations/announcements' },
  //     { label: '活动管理', path: '/admin/operations/activities' },
  //     { label: '数据导出', path: '/admin/operations/export' },
  //   ],
  // },
  // {
  //   group: '监控',
  //   items: [
  //     { label: '系统监控', path: '/admin/monitor/system' },
  //     { label: '错误日志', path: '/admin/monitor/logs/error' },
  //     { label: '审计日志', path: '/admin/monitor/logs/audit' },
  //   ],
  // },
  {
    group: '系统',
    items: [
      { label: '系统配置', path: '/admin/settings' },
    ],
  },
];

function findLabel(path: string): string {
  const trimmed = path.replace(/\/+$/, '');
  // Check exact match first
  for (const group of navItems) {
    for (const item of group.items) {
      if (item.path === trimmed) return item.label;
    }
  }
  // Handle player detail pages like /admin/players/123
  if (/^\/admin\/players\/\d+$/.test(trimmed)) {
    return '玩家详情';
  }
  return trimmed.split('/').pop() || trimmed;
}

export function VisitedTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs, addTab, removeTab, closeOthers, closeAll } = useVisitedTabsStore();

  useEffect(() => {
    let path = location.pathname;
    if (path.startsWith('/admin') && path !== '/admin/login') {
      // Handle dashboard redirect: /admin/dashboard -> /admin
      if (path === '/admin/dashboard') {
        path = '/admin';
      }
      const label = findLabel(path);
      addTab({ key: path, label, path });
    }
  }, [location.pathname, addTab]);

  if (tabs.length === 0) return null;

  const currentPath = location.pathname.replace(/\/+$/, '');
  const isActive = (tabPath: string) => tabPath.replace(/\/+$/, '') === currentPath;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleClose = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeTab(key);
  };

  return (
    <div
      className="flex items-center gap-1 px-2 overflow-x-auto"
      style={{
        backgroundColor: '#080B1A',
        minHeight: '38px',
        borderBottom: '1px solid rgba(0,210,255,0.08)',
      }}
    >
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleNavigate(tab.path)}
              className={`
                group relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 shrink-0
                ${active
                  ? 'text-[#00D2FF] bg-[rgba(0,210,255,0.1)] shadow-[0_0_12px_rgba(0,210,255,0.15)]'
                  : 'text-[rgba(255,255,255,0.45)] hover:text-[rgba(255,255,255,0.75)] hover:bg-[rgba(255,255,255,0.05)]'
                }
              `}
            >
              {active && (
                <span
                  className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: '#00D2FF', boxShadow: '0 0 6px rgba(0,210,255,0.5)' }}
                />
              )}
              <span className="truncate max-w-[100px]">{tab.label}</span>
              <span
                onClick={(e) => handleClose(tab.key, e)}
                className={`
                  flex items-center justify-center w-4 h-4 rounded transition-all duration-200
                  ${active
                    ? 'opacity-60 hover:opacity-100 hover:bg-[rgba(0,210,255,0.2)] hover:text-[#00D2FF]'
                    : 'opacity-0 group-hover:opacity-60 hover:opacity-100 hover:bg-[rgba(255,255,255,0.15)]'
                  }
                `}
              >
                <X className="w-3 h-3" />
              </span>
            </button>
          );
        })}
      </div>

      {tabs.length > 1 && (
        <div className="flex items-center px-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] rounded-md"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ backgroundColor: '#151A3A', borderColor: 'rgba(0,210,255,0.15)', color: '#fff' }}>
              <DropdownMenuItem onClick={() => closeOthers(currentPath)} style={{ color: '#fff' }}>
                关闭其他
              </DropdownMenuItem>
              <DropdownMenuItem onClick={closeAll} style={{ color: '#f87171' }}>
                关闭全部
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
