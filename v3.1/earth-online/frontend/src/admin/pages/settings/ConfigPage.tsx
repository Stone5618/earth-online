import { useEffect, useState } from 'react';
import { adminApi } from '@/admin/api/adminApi';
import type { SystemConfig } from '@/admin/types/admin';
import { usePermission } from '@/admin/hooks/usePermission';
import { useAuthStore } from '@/admin/stores/authStore';
import { useKeyboardShortcut } from '@/admin/hooks/useKeyboardShortcut';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Plus, Edit, Trash2, Settings, Search, Braces, Minimize2, CheckCircle2, AlertCircle, Save, X, Check, RotateCcw } from 'lucide-react';

const tryFormatJson = (value: string): string => {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
};

const tryMinifyJson = (value: string): string => {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed);
  } catch {
    return value;
  }
};

const isValidJson = (value: string): boolean => {
  if (!value.startsWith('{') && !value.startsWith('[')) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

interface ConfigFormData {
  key: string;
  value: string;
  category: string;
  description: string;
  is_active: boolean;
}

const emptyForm: ConfigFormData = {
  key: '',
  value: '',
  category: 'general',
  description: '',
  is_active: true,
};

export function ConfigPage() {
  const { hasPermission } = usePermission();
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<ConfigFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ category: '', is_active: '' as string | undefined });
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [inlineEditingValue, setInlineEditingValue] = useState('');
  const [batchChanges, setBatchChanges] = useState<Record<string, string>>({});

  const canManage = hasPermission('system:config') || useAuthStore.getState().user?.is_superuser;

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.is_active !== '') params.is_active = filters.is_active === 'true';

      const { data } = await adminApi.config.list(params);
      setConfigs(data.configs);
      setBatchChanges({});
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const openCreateDialog = () => {
    setFormData({ ...emptyForm });
    setShowCreateDialog(true);
  };

  const openEditDialog = (config: SystemConfig) => {
    setFormData({
      key: config.key,
      value: config.value,
      category: config.category,
      description: config.description ?? '',
      is_active: config.is_active,
    });
    setEditingId(config.id);
    setShowEditDialog(true);
  };

  const handleCreate = async () => {
    if (!formData.key || !formData.value) {
      toast.error('请填写键名和键值');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.config.create(formData);
      toast.success('配置已创建');
      setShowCreateDialog(false);
      await fetchConfigs();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.key || !formData.value || editingId === null) {
      toast.error('请填写完整信息');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.config.update(editingId, formData);
      toast.success('配置已更新');
      setShowEditDialog(false);
      await fetchConfigs();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (config: SystemConfig) => {
    try {
      await adminApi.config.delete(config.key);
      toast.success('配置已删除');
      await fetchConfigs();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '删除失败，请重试');
    }
  };

  const startInlineEdit = (config: SystemConfig) => {
    setInlineEditingId(config.id);
    setInlineEditingValue(config.value);
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineEditingValue('');
  };

  const saveInlineEdit = async (config: SystemConfig) => {
    try {
      await adminApi.config.update(config.id, {
        key: config.key,
        value: inlineEditingValue,
        category: config.category,
        description: config.description ?? '',
        is_active: config.is_active,
      });
      toast.success(`${config.key} 已更新`);
      setInlineEditingId(null);
      setInlineEditingValue('');
      await fetchConfigs();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '更新失败');
    }
  };

  const markBatchChange = (key: string, value: string) => {
    setBatchChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleBatchSave = async () => {
    const changes = Object.entries(batchChanges);
    if (changes.length === 0) {
      toast.error('没有待保存的更改');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.config.batchUpdate(
        changes.map(([key, value]) => ({ key, value }))
      );
      toast.success(`${changes.length} 个配置已更新`);
      setBatchChanges({});
      await fetchConfigs();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '批量更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilter = () => {
    fetchConfigs();
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
        <p className="text-sm">需要 system:config 权限</p>
      </div>
    );
  }

  const changedCount = Object.keys(batchChanges).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-orbitron">系统配置</h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">管理系统运行参数</p>
        </div>
        <div className="flex items-center gap-2">
          {changedCount > 0 && (
            <Button onClick={handleBatchSave} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              保存 {changedCount} 个更改
            </Button>
          )}
          <Button onClick={openCreateDialog} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
            <Plus className="w-4 h-4 mr-2" />
            新建配置
          </Button>
        </div>
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
            <option value="general">通用</option>
            <option value="game">游戏</option>
            <option value="auth">认证</option>
            <option value="notification">通知</option>
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
              <TableHead className="text-[rgba(255,255,255,0.6)]">键名</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">键值（双击编辑）</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">分类</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">描述</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">状态</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-[rgba(0,210,255,0.15)]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20 bg-[#151A3A]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[rgba(255,255,255,0.4)] py-8">
                  暂无配置数据
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config.id} className={`border-[rgba(0,210,255,0.15)] hover:bg-[#151A3A]/50 ${batchChanges[config.key] !== undefined ? 'bg-yellow-500/5' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[rgba(0,210,255,0.6)]" />
                      <span className="text-white font-mono text-sm">{config.key}</span>
                      {batchChanges[config.key] !== undefined && (
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">已修改</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {inlineEditingId === config.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={inlineEditingValue}
                          onChange={(e) => setInlineEditingValue(e.target.value)}
                          className="bg-[#151A3A] border-[rgba(0,210,255,0.3)] text-white font-mono text-sm h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveInlineEdit(config);
                            if (e.key === 'Escape') cancelInlineEdit();
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => saveInlineEdit(config)} className="bg-green-600 hover:bg-green-700 text-white h-8 px-2">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelInlineEdit} className="text-gray-400 h-8 px-2">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="text-[rgba(255,255,255,0.6)] truncate cursor-pointer hover:text-white transition-colors"
                        title="双击编辑"
                        onDoubleClick={() => startInlineEdit(config)}
                      >
                        {batchChanges[config.key] !== undefined ? batchChanges[config.key] : config.value}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {config.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.5)] text-sm max-w-xs truncate">
                    {config.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={config.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {config.is_active ? '启用' : '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(config)} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(config)} className="text-[rgba(255,255,255,0.6)] hover:text-red-400">
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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white">
          <DialogHeader>
            <DialogTitle>新建配置</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">
              添加新的系统配置参数
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>键名</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white font-mono"
                placeholder="如：max_login_attempts"
              />
            </div>
            <div className="space-y-2">
              <Label>键值</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, value: tryFormatJson(formData.value) })}
                    className="text-xs h-7 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-[rgba(255,255,255,0.6)] hover:text-white"
                  >
                    <Braces className="w-3 h-3 mr-1" />
                    格式化
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, value: tryMinifyJson(formData.value) })}
                    className="text-xs h-7 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-[rgba(255,255,255,0.6)] hover:text-white"
                  >
                    <Minimize2 className="w-3 h-3 mr-1" />
                    压缩
                  </Button>
                  {formData.value && (isValidJson(formData.value) ? (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> JSON 格式有效
                    </span>
                  ) : formData.value.startsWith('{') || formData.value.startsWith('[') ? (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> JSON 格式无效
                    </span>
                  ) : null)}
                </div>
                <Textarea
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white font-mono"
                  placeholder="配置值（支持 JSON 格式）"
                  rows={5}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>分类</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  <SelectItem value="general">通用</SelectItem>
                  <SelectItem value="game">游戏</SelectItem>
                  <SelectItem value="auth">认证</SelectItem>
                  <SelectItem value="notification">通知</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="配置说明"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>启用配置</Label>
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white">
          <DialogHeader>
            <DialogTitle>编辑配置</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">
              修改 {formData.key} 的配置值
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>键名</Label>
              <Input
                value={formData.key}
                disabled
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white font-mono opacity-60"
              />
            </div>
            <div className="space-y-2">
              <Label>键值</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, value: tryFormatJson(formData.value) })}
                    className="text-xs h-7 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-[rgba(255,255,255,0.6)] hover:text-white"
                  >
                    <Braces className="w-3 h-3 mr-1" />
                    格式化
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, value: tryMinifyJson(formData.value) })}
                    className="text-xs h-7 bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-[rgba(255,255,255,0.6)] hover:text-white"
                  >
                    <Minimize2 className="w-3 h-3 mr-1" />
                    压缩
                  </Button>
                  {formData.value && (isValidJson(formData.value) ? (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> JSON 格式有效
                    </span>
                  ) : formData.value.startsWith('{') || formData.value.startsWith('[') ? (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> JSON 格式无效
                    </span>
                  ) : null)}
                </div>
                <Textarea
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white font-mono"
                  rows={5}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>分类</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  <SelectItem value="general">通用</SelectItem>
                  <SelectItem value="game">游戏</SelectItem>
                  <SelectItem value="auth">认证</SelectItem>
                  <SelectItem value="notification">通知</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="配置说明"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>启用配置</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button onClick={handleUpdate} disabled={submitting} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
              {submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
