import { useEffect, useState, useCallback } from 'react';
import type { SystemStatus } from '@/admin/types/admin';
import { usePermission } from '@/admin/hooks/usePermission';
import { adminApi } from '@/admin/api/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Server, Database, Clock, Activity, Wifi, Cpu, MemoryStick, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface MetricsData {
  timestamp: string;
  memory_mb: number;
  database_status: number;
  cache_status: number;
}

export function SystemMonitorPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const { isSuperuser } = usePermission();
  const canView = isSuperuser;

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await adminApi.system.status();
      setStatus({
        status: data.status ?? 'healthy',
        uptime: data.uptime ?? '-',
        cpu_usage: data.cpu_usage ?? 0,
        memory_usage: data.memory_usage ?? 0,
        disk_usage: data.disk_usage ?? 0,
        active_connections: data.active_connections ?? 0,
        response_time_ms: data.response_time_ms ?? 0,
        database_status: data.database_status ?? 'unknown',
        cache_status: data.cache_status ?? 'unknown',
        api_version: data.api_version ?? 'v3.1',
      });
    } catch {
      toast.error('获取系统状态失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMetricsHistory = useCallback(async () => {
    try {
      const { data } = await adminApi.system.metricsHistory(24);
      const formattedData = (data.metrics || []).map((item: MetricsData) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        memory: item.memory_mb,
        db: item.database_status === 1 ? 1 : 0,
        cache: item.cache_status === 1 ? 1 : 0,
      }));
      setMetricsHistory(formattedData.reverse());
    } catch {
      console.error('获取历史指标失败');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchMetricsHistory();
    const interval = setInterval(fetchStatus, 30000);
    const metricsInterval = setInterval(fetchMetricsHistory, 60000);
    return () => {
      clearInterval(interval);
      clearInterval(metricsInterval);
    };
  }, [fetchStatus, fetchMetricsHistory]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[rgba(255,255,255,0.5)]">
        <Shield className="w-16 h-16 mb-4" />
        <p className="text-lg">权限不足</p>
      </div>
    );
  }

  const getStatusColor = (usage: number) => {
    if (usage < 60) return 'text-green-400';
    if (usage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (itemStatus: string) => {
    if (itemStatus === 'healthy' || itemStatus === 'connected' || itemStatus === 'active') {
      return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />正常</Badge>;
    }
    return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" />异常</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white font-orbitron">系统监控</h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">实时系统状态和性能指标</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${status?.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className={`text-sm ${status?.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
            {status?.status === 'healthy' ? '实时监控中' : '状态异常'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-[rgba(0,210,255,0.15)] bg-[#0D1128] p-4">
              <Skeleton className="h-4 w-24 mb-2 bg-[#151A3A]" />
              <Skeleton className="h-8 w-16 bg-[#151A3A]" />
            </Card>
          ))}
        </div>
      ) : status ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-2xl font-bold ${getStatusColor(status.cpu_usage)}`}>{status.cpu_usage}%</CardTitle>
                  <Cpu className="w-6 h-6 text-[rgba(255,255,255,0.3)]" />
                </div>
                <CardDescription className="text-[rgba(255,255,255,0.5)]">CPU 使用率</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-2xl font-bold ${getStatusColor(status.memory_usage)}`}>{status.memory_usage}%</CardTitle>
                  <MemoryStick className="w-6 h-6 text-[rgba(255,255,255,0.3)]" />
                </div>
                <CardDescription className="text-[rgba(255,255,255,0.5)]">内存使用率</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-2xl font-bold ${getStatusColor(status.disk_usage)}`}>{status.disk_usage}%</CardTitle>
                  <HardDrive className="w-6 h-6 text-[rgba(255,255,255,0.3)]" />
                </div>
                <CardDescription className="text-[rgba(255,255,255,0.5)]">磁盘使用率</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-[#00D2FF]">{status.active_connections}</CardTitle>
                  <Wifi className="w-6 h-6 text-[rgba(255,255,255,0.3)]" />
                </div>
                <CardDescription className="text-[rgba(255,255,255,0.5)]">活跃连接数</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  系统状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">整体状态</span>
                  {getStatusBadge(status.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">运行时间</span>
                  <span className="text-white font-mono">{status.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">API 版本</span>
                  <span className="text-white font-mono">{status.api_version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">平均响应时间</span>
                  <span className="text-[#00D2FF] font-mono">{status.response_time_ms}ms</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  服务状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">数据库</span>
                  {getStatusBadge(status.database_status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">缓存服务</span>
                  {getStatusBadge(status.cache_status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">API 服务</span>
                  {getStatusBadge('healthy')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgba(255,255,255,0.6)]">后台任务</span>
                  {getStatusBadge('active')}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="w-5 h-5" />
                资源使用趋势
              </CardTitle>
              <CardDescription className="text-[rgba(255,255,255,0.5)]">最近 24 小时资源使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Skeleton className="h-32 w-full bg-[#151A3A]" />
                </div>
              ) : metricsHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metricsHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="rgba(255,255,255,0.5)" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fontSize: 10 }}
                      domain={[0, 'auto']}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fontSize: 10 }}
                      domain={[0, 1.5]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1f3d', 
                        border: '1px solid rgba(0,210,255,0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="memory" 
                      name="内存(MB)" 
                      stroke="#00d2ff" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="db" 
                      name="数据库" 
                      stroke="#4ade80" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="cache" 
                      name="缓存" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-[rgba(255,255,255,0.3)]">
                  <Clock className="w-6 h-6 mr-2" />
                  暂无数据，请稍后刷新...
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
