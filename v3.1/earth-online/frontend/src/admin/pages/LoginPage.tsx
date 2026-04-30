import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/admin/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    setSubmitting(true);
    try {
      await login(username, password);
      toast.success('登录成功');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? '登录失败，请检查用户名和密码');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#080B1A] via-[#0D1128] to-[#111640]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D2FF]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C56CF0]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md border border-[rgba(0,210,255,0.15)] bg-[#0D1128]/80 backdrop-blur relative">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#00D2FF]/10 flex items-center justify-center border border-[#00D2FF]/20">
            <span className="text-3xl">🌍</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white font-orbitron tracking-wider">
            地球Online 管理后台
          </CardTitle>
          <CardDescription className="text-[rgba(255,255,255,0.6)]">
            请使用管理员账号登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white placeholder:text-[rgba(255,255,255,0.3)] focus:border-[#00D2FF]"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#151A3A] border-[rgba(0,210,255,0.15)] text-white placeholder:text-[rgba(255,255,255,0.3)] focus:border-[#00D2FF]"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#00D2FF] hover:bg-[#00B8E6] text-black font-semibold"
              disabled={submitting}
            >
              {submitting ? '登录中...' : '登录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
