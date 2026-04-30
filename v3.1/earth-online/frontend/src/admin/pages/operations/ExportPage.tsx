import { useState, useEffect } from 'react';
import { usePermission } from '@/admin/hooks/usePermission';
import { adminApi } from '@/admin/api/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Download, FileSpreadsheet, FileJson, Database, Users, AlertTriangle, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/admin/utils/dateFormat';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  formats: Array<{ value: string; label: string; icon: React.ReactNode }>;
  filters: Array<{ key: string; label: string; type: 'select' | 'date' | 'text'; options?: Array<{ value: string; label: string }> }>;
}

const exportOptions: ExportOption[] = [
  {
    id: 'players',
    name: '玩家数据',
    description: '导出玩家账户信息',
    icon: <Users className="w-6 h-6" />,
    formats: [
      { value: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
    filters: [
      { key: 'is_active', label: '状态', type: 'select', options: [{ value: 'all', label: '全部' }, { value: 'true', label: '启用' }, { value: 'false', label: '停用' }] },
    ],
  },
  {
    id: 'audit-logs',
    name: '审计日志',
    description: '导出操作审计记录',
    icon: <Database className="w-6 h-6" />,
    formats: [
      { value: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { value: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
    ],
    filters: [
      { key: 'action', label: '操作类型', type: 'text' },
      { key: 'table_name', label: '数据表', type: 'text' },
      { key: 'start_date', label: '开始日期', type: 'date' },
      { key: 'end_date', label: '结束日期', type: 'date' },
    ],
  },
  {
    id: 'error-logs',
    name: '错误日志',
    description: '导出系统错误记录',
    icon: <AlertTriangle className="w-6 h-6" />,
    formats: [
      { value: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
    filters: [
      { key: 'level', label: '级别', type: 'select', options: [{ value: 'all', label: '全部' }, { value: 'ERROR', label: 'ERROR' }, { value: 'WARNING', label: 'WARNING' }, { value: 'CRITICAL', label: 'CRITICAL' }] },
      { key: 'status', label: '状态', type: 'select', options: [{ value: 'all', label: '全部' }, { value: 'open', label: '待处理' }, { value: 'resolved', label: '已解决' }, { value: 'ignored', label: '已忽略' }] },
    ],
  },
];

export function ExportPage() {
  const [selectedType, setSelectedType] = useState('audit-logs');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { hasPermission, isSuperuser } = usePermission();
  const canExport = isSuperuser || hasPermission('ops:export');

  const currentOption = exportOptions.find(o => o.id === selectedType);

  // 初始化默认过滤器
  useEffect(() => {
    const initialFilters: Record<string, string> = {};
    currentOption?.filters.forEach(filter => {
      if (filter.type === 'select') {
        initialFilters[filter.key] = 'all';
      }
    });
    setFilters(initialFilters);
  }, [currentOption]);

  // 清理过滤器，移除 'all' 值
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== 'all')
  );

  const handleExport = async () => {
    if (!currentOption) return;

    setExporting(true);
    try {
      const body: Record<string, unknown> = { format: selectedFormat, filters: cleanFilters };
      const response = await adminApi.exports.exportData(selectedType, body);

      const blob = new Blob([response.data], { type: selectedFormat === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}.${selectedFormat}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${currentOption.name} 导出成功`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!canExport) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[rgba(255,255,255,0.5)]">
        <Shield className="w-16 h-16 mb-4" />
        <p className="text-lg">权限不足</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-orbitron">数据导出</h1>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">导出游戏数据和分析结果</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportOptions.map(option => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all border-[rgba(0,210,255,0.15)] bg-[#0D1128] ${
              selectedType === option.id ? 'border-[#00D2FF] ring-2 ring-[#00D2FF]/20' : 'hover:border-[rgba(0,210,255,0.3)]'
            }`}
            onClick={() => {
              setSelectedType(option.id);
              setSelectedFormat(option.formats[0].value);
              // 重置过滤器，设置 select 类型为 'all'
              const initialFilters: Record<string, string> = {};
              option.filters.forEach(filter => {
                if (filter.type === 'select') {
                  initialFilters[filter.key] = 'all';
                }
              });
              setFilters(initialFilters);
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedType === option.id ? 'bg-[#00D2FF]/20 text-[#00D2FF]' : 'bg-[#151A3A] text-[rgba(255,255,255,0.5)]'}`}>
                  {option.icon}
                </div>
                <div>
                  <CardTitle className="text-white text-sm">{option.name}</CardTitle>
                  <CardDescription className="text-[rgba(255,255,255,0.4)] text-xs">{option.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {currentOption && (
        <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
          <CardHeader>
            <CardTitle className="text-white">{currentOption.name} 导出配置</CardTitle>
            <CardDescription className="text-[rgba(255,255,255,0.5)]">配置导出选项和筛选条件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>导出格式</Label>
              <div className="flex gap-2">
                {currentOption.formats.map(format => (
                  <Button
                    key={format.value}
                    variant={selectedFormat === format.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFormat(format.value)}
                    className={selectedFormat === format.value ? 'bg-[#00D2FF] text-black' : 'bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white'}
                  >
                    {format.icon}
                    <span className="ml-2">{format.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {currentOption.filters.length > 0 && (
              <>
                <Label>筛选条件</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentOption.filters.map(filter => (
                    <div key={filter.key} className="space-y-2">
                      <Label className="text-[rgba(255,255,255,0.6)]">{filter.label}</Label>
                      {filter.type === 'select' ? (
                        <Select value={filters[filter.key] ?? 'all'} onValueChange={(v) => updateFilter(filter.key, v)}>
                          <SelectTrigger className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white">
                            <SelectValue placeholder={`选择${filter.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.options?.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : filter.type === 'date' ? (
                        <Input
                          type="date"
                          value={filters[filter.key] ?? ''}
                          onChange={(e) => updateFilter(filter.key, e.target.value)}
                          className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                        />
                      ) : (
                        <Input
                          placeholder={`输入${filter.label}`}
                          value={filters[filter.key] ?? ''}
                          onChange={(e) => updateFilter(filter.key, e.target.value)}
                          className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-[#00D2FF] hover:bg-[#00B8E6] text-black w-full"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  导出 {currentOption.name}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
        <CardHeader>
          <CardTitle className="text-white">导出提示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[rgba(255,255,255,0.5)]">
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            大数据量导出可能需要几秒钟，请耐心等待
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            导出完成后文件将自动下载
          </p>
          <p className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            请勿频繁导出大量数据，以免影响系统性能
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
