import { useEffect, useState } from 'react';
import { adminApi } from '@/admin/api/adminApi';
import type { AdminRole } from '@/admin/types/admin';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, Edit, Trash2, Plus, Users, KeyRound } from 'lucide-react';
import type { AdminPermission } from '@/admin/types/admin';

function RoleBadge({ role }: { role: AdminRole }) {
  const colorMap: Record<string, string> = {
    super_admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    operator: 'bg-green-500/20 text-green-400 border-green-500/30',
    support: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  const cls = colorMap[role.name] ?? 'bg-[#00D2FF]/20 text-[#00D2FF] border-[#00D2FF]/30';
  return (
    <Badge variant="outline" className={`${cls} font-medium`}>
      {role.display_name}
    </Badge>
  );
}

export function RoleListPage() {
  const { hasPermission } = usePermission();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [formData, setFormData] = useState({ name: '', display_name: '', description: '', level: 50 });
  const [submitting, setSubmitting] = useState(false);
  const [showPermDialog, setShowPermDialog] = useState(false);
  const [targetRole, setTargetRole] = useState<AdminRole | null>(null);
  const [allPermissions, setAllPermissions] = useState<AdminPermission[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [permLoading, setPermLoading] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.roles.list({ skip: pagination.skip, limit: pagination.limit });
      setRoles(Array.isArray(data.roles) ? data.roles : []);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [pagination.skip, pagination.limit]);

  const handleOpenDialog = (role?: AdminRole) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, display_name: role.display_name, description: role.description ?? '', level: role.level });
    } else {
      setEditingRole(null);
      setFormData({ name: '', display_name: '', description: '', level: 0 });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.display_name) {
      toast.error('请输入角色名称');
      return;
    }
    setSubmitting(true);
    try {
      if (editingRole) {
        await adminApi.roles.update(editingRole.id, { display_name: formData.display_name, description: formData.description, level: formData.level });
        toast.success('角色已更新');
      } else {
        if (!formData.name) { toast.error('请输入角色标识'); return; }
        await adminApi.roles.create(formData);
        toast.success('角色已创建');
      }
      setShowDialog(false);
      await fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: AdminRole) => {
    if (role.user_count && role.user_count > 0) {
      toast.error(`该角色下有 ${role.user_count} 个用户，无法删除`);
      return;
    }
    try {
      await adminApi.roles.delete(role.id);
      toast.success('角色已删除');
      await fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '删除失败，请重试');
    }
  };

  const openPermDialog = async (role: AdminRole) => {
    setTargetRole(role);
    setPermLoading(true);
    setShowPermDialog(true);
    try {
      const { data: perms } = await adminApi.permissions.list();
      setAllPermissions(perms);
      const selected = new Set<string>(role.permissions ?? []);
      setSelectedPerms(selected);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载权限列表失败');
    } finally {
      setPermLoading(false);
    }
  };

  const togglePerm = (code: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectAllModule = (module: string) => {
    const modulePerms = allPermissions.filter(p => p.module === module);
    const newSelected = new Set(selectedPerms);
    modulePerms.forEach(p => newSelected.add(p.code));
    setSelectedPerms(newSelected);
  };

  const deselectAllModule = (module: string) => {
    const modulePerms = allPermissions.filter(p => p.module === module);
    const newSelected = new Set(selectedPerms);
    modulePerms.forEach(p => newSelected.delete(p.code));
    setSelectedPerms(newSelected);
  };

  const handleSavePermissions = async () => {
    if (!targetRole) return;
    setSavingPerms(true);
    try {
      await adminApi.roles.assignPermissions(targetRole.id, Array.from(selectedPerms));
      toast.success('权限已更新');
      setShowPermDialog(false);
      await fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '权限保存失败');
    } finally {
      setSavingPerms(false);
    }
  };

  const modules = [...new Set(allPermissions.map(p => p.module))];

  const canManage = hasPermission('system:user') || useAuthStore.getState().user?.is_superuser;

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[rgba(255,255,255,0.5)]">
        <Shield className="w-16 h-16 mb-4" />
        <p className="text-lg">权限不足</p>
        <p className="text-sm">需要 system:user 权限</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-orbitron">角色管理</h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">管理管理后台角色和权限</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
          <Plus className="w-4 h-4 mr-2" />
          新建角色
        </Button>
      </div>

      <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[rgba(0,210,255,0.15)] hover:bg-transparent">
              <TableHead className="text-[rgba(255,255,255,0.6)]">标识</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">显示名称</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">权限数</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">用户数</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">权限等级</TableHead>
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
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[rgba(255,255,255,0.4)] py-8">
                  暂无角色数据
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} className="border-[rgba(0,210,255,0.15)] hover:bg-[#151A3A]/50">
                  <TableCell className="font-mono text-[#00D2FF]">{role.name}</TableCell>
                  <TableCell><RoleBadge role={role} /></TableCell>
                  <TableCell className="text-white">{role.permission_count ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-white">
                      <Users className="w-3 h-3 text-[rgba(255,255,255,0.4)]" />
                      {role.user_count ?? 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{role.level}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openPermDialog(role)} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]" title="管理权限">
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(role)} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]" title="编辑角色">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(role)} className="text-[rgba(255,255,255,0.6)] hover:text-red-400" title="删除角色">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white">
          <DialogHeader>
            <DialogTitle>{editingRole ? '编辑角色' : '新建角色'}</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">
              {editingRole ? '修改角色的基本信息' : '创建一个新的管理角色'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标识{!editingRole && <span className="text-red-400">*</span>}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingRole}
                placeholder="如: admin"
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>显示名称<span className="text-red-400">*</span></Label>
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="如: 管理员"
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="角色描述"
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>权限等级</Label>
              <Input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
              />
              <p className="text-xs text-[rgba(255,255,255,0.4)]">数字越大权限越高</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
              {submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission assignment dialog */}
      <Dialog open={showPermDialog} onOpenChange={setShowPermDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>管理权限 — {targetRole?.display_name}</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">
              选择此角色拥有的权限（按模块分组）
            </DialogDescription>
          </DialogHeader>

          {permLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full bg-[#151A3A]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {modules.map(module => {
                const modulePerms = allPermissions.filter(p => p.module === module);
                const moduleSelected = modulePerms.filter(p => selectedPerms.has(p.code));
                const allSelected = moduleSelected.length === modulePerms.length && modulePerms.length > 0;
                const someSelected = moduleSelected.length > 0 && !allSelected;

                return (
                  <div key={module} className="rounded-lg border border-[rgba(0,210,255,0.1)] bg-[#151A3A]/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => {
                            if (allSelected) {
                              deselectAllModule(module);
                            } else {
                              selectAllModule(module);
                            }
                          }}
                          className="border-[rgba(0,210,255,0.3)] data-[state=checked]:bg-[#00D2FF] data-[state=checked]:border-[#00D2FF]"
                        />
                        <span className="text-sm font-medium text-white">{module}</span>
                        <span className="text-xs text-[rgba(255,255,255,0.4)]">({moduleSelected.length}/{modulePerms.length})</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      {modulePerms.map(perm => (
                        <label key={perm.code} className="flex items-center gap-2 cursor-pointer group">
                          <Checkbox
                            checked={selectedPerms.has(perm.code)}
                            onCheckedChange={() => togglePerm(perm.code)}
                            className="border-[rgba(0,210,255,0.3)] data-[state=checked]:bg-[#00D2FF] data-[state=checked]:border-[#00D2FF]"
                          />
                          <span className="text-xs text-[rgba(255,255,255,0.6)] group-hover:text-white transition-colors">
                            {perm.description ?? perm.action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPermDialog(false)}>取消</Button>
            <Button onClick={handleSavePermissions} disabled={savingPerms || permLoading} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
              {savingPerms ? '保存中...' : '保存权限'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
