import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/admin/api/adminApi';
import { usePermission } from '@/admin/hooks/usePermission';
import { useAuthStore } from '@/admin/stores/authStore';
import { AdminPagination } from '@/admin/components/AdminPagination';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Search, Users, Ban, ShieldOff, Eye, Edit2, Trash2, Archive, KeyRound, FileText, Pencil, CheckSquare, XSquare } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/admin/utils/dateFormat';

interface PlayerItem {
  id: number;
  username: string;
  display_name: string | null;
  is_active: boolean;
  is_banned: boolean;
  login_ip: string | null;
  last_login_at: string | null;
  created_at: string | null;
  remark: string | null;
  tags: string[];
  character_count: number;
  alive_characters: number;
  dead_characters: number;
  main_character: {
    id: number;
    name: string;
    age: number;
    is_alive: boolean;
  } | null;
}

const TAG_OPTIONS = [
  { value: 'vip', label: 'VIP', color: '#F59E0B' },
  { value: 'report', label: '举报', color: '#EF4444' },
  { value: 'watch', label: '关注', color: '#3B82F6' },
  { value: 'whitelist', label: '白名单', color: '#10B981' },
  { value: 'internal', label: '内部测试', color: '#8B5CF6' },
  { value: 'abuse', label: '滥用', color: '#F97316' },
];

const AVAILABLE_TAGS = TAG_OPTIONS.map(t => t.value);

