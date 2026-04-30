import { useEffect, useState } from 'react';
import { adminApi } from '@/admin/api/adminApi';
import type { EventTemplate } from '@/admin/types/admin';
import { usePermission } from '@/admin/hooks/usePermission';
import { useAuthStore } from '@/admin/stores/authStore';
import { useKeyboardShortcut } from '@/admin/hooks/useKeyboardShortcut';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, Plus, Edit, Trash2, FileText, Search, Eye, Trash, ToggleLeft } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  category: string;
  min_age: number;
  max_age: number;
  base_weight: number;
  difficulty_level: number;
  is_active: boolean;
  content: Record<string, any>;
}

const emptyForm: EventFormData = {
  title: '',
  description: '',
  category: 'life',
  min_age: 0,
  max_age: 100,
  base_weight: 1.0,
  difficulty_level: 0.5,
  is_active: true,
  content: {},
};

export function EventListPage() {
  const { hasPermission } = usePermission();
  const [events, setEvents] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ category: '', is_active: '' as string | undefined });
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 });

  const canManage = hasPermission('event:manage') || useAuthStore.getState().user?.is_superuser;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = { skip: pagination.skip, limit: pagination.limit };
      if (filters.category) params.category = filters.category;
      if (filters.is_active !== '') params.is_active = filters.is_active === 'true';

      const { data } = await adminApi.events.list(params);
      setEvents(data.events);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载事件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [pagination.skip, pagination.limit, filters.category, filters.is_active]);

  const openCreateDialog = () => {
    setFormData({ ...emptyForm });
    setShowCreateDialog(true);
  };

  const openEditDialog = (ev: EventTemplate) => {
    setFormData({
      title: ev.title,
      description: ev.description ?? '',
      category: ev.category,
      min_age: ev.min_age,
      max_age: ev.max_age,
      base_weight: ev.base_weight,
      difficulty_level: ev.difficulty_level,
      is_active: ev.is_active,
      content: ev.content ?? {},
    });
    setEditingEventId(ev.id);
    setShowEditDialog(true);
  };

  const openDetailDialog = (ev: EventTemplate) => {
    setFormData({
      title: ev.title,
      description: ev.description ?? '',
      category: ev.category,
      min_age: ev.min_age,
      max_age: ev.max_age,
      base_weight: ev.base_weight,
      difficulty_level: ev.difficulty_level,
      is_active: ev.is_active,
      content: ev.content ?? {},
    });
    setShowDetailDialog(true);
  };

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error('请输入事件标题');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.events.create(formData);
      toast.success('事件已创建');
      setShowCreateDialog(false);
      await fetchEvents();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title || editingEventId === null) {
      toast.error('请输入事件标题');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.events.update(editingEventId, formData);
      toast.success('事件已更新');
      setShowEditDialog(false);
      await fetchEvents();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ev: EventTemplate) => {
    try {
      await adminApi.events.delete(ev.id);
      toast.success('事件已删除');
      await fetchEvents();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '删除失败，请重试');
    }
  };

  const handleToggleActive = async (ev: EventTemplate) => {
    try {
      await adminApi.events.update(ev.id, { ...ev, is_active: !ev.is_active });
      toast.success(`已${ev.is_active ? '停用' : '启用'}事件`);
      await fetchEvents();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '操作失败，请重试');
    }
  };

  const handleFilter = () => {
    setPagination((prev) => ({ ...prev, skip: 0 }));
  };

  const handlePageChange = (newSkip: number) => {
    setPagination((prev) => ({ ...prev, skip: newSkip }));
  };

  useKeyboardShortcut({
    onSubmit: showCreateDialog ? handleCreate : showEditDialog ? handleUpdate : undefined,
    onCancel: showCreateDialog ? () => setShowCreateDialog(false) : showEditDialog ? () => setShowEditDialog(false) : undefined,
    enabled: showCreateDialog || showEditDialog,
  });

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[rgba(255,255,255,0.5)]">
        <Shield className="w-16 h-16 mb-4" />
        <p className="text-lg">权限不足</p>
        <p className="text-sm">需要 event:manage 权限</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-orbitron">事件管理</h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">管理游戏事件模板</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
          <Plus className="w-4 h-4 mr-2" />
          新建事件
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-[rgba(255,255,255,0.6)]">分类</Label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="bg-[#151A3A] border border-[rgba(0,210,255,0.15)] text-white rounded px-3 py-1 text-sm"
          >
            <option value="">全部</option>
            <option value="life">生活</option>
            <option value="career">职业</option>
            <option value="health">健康</option>
            <option value="education">教育</option>
            <option value="social">社交</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[rgba(255,255,255,0.6)]">状态</Label>
          <select
            value={filters.is_active ?? ''}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value || undefined })}
            className="bg-[#151A3A] border border-[rgba(0,210,255,0.15)] text-white rounded px-3 py-1 text-sm"
          >
            <option value="">全部</option>
            <option value="true">启用</option>
            <option value="false">停用</option>
          </select>
        </div>
        <Button size="sm" onClick={handleFilter} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
          <Search className="w-4 h-4 mr-1" />
          筛选
        </Button>
      </div>

      <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[rgba(0,210,255,0.15)] hover:bg-transparent">
              <TableHead className="text-[rgba(255,255,255,0.6)]">标题</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">分类</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">年龄范围</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">权重</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">难度</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">状态</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-[rgba(0,210,255,0.15)]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20 bg-[#151A3A]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-[rgba(255,255,255,0.4)] py-8">
                  暂无事件数据
                </TableCell>
              </TableRow>
            ) : (
              events.map((ev) => (
                <TableRow key={ev.id} className="border-[rgba(0,210,255,0.15)] hover:bg-[#151A3A]/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[rgba(0,210,255,0.6)]" />
                      <span className="text-white font-medium">{ev.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {ev.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.6)]">
                    {ev.min_age}-{ev.max_age}
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.6)]">
                    {ev.base_weight.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.6)]">
                    {(ev.difficulty_level * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ev.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {ev.is_active ? '启用' : '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetailDialog(ev)} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(ev)} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(ev)} className="text-[rgba(255,255,255,0.6)] hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

      <CreateEditDialog
        mode="create"
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleCreate}
        submitting={submitting}
      />

      <CreateEditDialog
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleUpdate}
        submitting={submitting}
      />

      <DetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        formData={formData}
      />
    </div>
  );
}

