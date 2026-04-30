import { useEffect, useState } from 'react';
import { Users, Activity, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminApi } from '@/admin/api/adminApi';
import type { DashboardStats, DashboardTrends } from '@/admin/types/admin';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ title, value, icon: Icon, description, loading }: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[rgba(255,255,255,0.6)]">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-2 bg-[#151A3A]" />
          ) : (
            <p className="text-3xl font-bold text-white font-orbitron mt-2">{value}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#00D2FF]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#00D2FF]" />
        </div>
      </div>
      {description && (
        <p className="text-xs text-[rgba(255,255,255,0.4)] mt-3">{description}</p>
      )}
    </div>
  );
}

const CHART_COLORS = ['#00D2FF', '#00B8E6', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const CATEGORY_TRANSLATION: Record<string, string> = {
  life: '生活',
  health: '健康',
  wealth: '财富',
  relationship: '人际关系',
  education: '教育',
  work: '工作',
  random: '随机',
  combat: '战斗',
  family: '家庭',
  career: '事业',
  milestone: '里程碑',
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);

  useEffect(() => {
    Promise.all([
      adminApi.dashboard.realtime()
        .then((res) => res.data)
        .catch(() => null),
      adminApi.dashboard.trends()
        .then((res) => res.data)
        .catch(() => ({
          seven_day_trends: [],
          category_distribution: [],
          age_distribution: [],
        })),
    ])
      .then(([statsData, trendsData]) => {
        setStats(statsData);
        setTrends(trendsData);
        if (!statsData) {
          setError('无法加载实时数据，请检查后端服务是否运行');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const lineChartData = trends?.seven_day_trends?.map((item) => ({
    date: item.date,
    '新角色': item.new_characters,
    '事件触发': item.events_triggered,
  })) ?? [];

  const pieChartData = trends?.category_distribution?.map((item) => ({
    name: CATEGORY_TRANSLATION[item.category] || item.category,
    value: item.count,
  })) ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 bg-[#151A3A]" />
          <Skeleton className="h-4 w-48 mt-2 bg-[#151A3A]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-6">
              <Skeleton className="h-4 w-20 bg-[#151A3A]" />
              <Skeleton className="h-8 w-24 mt-4 bg-[#151A3A]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-orbitron">仪表盘</h1>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">实时监控游戏运行状态</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="在线玩家"
          value={stats?.online_players ?? 0}
          icon={Users}
          description="当前活跃连接数"
          loading={loading}
        />
        <StatCard
          title="今日新增角色"
          value={stats?.today_new_characters ?? 0}
          icon={Activity}
          description="较昨日 +12%"
          loading={loading}
        />
        <StatCard
          title="今日事件触发"
          value={stats?.today_events_triggered?.toLocaleString() ?? '0'}
          icon={Zap}
          description="平均每秒 0.8 次"
          loading={loading}
        />
        <StatCard
          title="活跃会话"
          value={stats?.active_sessions ?? 0}
          icon={TrendingUp}
          description="过去1小时"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">7天趋势</h3>
          {lineChartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-[rgba(255,255,255,0.3)]">
              暂无趋势数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1a1f3d', 
                    border: '1px solid rgba(0,210,255,0.3)', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="新角色" stroke="#00D2FF" strokeWidth={2} dot={{ fill: '#00D2FF' }} />
                <Line type="monotone" dataKey="事件触发" stroke="#7C3AED" strokeWidth={2} dot={{ fill: '#7C3AED' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">事件分类分布</h3>
          {pieChartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-[rgba(255,255,255,0.3)]">
              暂无分类数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                >
                  {pieChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1a1f3d', 
                    border: '1px solid rgba(0,210,255,0.3)', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
