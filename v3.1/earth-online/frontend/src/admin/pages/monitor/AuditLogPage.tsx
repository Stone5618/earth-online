import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/admin/api/adminApi';
import type { AuditLog } from '@/admin/types/admin';
import { usePermission } from '@/admin/hooks/usePermission';
import { useAuthStore } from '@/admin/stores/authStore';
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
import { Shield, Calendar, Eye, Download, BarChart3 } from 'lucide-react';
import { ScrollText } from 'lucide-react';
import { formatDate } from '@/admin/utils/dateFormat';

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    CREATE: 'bg-green-500/20 text-green-400 border-green-500/30',
    UPDATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    LOGIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    LOGOUT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    LOCK: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    UNLOCK: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    RESET_PASSWORD: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    BULK_DELETE: 'bg-red-500/20 text-red-300 border-red-500/30',
    BULK_UPDATE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    SEED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  const cls = colorMap[action] ?? 'bg-[#00D2FF]/20 text-[#00D2FF] border-[#00D2FF]/30';
  return <Badge variant="outline" className={`${cls} font-medium`}>{action}</Badge>;
}

function DetailModal({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
  if (!log) return null;

  const formatJson = (obj: Record<string, unknown> | null) => {
    if (!obj) return null;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0D1128] border border-[#00D2FF]/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[#00D2FF]/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white font-orbitron">操作详情</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white">✕</Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">用户</Label>
              <p className="text-white font-mono mt-1">{(log as any).username || `#${log.user_id}`}</p>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">操作类型</Label>
              <div className="mt-1"><ActionBadge action={log.action} /></div>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">数据表</Label>
              <p className="text-[#00D2FF] font-mono mt-1">{log.table_name ?? '-'}</p>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">记录ID</Label>
              <p className="text-white font-mono mt-1">{log.record_id ?? '-'}</p>
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

          {log.old_values && (
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">修改前</Label>
              <pre className="mt-2 p-3 bg-[#151A3A] rounded-lg text-sm text-green-400 font-mono overflow-auto max-h-48">
                {formatJson(log.old_values)}
              </pre>
            </div>
          )}

          {log.new_values && (
            <div>
              <Label className="text-[rgba(255,255,255,0.5)]">修改后</Label>
              <pre className="mt-2 p-3 bg-[#151A3A] rounded-lg text-sm text-blue-400 font-mono overflow-auto max-h-48">
                {formatJson(log.new_values)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchAction, setSearchAction] = useState('');
  const [searchTable, setSearchTable] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ skip: 0, limit: 50, total: 0 });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const canView = useAuthStore.getState().user?.is_superuser || useAuthStore.getState().hasPermission('admin:audit:read');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { skip: pagination.skip, limit: pagination.limit };
      if (searchUser) params.user_id = parseInt(searchUser);
      if (searchAction) params.action = searchAction;
      if (searchTable) params.table_name = searchTable;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const { data } = await adminApi.audit.list(params);
      setLogs(data.logs);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.skip, pagination.limit, searchUser, searchAction, searchTable, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, skip: 0 }));
  };

  const handlePageChange = (newSkip: number) => {
    setPagination((prev) => ({ ...prev, skip: Math.max(0, newSkip) }));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params: Record<string, string | number> = { format, limit: 10000 };
      if (searchAction) params.action = searchAction;
      if (searchTable) params.table_name = searchTable;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const queryParams = new URLSearchParams(params as any).toString();
      const token = useAuthStore.getState().token;
      const response = await fetch(`/api/v1/admin/audit-logs/export?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white font-orbitron">审计日志</h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">管理后台操作记录</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')} className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            导出 CSV
          </Button>
          <Button onClick={() => handleExport('json')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            导出 JSON
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="用户ID"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-32 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white placeholder:text-[rgba(255,255,255,0.3)]"
          />
          <Input
            placeholder="操作类型"
            value={searchAction}
            onChange={(e) => setSearchAction(e.target.value)}
            className="w-32 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white placeholder:text-[rgba(255,255,255,0.3)]"
          />
          <Input
            placeholder="表名"
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="w-40 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white placeholder:text-[rgba(255,255,255,0.3)]"
          />
          <Button onClick={handleSearch} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
            <ScrollText className="w-4 h-4 mr-2" />
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
              <TableHead className="text-[rgba(255,255,255,0.6)]">用户</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">操作</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">表</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">记录ID</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">IP</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">详情</TableHead>
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
                  暂无审计日志
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-[rgba(0,210,255,0.15)] hover:bg-[#151A3A]/50">
                  <TableCell className="text-[rgba(255,255,255,0.6)] text-sm">
                    {formatDate(log.timestamp)}
                  </TableCell>
                  <TableCell className="text-white font-mono">{(log as any).username || `#${log.user_id}`}</TableCell>
                  <TableCell><ActionBadge action={log.action} /></TableCell>
                  <TableCell className="text-[#00D2FF] font-mono text-sm">{log.table_name ?? '-'}</TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.6)]">{log.record_id ?? '-'}</TableCell>
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

      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
