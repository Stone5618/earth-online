import { useEffect, useState, useCallback } from 'react';
import type { Announcement, AnnouncementStatus, AnnouncementType } from '@/admin/types/admin';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Megaphone, Plus, Eye, Send, Calendar, Trash2, Clock, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/admin/utils/dateFormat';

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  draft: { label: '草稿', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <FileText className="w-3 h-3 mr-1" /> },
  scheduled: { label: '定时', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock className="w-3 h-3 mr-1" /> },
  published: { label: '已发布', cls: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  archived: { label: '已归档', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Calendar className="w-3 h-3 mr-1" /> },
};

export function AnnouncementListPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'info', target_audience: 'all', scheduled_at: '' });
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 });

  const { hasPermission, isSuperuser } = usePermission();
  const canManage = isSuperuser || hasPermission('ops:announcement');

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter && typeFilter !== 'all') params.type = typeFilter;
      const { data } = await adminApi.announcements.list({ ...params, skip: pagination.skip, limit: pagination.limit });
      setAnnouncements(data.announcements);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, pagination.skip, pagination.limit]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      toast.error('请填写标题和内容');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.announcements.create(formData);
      toast.success('公告已创建');
      setShowCreateDialog(false);
      setFormData({ title: '', content: '', type: 'info', target_audience: 'all', scheduled_at: '' });
      await fetchAnnouncements();
    } catch {
      toast.error('创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await adminApi.announcements.publish(id);
      toast.success('公告已发布');
      await fetchAnnouncements();
    } catch {
      toast.error('发布失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.announcements.delete(id);
      toast.success('公告已删除');
      await fetchAnnouncements();
    } catch {
      toast.error('删除失败');
    }
  };

  if (!canManage) {
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
          <h1 className="text-2xl font-bold text-white font-orbitron">公告管理</h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">发布和管理游戏公告</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
          <Plus className="w-4 h-4 mr-2" />
          新建公告
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination((p) => ({ ...p, skip: 0 })); }}>
          <SelectTrigger className="w-32 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="scheduled">定时</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPagination((p) => ({ ...p, skip: 0 })); }}>
          <SelectTrigger className="w-32 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="info">信息</SelectItem>
            <SelectItem value="warning">警告</SelectItem>
            <SelectItem value="maintenance">维护</SelectItem>
            <SelectItem value="event">活动</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[rgba(0,210,255,0.15)] hover:bg-transparent">
              <TableHead className="text-[rgba(255,255,255,0.6)]">标题</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">类型</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">状态</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">发布时间</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-[rgba(0,210,255,0.15)]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24 bg-[#151A3A]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[rgba(255,255,255,0.4)] py-8">
                  暂无公告数据
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((ann) => {
                const statusCfg = statusConfig[ann.status] || statusConfig.draft;
                return (
                  <TableRow key={ann.id} className="border-[rgba(0,210,255,0.15)] hover:bg-[#151A3A]/50">
                    <TableCell className="text-white font-medium max-w-xs truncate">{ann.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {ann.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusCfg.cls} font-medium`}>
                        {statusCfg.icon}{statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[rgba(255,255,255,0.5)] text-sm">
                      {ann.published_at ? formatDate(ann.published_at) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedAnn(ann); setShowDetailDialog(true); }} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {ann.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => handlePublish(ann.id)} className="text-green-400 hover:text-green-300">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ann.id)} className="text-[rgba(255,255,255,0.6)] hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <AdminPagination
          skip={pagination.skip}
          limit={pagination.limit}
          total={pagination.total}
          onSkipChange={(skip) => setPagination((p) => ({ ...p, skip }))}
        />
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle>新建公告</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">发布新的游戏公告</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标题</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="公告标题"
              />
            </div>
            <div className="space-y-2">
              <Label>内容</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="公告内容"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">信息</SelectItem>
                    <SelectItem value="warning">警告</SelectItem>
                    <SelectItem value="maintenance">维护</SelectItem>
                    <SelectItem value="event">活动</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>目标用户</Label>
                <Select value={formData.target_audience} onValueChange={(v) => setFormData({ ...formData, target_audience: v })}>
                  <SelectTrigger className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全体用户</SelectItem>
                    <SelectItem value="active">活跃用户</SelectItem>
                    <SelectItem value="new">新用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
              {submitting ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle>公告详情</DialogTitle>
          </DialogHeader>
          {selectedAnn && (
            <div className="space-y-4">
              <div>
                <Label className="text-[rgba(255,255,255,0.6)]">标题</Label>
                <p className="text-white mt-1">{selectedAnn.title}</p>
              </div>
              <div>
                <Label className="text-[rgba(255,255,255,0.6)]">内容</Label>
                <p className="text-[rgba(255,255,255,0.7)] mt-1 whitespace-pre-wrap">{selectedAnn.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[rgba(255,255,255,0.6)]">类型</Label>
                  <p className="text-white mt-1">{selectedAnn.type}</p>
                </div>
                <div>
                  <Label className="text-[rgba(255,255,255,0.6)]">状态</Label>
                  <p className="text-white mt-1">{selectedAnn.status}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
