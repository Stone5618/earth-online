import { useEffect, useState } from 'react';
import { adminApi } from '@/admin/api/adminApi';
import type { AdminUserDetail, AdminRole } from '@/admin/types/admin';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, Lock, Unlock, Key, UserPlus, Edit, CheckSquare, XSquare } from 'lucide-react';
import { formatDate } from '@/admin/utils/dateFormat';

export function UserListPage() {
  const { hasPermission } = usePermission();
  const [users, setUsers] = useState<AdminUserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createData, setCreateData] = useState({ username: '', password: '', is_superuser: false, role_id: undefined as number | undefined });
  const [roles, setRoles] = useState<Array<{ id: number; name: string; display_name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [targetUser, setTargetUser] = useState<AdminUserDetail | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [editRoleData, setEditRoleData] = useState({ role_id: undefined as number | undefined, is_superuser: false });
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const canManage = hasPermission('system:user') || useAuthStore.getState().user?.is_superuser;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.users.list({ skip: pagination.skip, limit: pagination.limit });
      setUsers(Array.isArray(data.users) ? data.users : []);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await adminApi.roles.list();
      const rolesData = Array.isArray(data.roles) ? data.roles : [];
      setRoles(rolesData.map((r: AdminRole) => ({ id: r.id, name: r.name, display_name: r.display_name })));
    } catch {
      // silently ignore
    }
  };

  useEffect(() => { fetchUsers(); }, [pagination.skip, pagination.limit]);
  useEffect(() => { fetchRoles(); }, []);

  const handlePageChange = (newSkip: number) => {
    setPagination((prev) => ({ ...prev, skip: newSkip }));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length && users.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleBatchActivate = async (activate: boolean) => {
    setBatchSubmitting(true);
    try {
      await adminApi.users.batchUpdate({ user_ids: [...selectedIds], is_active: activate });
      toast.success(`已${activate ? '启用' : '停用'} ${selectedIds.size} 个用户`);
      setSelectedIds(new Set());
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '批量操作失败');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleBatchLock = async (lock: boolean) => {
    setBatchSubmitting(true);
    try {
      await adminApi.users.batchUpdate({ user_ids: [...selectedIds], is_locked: lock });
      toast.success(`已${lock ? '锁定' : '解锁'} ${selectedIds.size} 个用户`);
      setSelectedIds(new Set());
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '批量操作失败');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!createData.username || !createData.password) {
      toast.error('请输入用户名和密码');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.users.create(createData);
      toast.success('用户已创建');
      setShowCreateDialog(false);
      setCreateData({ username: '', password: '', is_superuser: false, role_id: undefined });
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: AdminUserDetail) => {
    try {
      await adminApi.users.update(user.id, { is_active: !user.is_active, role_id: user.role_id || undefined });
      toast.success(`已${user.is_active ? '停用' : '启用'}用户`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '操作失败，请重试');
    }
  };

  const handleLock = async (user: AdminUserDetail) => {
    try {
      await adminApi.users.lock(user.id, !user.is_locked);
      toast.success(`已${user.is_locked ? '解锁' : '锁定'}用户`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '操作失败，请重试');
    }
  };

  const openResetDialog = (user: AdminUserDetail) => {
    setTargetUser(user);
    setNewPassword('');
    setShowResetDialog(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('密码至少6位');
      return;
    }
    if (!targetUser) return;
    try {
      await adminApi.users.resetPassword(targetUser.id, newPassword);
      toast.success('密码已重置');
      setShowResetDialog(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '重置密码失败');
    }
  };

  const openEditDialog = (user: AdminUserDetail) => {
    setTargetUser(user);
    setEditRoleData({ role_id: user.role_id ?? undefined, is_superuser: user.is_superuser });
    setShowEditDialog(true);
  };

  const handleEditUser = async () => {
    if (!targetUser) return;
    try {
      const updateData: Record<string, any> = {};
      // Only send role_id if it actually changed
      if (editRoleData.role_id !== targetUser.role_id) {
        updateData.role_id = editRoleData.role_id ?? null;
      }
      // Only send is_superuser if it actually changed
      if (editRoleData.is_superuser !== targetUser.is_superuser) {
        updateData.is_superuser = editRoleData.is_superuser;
      }
      // Don't send empty updates
      if (Object.keys(updateData).length === 0) {
        toast.info('没有修改任何内容');
        setShowEditDialog(false);
        return;
      }
      await adminApi.users.update(targetUser.id, updateData);
      toast.success('用户已更新');
      setShowEditDialog(false);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '更新失败，请重试');
    }
  };

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
        <h1 className="text-2xl font-bold text-white font-orbitron">管理员管理</h1>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">管理后台用户账号</p>
      </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={batchSubmitting}
                onClick={() => handleBatchActivate(true)}
                className="border-green-500/30 bg-transparent text-green-400 hover:bg-green-500/10"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                批量启用
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={batchSubmitting}
                onClick={() => handleBatchActivate(false)}
                className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
              >
                <XSquare className="w-4 h-4 mr-1" />
                批量停用
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={batchSubmitting}
                onClick={() => handleBatchLock(true)}
                className="border-yellow-500/30 bg-transparent text-yellow-400 hover:bg-yellow-500/10"
              >
                <Lock className="w-4 h-4 mr-1" />
                批量锁定
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={batchSubmitting}
                onClick={() => handleBatchLock(false)}
                className="border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10"
              >
                <Unlock className="w-4 h-4 mr-1" />
                批量解锁
              </Button>
              <span className="text-sm text-[rgba(255,255,255,0.4)] ml-2">
                已选 {selectedIds.size} 项
              </span>
            </>
          )}
          <Button onClick={() => setShowCreateDialog(true)} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
            <UserPlus className="w-4 h-4 mr-2" />
            新建用户
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[rgba(0,210,255,0.15)] hover:bg-transparent">
              <TableHead className="text-[rgba(255,255,255,0.6)] w-10">
                <Checkbox
                  checked={users.length > 0 && selectedIds.size === users.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">用户名</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">角色</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">状态</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">最后登录</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">登录IP</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">创建时间</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-[rgba(0,210,255,0.15)]">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20 bg-[#151A3A]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-[rgba(255,255,255,0.4)] py-8">
                  暂无用户数据
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-[rgba(0,210,255,0.15)] hover:bg-[#151A3A]/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={() => toggleSelect(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{user.username}</span>
                      {user.is_superuser && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">超级管理员</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.6)]">
                    {user.role_display_name || (
                      <span className="text-[rgba(255,255,255,0.3)] italic">未分配</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={user.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                        {user.is_active ? '活跃' : '停用'}
                      </Badge>
                      {user.is_locked && <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">已锁定</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.5)] text-sm">
                    {user.last_login_at ? formatDate(user.last_login_at) : '从未登录'}
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.5)] text-sm font-mono">
                    {user.login_ip ? user.login_ip.replace(/\.(\d+)\.(\d+)$/, '.xxx.xxx') : '—'}
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.5)] text-sm">
                    {formatDate(user.created_at, 'date')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openResetDialog(user)} className="text-[rgba(255,255,255,0.6)] hover:text-yellow-400">
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleActive(user)} className="text-[rgba(255,255,255,0.6)] hover:text-[#00D2FF]">
                        {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleLock(user)} className="text-[rgba(255,255,255,0.6)] hover:text-yellow-400">
                        {user.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white">
          <DialogHeader>
            <DialogTitle>编辑管理员</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">
              修改 {targetUser?.username} 的角色和权限
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={editRoleData.role_id ? String(editRoleData.role_id) : ''}
                onValueChange={(v) => setEditRoleData({ ...editRoleData, role_id: v ? parseInt(v) : undefined })}
              >
                <SelectTrigger className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editRoleData.is_superuser}
                onCheckedChange={(v) => setEditRoleData({ ...editRoleData, is_superuser: v })}
              />
              <Label>超级管理员</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button onClick={handleEditUser} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">
              为 {targetUser?.username} 设置新密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>新密码</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="至少6位"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowResetDialog(false)}>取消</Button>
            <Button onClick={handleResetPassword} className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
              重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white">
          <DialogHeader>
            <DialogTitle>新建管理员用户</DialogTitle>
            <DialogDescription className="text-[rgba(255,255,255,0.5)]">
              创建新的管理后台账号
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>用户名</Label>
              <Input
                value={createData.username}
                onChange={(e) => setCreateData({ ...createData, username: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label>密码</Label>
              <Input
                type="password"
                value={createData.password}
                onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                placeholder="输入密码"
              />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                onValueChange={(v) => setCreateData({ ...createData, role_id: v ? parseInt(v) : undefined })}
              >
                <SelectTrigger className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={createData.is_superuser}
                onCheckedChange={(v) => setCreateData({ ...createData, is_superuser: v })}
              />
              <Label>超级管理员</Label>
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
    </div>
  );
}
