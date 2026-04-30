import { useEffect, useState, useCallback } from 'react';
import type { Activity } from '@/admin/types/admin';
import { usePermission } from '@/admin/hooks/usePermission';
import { adminApi } from '@/admin/api/adminApi';
import { AdminPagination } from '@/admin/components/AdminPagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Calendar, Plus, Users, Target, Gift, TrendingUp } from 'lucide-react';

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  upcoming: { label: '未开始', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  active: { label: '进行中', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  ended: { label: '已结束', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
};

export function ActivityListPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 });

  const { isSuperuser } = usePermission();
  const canManage = isSuperuser;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.events.list({ is_active: true, skip: pagination.skip, limit: pagination.limit });
      const mapped: Activity[] = (data.events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        type: e.category || 'event',
        status: e.is_active ? 'active' : 'ended',
        start_date: e.created_at || new Date().toISOString(),
        end_date: e.updated_at || new Date().toISOString(),
        participant_count: e.trigger_count || 0,
        reward: e.reward,
      }));
      setActivities(mapped);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.skip, pagination.limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
          <h1 className="text-2xl font-bold text-white font-orbitron">活动管理</h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">运营活动创建和管理</p>
        </div>
        <Button className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black">
          <Plus className="w-4 h-4 mr-2" />
          新建活动
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '总活动数', value: activities.length, icon: <Calendar className="w-6 h-6" />, color: 'text-[#00D2FF]' },
          { label: '进行中', value: activities.filter(a => a.status === 'active').length, icon: <Target className="w-6 h-6" />, color: 'text-green-400' },
          { label: '总参与人数', value: activities.reduce((sum, a) => sum + a.participant_count, 0), icon: <Users className="w-6 h-6" />, color: 'text-blue-400' },
          { label: '平均参与率', value: activities.length ? `${Math.round(activities.reduce((sum, a) => sum + a.participant_count, 0) / activities.length / 10)}%` : '-', icon: <TrendingUp className="w-6 h-6" />, color: 'text-purple-400' },
        ].map(stat => (
          <Card key={stat.label} className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-2xl font-bold ${stat.color}`}>{stat.value}</CardTitle>
                <div className="text-[rgba(255,255,255,0.3)]">{stat.icon}</div>
              </div>
              <CardDescription className="text-[rgba(255,255,255,0.5)]">{stat.label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-4">
              <Skeleton className="h-4 w-32 mb-2 bg-[#151A3A]" />
              <Skeleton className="h-3 w-48 bg-[#151A3A]" />
            </Card>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
          <CardContent className="py-12 text-center text-[rgba(255,255,255,0.4)]">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无活动数据</p>
            <p className="text-sm mt-2">点击"新建活动"创建第一个运营活动</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => {
            const statusCfg = statusConfig[activity.status] || statusConfig.draft;
            return (
              <Card key={activity.id} className="border-[rgba(0,210,255,0.15)] bg-[#0D1128] hover:border-[rgba(0,210,255,0.3)] transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{activity.title}</CardTitle>
                      <CardDescription className="text-[rgba(255,255,255,0.5)] mt-1">
                        {activity.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={statusCfg.cls}>{statusCfg.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-[rgba(255,255,255,0.5)] flex items-center gap-1">
                        <Users className="w-4 h-4" /> {activity.participant_count}
                      </span>
                      <span className="text-[rgba(255,255,255,0.5)] flex items-center gap-1">
                        <Gift className="w-4 h-4" /> {activity.reward || '无'}
                      </span>
                    </div>
                    <div className="text-[rgba(255,255,255,0.4)] text-xs">
                      {new Date(activity.start_date).toLocaleDateString()} ~ {new Date(activity.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <AdminPagination
        skip={pagination.skip}
        limit={pagination.limit}
        total={pagination.total}
        onSkipChange={(skip) => setPagination((p) => ({ ...p, skip }))}
      />
    </div>
  );
}
