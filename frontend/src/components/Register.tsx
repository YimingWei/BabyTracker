import { useState } from 'react';
import { api } from '../api';

export default function Register({ onRegistered, onBack }: { onRegistered: (u: any) => void; onBack: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      alert('用户名和密码不能为空');
      return;
    }
    if (!email && !phone) {
      alert('邮箱和手机号至少填写一个');
      return;
    }
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const user = await api.register({ name, email, phone, password });
      onRegistered(user);
    } catch (err: any) {
      alert('注册失败：' + (err.message || '请检查输入信息'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👶</div>
          <h1 className="text-2xl font-bold text-gray-800">注册账号</h1>
          <p className="text-gray-500 text-sm mt-1">创建一个新账号开始记录</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="例如：妈妈" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="选填" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="选填" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
            <input className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="请再次输入密码" required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
            已有账号？返回登录
          </button>
        </div>
      </div>
    </div>
  );
}
