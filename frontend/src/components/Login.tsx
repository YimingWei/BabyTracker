import { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin, onRegister }: { onLogin: (u: any) => void; onRegister: () => void }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !password) return;
    setLoading(true);
    try {
      const user = await api.login({ account, password });
      onLogin(user);
    } catch (err: any) {
      alert('登录失败：' + (err.message || '账号或密码错误'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👶</div>
          <h1 className="text-2xl font-bold text-gray-800">宝宝成长记录</h1>
          <p className="text-gray-500 text-sm mt-1">0-3个月新生儿专用</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
            <input
              className="input"
              value={account}
              onChange={e => setAccount(e.target.value)}
              placeholder="邮箱或手机号"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={onRegister} className="text-sm text-blue-600 hover:text-blue-700">
            注册账号
          </button>
        </div>
      </div>
    </div>
  );
}
