import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route title configuration map.
 * Maps route paths to their document titles.
 */
const ROUTE_TITLES: Record<string, string> = {
  '/': 'EarthOnline - 人生模拟器',
  '/admin': '管理后台 - EarthOnline',
  '/admin/dashboard': '仪表盘 - 管理后台',
  '/admin/permission/roles': '角色管理 - 管理后台',
  '/admin/permission/users': '用户管理 - 管理后台',
  '/admin/data/characters': '角色管理 - 管理后台',
  '/admin/data/events': '事件管理 - 管理后台',
  '/admin/data/achievements': '成就管理 - 管理后台',
  '/admin/data/leaderboards': '排行榜 - 管理后台',
  '/admin/operations/announcements': '公告管理 - 管理后台',
  '/admin/operations/activities': '活动管理 - 管理后台',
  '/admin/operations/export': '数据导出 - 管理后台',
  '/admin/monitor/system': '系统监控 - 管理后台',
  '/admin/monitor/logs/audit': '审计日志 - 管理后台',
  '/admin/monitor/logs/error': '错误日志 - 管理后台',
  '/admin/settings': '系统配置 - 管理后台',
};

/**
 * Fallback titles for route prefixes.
 * Used when exact match is not found.
 */
const PREFIX_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: '/admin/login', title: '登录 - 管理后台' },
  { prefix: '/admin', title: '管理后台 - EarthOnline' },
];

/**
 * Resolve the title for a given pathname.
 */
function resolveRouteTitle(pathname: string): string {
  // Try exact match first
  const exactMatch = ROUTE_TITLES[pathname];
  if (exactMatch) {
    return exactMatch;
  }

  // Try prefix matches
  for (const { prefix, title } of PREFIX_TITLES) {
    if (pathname.startsWith(prefix)) {
      return title;
    }
  }

  // Default fallback
  return 'EarthOnline - 人生模拟器';
}

/**
 * A component that updates document.title based on current route.
 * Place this inside a Router context.
 */
export function RouteMetadata() {
  const location = useLocation();

  useEffect(() => {
    const title = resolveRouteTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);

  return null;
}