export function PlayerListPage() {
  const { hasPermission } = usePermission();
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banFilter, setBanFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  // Edit dialog state
  const [editPlayer, setEditPlayer] = useState<PlayerItem | null>(null);
  const [editRemark, setEditRemark] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  // Reset password dialog
  const [resetPlayer, setResetPlayer] = useState<PlayerItem | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Save management dialog
  const [savesPlayer, setSavesPlayer] = useState<PlayerItem | null>(null);
  const [playerSaves, setPlayerSaves] = useState<any[]>([]);
  const [savesLoading, setSavesLoading] = useState(false);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ban' | 'unban' | 'deleteSave';
    player: PlayerItem;
    saveId?: number;
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, [pagination.skip, pagination.limit, search, banFilter]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.players.list({
        skip: pagination.skip,
        limit: pagination.limit,
        search: search || undefined,
        is_banned: banFilter === 'all' ? undefined : banFilter === '1',
      });
      setPlayers(data.items || []);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载玩家列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (player: PlayerItem) => {
    if (player.is_banned) {
      setConfirmAction({
        type: 'unban',
        player,
        title: '解封玩家',
        message: `确定要解封玩家 "${player.username}" 吗？解封后该玩家将可以正常登录游戏。`,
      });
    } else {
      setConfirmAction({
        type: 'ban',
        player,
        title: '封禁玩家',
        message: `确定要封禁玩家 "${player.username}" 吗？封禁后该玩家将无法登录游戏。`,
      });
    }
  };

  const executeBanAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'unban') {
        await adminApi.players.unban(confirmAction.player.id);
        toast.success('玩家已解封');
      } else {
        await adminApi.players.ban(confirmAction.player.id);
        toast.success('玩家已封禁');
      }
      setConfirmAction(null);
      await fetchPlayers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '操作失败');
    }
  };

  const openEditDialog = (player: PlayerItem) => {
    setEditPlayer(player);
    setEditRemark(player.remark || '');
    setEditTags(player.tags || []);
  };

  const handleEditPlayer = async () => {
    if (!editPlayer) return;
    try {
      await adminApi.players.edit(editPlayer.id, { remark: editRemark || undefined, tags: editTags });
      toast.success('玩家信息已更新');
      setEditPlayer(null);
      await fetchPlayers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '更新失败');
    }
  };

  const toggleTag = (tag: string) => {
    setEditTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const openSavesDialog = async (player: PlayerItem) => {
    setSavesPlayer(player);
    setSavesLoading(true);
    try {
      const { data } = await adminApi.players.getSaves(player.id);
      setPlayerSaves(data.saves || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载存档失败');
      setPlayerSaves([]);
    } finally {
      setSavesLoading(false);
    }
  };

  const handleDeleteSave = async (saveId: number) => {
    if (!savesPlayer) return;
    setConfirmAction({
      type: 'deleteSave',
      player: savesPlayer,
      saveId,
      title: '删除存档',
      message: `确定要删除存档 #${saveId} 吗？此操作不可撤销，存档数据将永久丢失。`,
    });
  };

  const executeDeleteSave = async () => {
    if (!confirmAction || confirmAction.type !== 'deleteSave' || !savesPlayer) return;
    try {
      await adminApi.players.deleteSave(savesPlayer.id, confirmAction.saveId!);
      toast.success('存档已删除');
      setConfirmAction(null);
      await openSavesDialog(savesPlayer);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '删除存档失败');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPlayer || !newPassword.trim()) {
      toast.error('请输入新密码');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('密码至少 6 个字符');
      return;
    }
    try {
      const response = await adminApi.players.resetPassword(resetPlayer.id, newPassword.trim());
      toast.success('密码已重置');
      setResetPlayer(null);
      setNewPassword('');
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error(err?.response?.data?.detail ?? '重置密码失败');
    }
  };

  const canManage = hasPermission('system:user') || useAuthStore.getState().user?.is_superuser;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === players.length && players.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(players.map((p) => p.id)));
    }
  };

  const handleBatchBan = async (ban: boolean) => {
    setBatchSubmitting(true);
    try {
      await adminApi.players.batchBan([...selectedIds], ban);
      toast.success(`已${ban ? '封禁' : '解封'} ${selectedIds.size} 个玩家`);
      setSelectedIds(new Set());
      fetchPlayers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '批量操作失败');
    } finally {
      setBatchSubmitting(false);
    }
  };

  if (!canManage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ShieldOff className="mx-auto h-12 w-12 text-[rgba(255,255,255,0.3)] mb-4" />
          <p className="text-lg font-semibold" style={{ color: '#fff' }}>权限不足</p>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            您没有权限查看玩家管理页面
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>玩家管理</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            管理游戏玩家账号、存档和游戏数据
          </p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={batchSubmitting}
              onClick={() => handleBatchBan(true)}
              className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
            >
              <Ban className="w-4 h-4 mr-1" />
              批量封禁
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={batchSubmitting}
              onClick={() => handleBatchBan(false)}
              className="border-green-500/30 bg-transparent text-green-400 hover:bg-green-500/10"
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              批量解封
            </Button>
            <span className="text-sm text-[rgba(255,255,255,0.4)]">
              已选 {selectedIds.size} 项
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-[rgba(255,255,255,0.6)] text-sm">搜索玩家</Label>
          <div className="flex gap-2">
            <Input
              placeholder="输入用户名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPlayers()}
              className="border-[rgba(0,210,255,0.2)] bg-[rgba(21,26,58,0.5)] text-white placeholder:text-[rgba(255,255,255,0.3)]"
            />
            <Button onClick={fetchPlayers} className="shrink-0 bg-[#00D2FF] text-[#0D1128] hover:bg-[#00B8E6]">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[rgba(255,255,255,0.6)] text-sm">封禁状态</Label>
          <Select value={banFilter} onValueChange={(v) => { setBanFilter(v); setPagination((p) => ({ ...p, skip: 0 })); }}>
            <SelectTrigger className="border-[rgba(0,210,255,0.2)] bg-[rgba(21,26,58,0.5)] text-white">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#151A3A', borderColor: 'rgba(0,210,255,0.15)' }}>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="0">正常</SelectItem>
              <SelectItem value="1">已封禁</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-[rgba(0,210,255,0.15)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[rgba(0,210,255,0.15)] hover:bg-transparent">
              <TableHead className="text-[rgba(255,255,255,0.6)] w-10">
                <Checkbox
                  checked={players.length > 0 && selectedIds.size === players.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">用户名</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">游戏角色</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">状态</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">最后登录</TableHead>
              <TableHead className="text-[rgba(255,255,255,0.6)]">备注</TableHead>
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
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-[rgba(255,255,255,0.4)] py-8">
                  暂无玩家数据
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id} className="border-[rgba(0,210,255,0.08)] hover:bg-[rgba(0,210,255,0.03)]">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(player.id)}
                      onCheckedChange={() => toggleSelect(player.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[rgba(0,210,255,0.6)]" />
                      <div>
                        <span className="font-medium" style={{ color: '#fff' }}>{player.username}</span>
                        {player.display_name && player.display_name !== player.username && (
                          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>({player.display_name})</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {player.main_character ? (
                      <div className="space-y-0.5">
                        <span className="text-sm" style={{ color: '#00D2FF' }}>
                          {player.main_character.name}
                        </span>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {player.character_count}个角色 · {player.alive_characters}存活 · {player.dead_characters}死亡
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>无角色</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {player.is_banned ? (
                        <Badge variant="destructive" className="text-xs">已封禁</Badge>
                      ) : (
                        <Badge className="text-xs bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)]">
                          正常
                        </Badge>
                      )}
                      {(player.tags || []).map(tag => {
                        const tagOpt = TAG_OPTIONS.find(t => t.value === tag);
                        if (!tagOpt) return null;
                        return (
                          <Badge key={tag} className="text-xs" style={{ backgroundColor: tagOpt.color + '22', color: tagOpt.color, borderColor: tagOpt.color + '44' }}>
                            {tagOpt.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.5)] text-sm">
                    {player.last_login_at ? formatDate(player.last_login_at) : '从未登录'}
                  </TableCell>
                  <TableCell className="text-[rgba(255,255,255,0.4)] text-xs max-w-[150px] truncate">
                    {player.remark || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/players/${player.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[rgba(255,255,255,0.5)] hover:text-[#00D2FF]" title="查看详情">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[rgba(255,255,255,0.5)] hover:text-[#00D2FF]"
                        onClick={() => openEditDialog(player)}
                        title="编辑信息"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[rgba(255,255,255,0.5)] hover:text-yellow-400"
                        onClick={() => { setResetPlayer(player); setNewPassword(''); }}
                        title="重置密码"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[rgba(255,255,255,0.5)] hover:text-[#00D2FF]"
                        onClick={() => openSavesDialog(player)}
                        title="存档管理"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[rgba(255,255,255,0.5)] hover:text-red-400"
                        onClick={() => handleBan(player)}
                        title={player.is_banned ? '解封' : '封禁'}
                      >
                        {player.is_banned ? (
                          <ShieldOff className="w-3.5 h-3.5" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
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
        onSkipChange={(skip) => setPagination((p) => ({ ...p, skip }))}
      />

      {/* Edit Player Dialog */}
      <Dialog open={!!editPlayer} onOpenChange={() => setEditPlayer(null)}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-lg" aria-describedby="edit-player-desc">
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#fff' }}>
              编辑玩家信息
            </DialogTitle>
            <DialogDescription id="edit-player-desc" className="text-[rgba(255,255,255,0.5)]">
              修改玩家的备注和标签信息。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editPlayer && (
              <>
                <div>
                  <Label className="text-[rgba(255,255,255,0.6)] text-sm">玩家ID</Label>
                  <div className="mt-1 px-3 py-2 rounded-md bg-[#151A3A] text-sm text-[rgba(255,255,255,0.5)]">
                    #{editPlayer.id} · {editPlayer.username}
                  </div>
                </div>
                <div>
                  <Label className="text-[rgba(255,255,255,0.6)] text-sm">备注</Label>
                  <Input
                    value={editRemark}
                    onChange={(e) => setEditRemark(e.target.value)}
                    placeholder="输入备注信息..."
                    className="mt-1 border-[rgba(0,210,255,0.2)] bg-[#151A3A] text-white placeholder:text-[rgba(255,255,255,0.3)]"
                  />
                </div>
                <div>
                  <Label className="text-[rgba(255,255,255,0.6)] text-sm">标签</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TAG_OPTIONS.map(tag => (
                      <button
                        key={tag.value}
                        onClick={() => toggleTag(tag.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                          editTags.includes(tag.value)
                            ? 'text-white'
                            : 'text-[rgba(255,255,255,0.3)] border-transparent bg-[rgba(255,255,255,0.05)]'
                        }`}
                        style={editTags.includes(tag.value) ? {
                          backgroundColor: tag.color + '33',
                          color: tag.color,
                          borderColor: tag.color + '66',
                        } : {}}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlayer(null)} className="border-[rgba(0,210,255,0.2)] bg-transparent text-white hover:bg-[rgba(0,210,255,0.1)]">
              取消
            </Button>
            <Button onClick={handleEditPlayer} className="bg-[#00D2FF] text-[#0D1128] hover:bg-[#00B8E6]">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPlayer} onOpenChange={() => { setResetPlayer(null); setNewPassword(''); }}>
        <DialogContent className="bg-[#0D1128] border-[rgba(250,204,21,0.15)] text-white max-w-sm" aria-describedby="reset-password-desc">
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#FACC15' }}>
              重置玩家密码
            </DialogTitle>
            <DialogDescription id="reset-password-desc" className="text-[rgba(255,255,255,0.5)]">
              为玩家设置新密码，此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {resetPlayer && (
              <>
                <div className="p-3 rounded-md bg-[rgba(250,204,21,0.1)] border border-[rgba(250,204,21,0.2)]">
                  <p className="text-sm text-[rgba(255,255,255,0.8)]">
                    为 <span className="font-semibold" style={{ color: '#fff' }}>{resetPlayer.username}</span> 设置新密码
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    ⚠️ 此操作仅用于开发测试，请勿随意使用
                  </p>
                </div>
                <div>
                  <Label className="text-[rgba(255,255,255,0.6)] text-sm">新密码</Label>
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="输入新密码..."
                    type="password"
                    className="mt-1 border-[rgba(250,204,21,0.3)] bg-[#151A3A] text-white placeholder:text-[rgba(255,255,255,0.3)]"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetPlayer(null); setNewPassword(''); }} className="border-[rgba(0,210,255,0.2)] bg-transparent text-white hover:bg-[rgba(0,210,255,0.1)]">
              取消
            </Button>
            <Button onClick={handleResetPassword} className="bg-[#FACC15] text-[#0D1128] hover:bg-[#EAB308]">
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saves Management Dialog */}
      <Dialog open={!!savesPlayer} onOpenChange={() => setSavesPlayer(null)}>
        <DialogContent className="bg-[#0D1128] border-[rgba(0,210,255,0.15)] text-white max-w-2xl" aria-describedby="saves-desc">
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#fff' }}>
              存档管理 - {savesPlayer?.username}
            </DialogTitle>
            <DialogDescription id="saves-desc" className="text-[rgba(255,255,255,0.5)]">
              管理该玩家的所有游戏存档。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {savesLoading ? (
              <div className="text-center py-8 text-[rgba(255,255,255,0.4)]">加载中...</div>
            ) : playerSaves.length === 0 ? (
              <div className="text-center py-8 text-[rgba(255,255,255,0.4)]">
                <Archive className="w-12 h-12 mx-auto mb-2 text-[rgba(255,255,255,0.2)]" />
                <p>该玩家暂无存档</p>
              </div>
            ) : (
              playerSaves.map((save) => (
                <div key={save.id} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,210,255,0.1)] bg-[rgba(21,26,58,0.5)]">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#00D2FF]" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#fff' }}>
                        存档 #{save.slot} - {save.character_name || '未命名'}
                      </p>
                      <p className="text-xs text-[rgba(255,255,255,0.4)]">
                        {save.age} 岁 · 更新于 {save.updated_at ? formatDate(save.updated_at) : '-'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[rgba(255,255,255,0.4)] hover:text-red-400"
                    onClick={() => handleDeleteSave(save.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavesPlayer(null)} className="border-[rgba(0,210,255,0.2)] bg-transparent text-white hover:bg-[rgba(0,210,255,0.1)]">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="bg-[#0D1128] border-[rgba(239,68,68,0.3)] text-white max-w-sm" aria-describedby="confirm-desc">
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#EF4444' }}>
              {confirmAction?.title}
            </DialogTitle>
            <DialogDescription id="confirm-desc" className="text-[rgba(255,255,255,0.6)]">
              {confirmAction?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} className="border-[rgba(0,210,255,0.2)] bg-transparent text-white hover:bg-[rgba(0,210,255,0.1)]">
              取消
            </Button>
            <Button
              onClick={() => {
                if (confirmAction?.type === 'deleteSave') {
                  executeDeleteSave();
                } else {
                  executeBanAction();
                }
              }}
              className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