function CreateEditDialog({
  mode,
  open,
  onOpenChange,
  formData,
  onChange,
  onSubmit,
  submitting,
}: {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: EventFormData;
  onChange: (data: EventFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '新建事件' : '编辑事件'}</DialogTitle>
          <DialogDescription className="text-[rgba(255,255,255,0.5)]">
            {mode === 'create' ? '创建新的游戏事件模板' : '修改事件模板配置'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>标题</Label>
              <Input
                value={formData.title}
                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="事件标题"
              />
            </div>
            <div className="space-y-2">
              <Label>分类</Label>
              <select
                value={formData.category}
                onChange={(e) => onChange({ ...formData, category: e.target.value })}
                className="w-full bg-[#151A3A] border border-[rgba(0,210,255,0.15)] text-white rounded px-3 py-2 text-sm"
              >
                <option value="life">生活</option>
                <option value="career">职业</option>
                <option value="health">健康</option>
                <option value="education">教育</option>
                <option value="social">社交</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              placeholder="事件描述"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>最小年龄</Label>
              <Input
                type="number"
                value={formData.min_age}
                onChange={(e) => onChange({ ...formData, min_age: parseInt(e.target.value) || 0 })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>最大年龄</Label>
              <Input
                type="number"
                value={formData.max_age}
                onChange={(e) => onChange({ ...formData, max_age: parseInt(e.target.value) || 100 })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>权重</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.base_weight}
                onChange={(e) => onChange({ ...formData, base_weight: parseFloat(e.target.value) || 1.0 })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>难度等级</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.difficulty_level}
                onChange={(e) => onChange({ ...formData, difficulty_level: parseFloat(e.target.value) || 0.5 })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(v) => onChange({ ...formData, is_active: v })}
            />
            <Label>启用事件</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={onSubmit} disabled={submitting} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
            {submitting ? '提交中...' : mode === 'create' ? '创建' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailDialog({
  open,
  onOpenChange,
  formData,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: EventFormData;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>事件详情</DialogTitle>
          <DialogDescription className="text-[rgba(255,255,255,0.5)]">
            查看事件模板详细信息
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label className="text-[rgba(255,255,255,0.6)]">标题</Label>
            <p className="text-white mt-1">{formData.title}</p>
          </div>
          <div>
            <Label className="text-[rgba(255,255,255,0.6)]">描述</Label>
            <p className="text-white mt-1">{formData.description || '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[rgba(255,255,255,0.6)]">分类</Label>
              <p className="text-white mt-1">{formData.category}</p>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.6)]">年龄范围</Label>
              <p className="text-white mt-1">{formData.min_age} - {formData.max_age}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[rgba(255,255,255,0.6)]">权重</Label>
              <p className="text-white mt-1">{formData.base_weight.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-[rgba(255,255,255,0.6)]">难度等级</Label>
              <p className="text-white mt-1">{(formData.difficulty_level * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div>
            <Label className="text-[rgba(255,255,255,0.6)]">状态</Label>
            <p className="text-white mt-1">{formData.is_active ? '启用' : '停用'}</p>
          </div>
          {Object.keys(formData.content).length > 0 && (
            <div>
              <Label className="text-[rgba(255,255,255,0.6)]">内容配置</Label>
              <pre className="mt-1 bg-[#151A3A] p-3 rounded text-sm text-[rgba(255,255,255,0.8)] overflow-x-auto">
                {JSON.stringify(formData.content, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
