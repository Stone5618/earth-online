import { useEffect, useState, useCallback } from 'react';
import type { ErrorLog } from '@/admin/types/admin';
import { usePermission } from '@/admin/hooks/usePermission';
import { adminApi } from '@/admin/api/adminApi';
import { AdminPagination } from '@/admin/components/AdminPagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Calendar, Eye, AlertTriangle, Search } from 'lucide-react';
import { formatDate } from '@/admin/utils/dateFormat';
import { toast } from 'sonner';
import { LevelBadge, StatusBadge } from '@/admin/components/shared/Badges';

function DetailModal({ log, onClose, onStatusChange }: { log: ErrorLog | null; onClose: () => void; onStatusChange: () => void }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!log) return;
    setUpdating(true);
    try {
      await adminApi.errorLogs.updateStatus(log.id, newStatus);
      toast.success('状态已更新');
      onStatusChange();
      onClose();
    } catch {
      toast.error('更新状态失败');
    } finally {
      setUpdating(false);
    }
  };

  const formatJson = (obj: Record<string, unknown> | null) => {
    if (!obj) return null;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  if (!log) return null;

  return (
    <Dialog open={!!log} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-3xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>错误详情 #{log.id}</DialogTitle>
          <DialogDescription className="text-[rgba(255,255,255,0.5)]">查看错误日志详细信息</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">级别</Label>
              <div className="mt-1"><LevelBadge level={log.level} /></div>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">状态</Label>
              <div className="mt-1"><StatusBadge status={log.status} /></div>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">请求路径</Label>
              <p className="text-[#00D2FF] font-mono text-sm mt-1">{log.request_path ?? '-'}</p>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">请求方法</Label>
              <p className="text-white font-mono mt-1">{log.request_method ?? '-'}</p>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">IP 地址</Label>
              <p className="text-white font-mono mt-1">{log.ip_address ?? '-'}</p>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">时间</Label>
              <p className="text-white font-mono mt-1">{formatDate(log.timestamp)}</p>
            </div>
          </div>

          <div>
            <Label className="text-[rgba(255,255,255,0.5)]">错误消息</Label>
            <p className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm font-mono">
              {log.message}
            </p>
          </div>

          {log.stack_trace && (
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">堆栈跟踪</Label>
              <pre className="mt-2 p-3 bg-[#151A3A] rounded-lg text-sm text-yellow-300 font-mono overflow-auto max-h-64 whitespace-pre-wrap">
                {log.stack_trace}
              </pre>
            </div>
          )}

          {log.context && (
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">上下文信息</Label>
              <pre className="mt-2 p-3 bg-[#151A3A] rounded-lg text-sm text-blue-300 font-mono overflow-auto max-h-48">
                {formatJson(log.context)}
              </pre>
            </div>
          )}
        </div>

        {(log.status === 'open' || log.status === 'investigating') && (
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('investigating')}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              标记为调查中
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('resolved')}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              标记为已解决
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('ignored')}
              disabled={updating}
              variant="ghost"
              className="text-gray-400 hover:text-gray-300"
            >
              忽略
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ErrorLogPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLevel, setSearchLevel] = useState('ALL');
  const [searchStatus, setSearchStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ skip: 0, limit: 50, total: 0 });
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [stats, setStats] = useState<{ total_errors: number; errors_by_level: Array<{ level: string; count: number }>; errors_by_status: Array<{ status: string; count: number }> } | null>(null);

  const { hasPermission, isSuperuser } = usePermission();
  const canView = isSuperuser || hasPermission('admin:audit:read');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { skip: pagination.skip, limit: pagination.limit };
      if (searchLevel && searchLevel !== 'ALL') params.level = searchLevel;
      if (searchStatus && searchStatus !== 'ALL') params.status = searchStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const { data } = await adminApi.errorLogs.list(params as any);
      setLogs(data.logs);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.skip, pagination.limit, searchLevel, searchStatus, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await adminApi.errorLogs.stats(30);
      setStats(data);
    } catch {
      console.error('Failed to fetch stats');
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, skip: 0 }));
  };

  const handlePageChange = (newSkip: number) => {
    setPagination((prev) => ({ ...prev, skip: Math.max(0, newSkip) }));
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[rgba(255,255,255,0.5)]">
        <Shield className="w-16 h-16 mb-4" />
        <p className="text-lg">权限不足</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-orbitron">错误日志</h1>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">系统异常和错误追踪</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">总错误数 (30天)</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total_errors}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">待处理</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  {stats.errors_by_status.find(s => s.status === 'open')?.count ?? 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">已解决</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {stats.errors_by_status.find(s => s.status === 'resolved')?.count ?? 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={searchLevel} onValueChange={setSearchLevel}>
            <SelectTrigger className="w-32 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
              <SelectValue placeholder="错误级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部</SelectItem>
              <SelectItem value="ERROR">ERROR</SelectItem>
              <SelectItem value="WARNING">WARNING</SelectItem>
              <SelectItem value="CRITICAL">CRITICAL</SelectItem>
            </SelectContent>
          </Select>
          <Select value={searchStatus} onValueChange={setSearchStatus}>
            <SelectTrigger className="w-36 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部</SelectItem>
              <SelectItem value="open">待处理</SelectItem>
              <SelectItem value="investigating">调查中</SelectItem>
              <SelectItem value="resolved">已解决</SelectItem>
              <SelectItem value="ignored">已忽略</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
            <Search className="w-4 h-4 mr-2" />
            搜索
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[rgba(255,255,255,0.6)]" />
            <Label className="text-[rgba(255,255,255,0.6)]">日期范围</Label>
          </div>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
          />
          <span className="text-[rgba(255,255,255,0.5)]">至</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[rgba(0,210,255,0.15)] hover:bg-transparent">
              <TableHead className="text-[rgba(255,255,255,0.6)]">时间</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">级别</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">状态</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">消息</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">路径</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">IP</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-[rgba(0,210,255,0.15)]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24 bg-[#151A3A]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-[rgba(255,255,255,0.4)] py-8">
                  暂无错误日志
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-[rgba(0,210,255,0.15)] hover:bg-[#151A3A]/50">
                  <TableCell className="text-[rgba(255,255,255,0.6)] text-sm">
                    {formatDate(log.timestamp)}
                  </TableCell>
                  <TableCell><LevelBadge level={log.level} /></TableCell>
                  <TableCell><StatusBadge status={log.status} /></TableCell>
                  <TableCell className="text-white max-w-xs truncate" title={log.message}>
                    {log.message}
                  </TableCell>
                  <TableCell className="text-[#00D2FF] font-mono text-sm max-w-[150px] truncate">
                    {log.request_path ?? '-'}
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.5)] font-mono text-sm">{log.ip_address ?? '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="text-[#00D2FF] hover:text-[#00B8E6]"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        skip={pagination.skip}
        limit={pagination.limit}
        total={pagination.total}
        onSkipChange={handlePageChange}
      />

      <DetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onStatusChange={() => {
          fetchLogs();
          fetchStats();
        }}
      />
    </div>
  );
}
