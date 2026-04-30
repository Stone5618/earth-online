import { AlertTriangle, Search, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    open: { cls: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <AlertTriangle className="w-3 h-3 mr-1" />, label: '待处理' },
    investigating: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Search className="w-3 h-3 mr-1" />, label: '调查中' },
    resolved: { cls: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle className="w-3 h-3 mr-1" />, label: '已解决' },
    ignored: { cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <XCircle className="w-3 h-3 mr-1" />, label: '已忽略' },
  };
  const { cls, icon, label } = config[status] ?? { cls: 'bg-[#00D2FF]/20 text-[#00D2FF] border-[#00D2FF]/30', icon: null, label: status };
  return (
    <Badge variant="outline" className={`${cls} font-medium`}>
      {icon}{label}
    </Badge>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
    WARNING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CRITICAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  const cls = colorMap[level] ?? 'bg-[#00D2FF]/20 text-[#00D2FF] border-[#00D2FF]/30';
  return <Badge variant="outline" className={`${cls} font-medium`}>{level}</Badge>;
}

export function AnnouncementStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    draft: { label: '草稿', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    scheduled: { label: '定时', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    published: { label: '已发布', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    archived: { label: '已归档', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  };
  const { cls, label } = config[status] ?? config.draft;
  return <Badge variant="outline" className={`${cls} font-medium`}>{label}</Badge>;
}

export function ActivityStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    draft: { label: '草稿', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    upcoming: { label: '未开始', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    active: { label: '进行中', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    ended: { label: '已结束', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  };
  const { cls, label } = config[status] ?? config.draft;
  return <Badge variant="outline" className={`${cls} font-medium`}>{label}</Badge>;
}

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="text-center py-12 text-[rgba(255,255,255,0.4)]">
      <div className="w-12 h-12 mx-auto mb-4 opacity-50">{icon}</div>
      <p>{title}</p>
      {description && <p className="text-sm mt-2">{description}</p>}
    </div>
  );
}
