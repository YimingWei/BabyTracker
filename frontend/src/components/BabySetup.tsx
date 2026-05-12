import { useState } from 'react';
import { api } from '../api';

export default function BabySetup({ userId, onSetup }: { userId: string; onSetup: (b: any) => void }) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;
    setLoading(true);
    try {
      const baby = await api.createBaby({
        name, birthDate, gender, ownerId: userId,
        birthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
        birthHeight: birthHeight ? parseFloat(birthHeight) : undefined,
      });
      onSetup(baby);
    } catch (err) {
      alert('创建失败');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🍼</div>
          <h1 className="text-2xl font-bold text-gray-800">添加宝宝信息</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">宝宝昵称</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="例如：小汤圆" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
            <input className="input" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <select className="input" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">请选择</option>
              <option value="male">男宝</option>
              <option value="female">女宝</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出生体重 (kg)</label>
              <input className="input" type="number" step="0.01" value={birthWeight} onChange={e => setBirthWeight(e.target.value)} placeholder="3.2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出生身高 (cm)</label>
              <input className="input" type="number" step="0.1" value={birthHeight} onChange={e => setBirthHeight(e.target.value)} placeholder="50" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '保存中...' : '完成设置'}
          </button>
        </form>
      </div>
    </div>
  );
}
