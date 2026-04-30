import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '@/admin/api/adminApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Ban, ShieldOff, Gamepad2, Calendar, DollarSign, MapPin, Heart, BookOpen } from 'lucide-react';
import { formatDate } from '@/admin/utils/dateFormat';
import { toast } from 'sonner';

interface CharacterData {
  id: number;
  name: string;
  age: number;
  is_alive: boolean;
  health: number;
  money: number;
  occupation: string;
  education_level: string;
  family_tier: number;
  death_reason: string | null;
  death_age: number | null;
  final_title: string | null;
  server_id: string;
}

interface PlayerDetail {
  id: number;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_color: string | null;
  is_active: boolean;
  is_banned: boolean;
  login_ip: string | null;
  last_login_at: string | null;
  created_at: string | null;
  characters: CharacterData[];
}

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPlayer();
  }, [id]);

  const fetchPlayer = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.players.detail(Number(id));
      setPlayer(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '加载玩家详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async () => {
    if (!player) return;
    try {
      if (player.is_banned) {
        await adminApi.players.unban(player.id);
        toast.success('玩家已解封');
      } else {
        await adminApi.players.ban(player.id);
        toast.success('玩家已封禁');
      }
      await fetchPlayer();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '操作失败');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-[#151A3A]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 bg-[#151A3A]" />
          <Skeleton className="h-48 bg-[#151A3A]" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[rgba(255,255,255,0.4)]">玩家不存在</p>
      </div>
    );
  }

  const aliveChars = player.characters.filter(c => c.is_alive);
  const deadChars = player.characters.filter(c => !c.is_alive);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/players">
          <Button variant="ghost" size="sm" className="text-[rgba(255,255,255,0.5)] hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>玩家详情</h1>
        <div className="ml-auto flex items-center gap-2">
          {player.is_banned ? (
            <Badge variant="destructive">已封禁</Badge>
          ) : (
            <Badge className="bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)]">正常</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleBan}
            className="border-[rgba(0,210,255,0.2)] bg-transparent text-white hover:bg-[rgba(0,210,255,0.1)]"
          >
            {player.is_banned ? (
              <><ShieldOff className="w-4 h-4 mr-1" />解封</>
            ) : (
              <><Ban className="w-4 h-4 mr-1" />封禁</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <User className="w-4 h-4 inline mr-1" />
              账号信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">用户名</span>
              <span style={{ color: '#fff' }}>{player.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">显示名称</span>
              <span style={{ color: '#fff' }}>{player.display_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">最后登录</span>
              <span className="text-[rgba(255,255,255,0.5)]">{player.last_login_at ? formatDate(player.last_login_at) : '从未登录'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">登录IP</span>
              <span className="font-mono text-[rgba(255,255,255,0.5)]">{player.login_ip || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">注册日期</span>
              <span className="text-[rgba(255,255,255,0.5)]">{formatDate(player.created_at, 'date')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <Gamepad2 className="w-4 h-4 inline mr-1" />
              角色统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">总角色数</span>
              <span style={{ color: '#fff' }}>{player.characters.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">存活角色</span>
              <span className="text-[#10B981]">{aliveChars.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(255,255,255,0.4)]">死亡角色</span>
              <span className="text-[#F43F5E]">{deadChars.length}</span>
            </div>
            {aliveChars.length > 0 && (
              <div className="flex justify-between">
                <span className="text-[rgba(255,255,255,0.4)]">活跃服务器</span>
                <span style={{ color: '#fff' }}>{aliveChars[0].server_id}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {aliveChars.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#fff' }}>存活角色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aliveChars.map((char) => (
              <Card key={char.id} className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base" style={{ color: '#00D2FF' }}>{char.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]" />
                    <span className="text-[rgba(255,255,255,0.5)]">年龄: {char.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]" />
                    <span className="text-[rgba(255,255,255,0.5)]">健康: {char.health}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]" />
                    <span className="text-[rgba(255,255,255,0.5)]">${char.money?.toLocaleString()}</span>
                  </div>
                  <Separator className="bg-[rgba(0,210,255,0.1)]" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]" />
                    <span className="text-[rgba(255,255,255,0.5)]">{char.occupation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]" />
                    <span className="text-[rgba(255,255,255,0.5)]">{char.education_level}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {deadChars.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#fff' }}>死亡角色</h2>
          <div className="rounded-lg border border-[rgba(244,63,94,0.15)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(244,63,94,0.15)]">
                  <th className="text-left px-4 py-2 text-[rgba(255,255,255,0.5)] font-medium">角色名</th>
                  <th className="text-left px-4 py-2 text-[rgba(255,255,255,0.5)] font-medium">终年</th>
                  <th className="text-left px-4 py-2 text-[rgba(255,255,255,0.5)] font-medium">死因</th>
                  <th className="text-left px-4 py-2 text-[rgba(255,255,255,0.5)] font-medium">终称</th>
                  <th className="text-left px-4 py-2 text-[rgba(255,255,255,0.5)] font-medium">服务器</th>
                </tr>
              </thead>
              <tbody>
                {deadChars.map((char) => (
                  <tr key={char.id} className="border-b border-[rgba(244,63,94,0.08)]">
                    <td className="px-4 py-2 text-[#F43F5E]">{char.name}</td>
                    <td className="px-4 py-2 text-[rgba(255,255,255,0.5)]">{char.death_age ?? '-'}</td>
                    <td className="px-4 py-2 text-[rgba(255,255,255,0.5)]">{char.death_reason || '-'}</td>
                    <td className="px-4 py-2 text-[rgba(255,255,255,0.5)]">{char.final_title || '-'}</td>
                    <td className="px-4 py-2 text-[rgba(255,255,255,0.5)]">{char.server_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
