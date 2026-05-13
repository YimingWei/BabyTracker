import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const RECORD_TYPES = [
  { key: 'FEEDING', label: '喂养', icon: '🍼', color: 'bg-orange-100 text-orange-700' },
  { key: 'SLEEP', label: '睡眠', icon: '😴', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'DIAPER', label: '便便', icon: '💩', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'BATH', label: '洗澡', icon: '🛁', color: 'bg-cyan-100 text-cyan-700' },
  { key: 'PLAY', label: '玩耍', icon: '🧸', color: 'bg-pink-100 text-pink-700' },
  { key: 'NOTE', label: '备注', icon: '📝', color: 'bg-gray-100 text-gray-700' },
];

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function toDateInput(iso: string) {
  return new Date(iso).toISOString().split('T')[0];
}

export default function Dashboard({ user, baby, onLogout }: { user: any; baby: any; onLogout?: () => void }) {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ feedingCount: 0, totalSleepMinutes: 0, diaperCount: 0, lastFeeding: null });
  const [photos, setPhotos] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [tab, setTab] = useState<'timeline' | 'photos' | 'growth'>('timeline');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('FEEDING');
  const [feedingSubType, setFeedingSubType] = useState('BREAST_MILK');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingGrowth, setEditingGrowth] = useState<any>(null);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    api.getRecords(baby.id).then(setRecords);
    api.getTodayStats(baby.id).then(setStats);
    api.getPhotos(baby.id).then(setPhotos);
    api.getGrowth(baby.id).then(setGrowth);
  }, [baby.id, refreshKey]);

  const ageDays = Math.floor((Date.now() - new Date(baby.birthDate).getTime()) / (1000 * 60 * 60 * 24));

  const handleClearHistory = async () => {
    if (!window.confirm('确定要清空所有历史记录吗？此操作不可恢复！')) return;
    try {
      await api.clearHistory(baby.id);
      refresh();
    } catch {
      alert('清空失败');
    }
  };

  const openEditRecord = (record: any) => {
    setEditingRecord(record);
    setFormType(record.type);
    if (record.type === 'FEEDING') setFeedingSubType(record.feedingType || 'BREAST_MILK');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const data: any = { type: formType, creatorId: user.id, startedAt: new Date().toISOString() };

    if (formType === 'FEEDING') {
      data.feedingType = fd.get('feedingType');
      data.amount = fd.get('amount') ? parseFloat(fd.get('amount') as string) : null;
      data.duration = fd.get('feedingDuration') ? parseInt(fd.get('feedingDuration') as string, 10) : null;
      data.leftBreast = fd.get('leftBreast') === 'on';
      data.rightBreast = fd.get('rightBreast') === 'on';
    } else if (formType === 'SLEEP') {
      const started = fd.get('startedAt') as string;
      const ended = fd.get('endedAt') as string;
      data.startedAt = new Date(started).toISOString();
      data.endedAt = ended ? new Date(ended).toISOString() : null;
      if (started && ended) data.duration = Math.round((new Date(ended).getTime() - new Date(started).getTime()) / 60000);
    } else if (formType === 'DIAPER') {
      data.diaperType = fd.get('diaperType');
      data.color = fd.get('color');
      data.texture = fd.get('texture');
    } else if (formType === 'PLAY') {
      data.duration = fd.get('duration') ? parseInt(fd.get('duration') as string, 10) : null;
    }
    data.note = fd.get('note') as string;

    if (editingRecord) {
      await api.updateRecord(baby.id, editingRecord.id, data);
      setEditingRecord(null);
    } else {
      await api.createRecord(baby.id, data);
    }
    setShowForm(false);
    refresh();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('uploaderId', user.id);
      await api.uploadPhoto(baby.id, formData);
      refresh();
    } catch (err) {
      alert('上传失败，请重试');
    }
    e.target.value = '';
  };

  const handleGrowthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const data = {
      date: fd.get('date'),
      weight: fd.get('weight') ? parseFloat(fd.get('weight') as string) : null,
      height: fd.get('height') ? parseFloat(fd.get('height') as string) : null,
      headCircumference: fd.get('headCircumference') ? parseFloat(fd.get('headCircumference') as string) : null,
      recorderId: user.id,
    };
    if (editingGrowth) {
      await api.updateGrowth(baby.id, editingGrowth.id, data);
      setEditingGrowth(null);
    } else {
      await api.createGrowth(baby.id, data);
    }
    refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white text-lg">
              {baby.gender === 'male' ? '👶' : baby.gender === 'female' ? '👧' : '👶'}
            </div>
            <div>
              <h1 className="font-bold text-gray-800">{baby.name}</h1>
              <p className="text-xs text-gray-500">{ageDays} 天 · {ageDays < 90 ? '新生儿期' : '婴儿期'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onLogout && (
              <button onClick={onLogout} className="text-xs text-red-400 hover:text-red-600">退出</button>
            )}
            <button onClick={handleClearHistory} className="text-xs text-gray-400 hover:text-gray-600">清空历史</button>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      {stats && (
        <div className="max-w-xl mx-auto px-4 mt-4">
          <div className="card grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl">🍼</div>
              <div className="text-lg font-bold text-orange-600">{stats.feedingCount}</div>
              <div className="text-xs text-gray-500">次喂养</div>
            </div>
            <div>
              <div className="text-2xl">😴</div>
              <div className="text-lg font-bold text-indigo-600">{Math.round(stats.totalSleepMinutes / 60 * 10) / 10}</div>
              <div className="text-xs text-gray-500">小时睡眠</div>
            </div>
            <div>
              <div className="text-2xl">💩</div>
              <div className="text-lg font-bold text-yellow-600">{stats.diaperCount}</div>
              <div className="text-xs text-gray-500">次便便</div>
            </div>
            <div>
              <div className="text-2xl">⏱️</div>
              <div className="text-lg font-bold text-blue-600">
                {stats.lastFeeding ? Math.floor((Date.now() - new Date(stats.lastFeeding.startedAt).getTime()) / 3600000) + 'h' : '-'}
              </div>
              <div className="text-xs text-gray-500">距上次奶</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="max-w-xl mx-auto px-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => { setFormType('FEEDING'); setFeedingSubType('BREAST_MILK'); setEditingRecord(null); setShowForm(true); }} className="card py-3 flex flex-col items-center gap-1 hover:shadow-md transition">
            <span className="text-2xl">🍼</span>
            <span className="text-xs font-medium">喂奶</span>
          </button>
          <button onClick={() => { setFormType('SLEEP'); setEditingRecord(null); setShowForm(true); }} className="card py-3 flex flex-col items-center gap-1 hover:shadow-md transition">
            <span className="text-2xl">😴</span>
            <span className="text-xs font-medium">睡眠</span>
          </button>
          <button onClick={() => { setFormType('DIAPER'); setEditingRecord(null); setShowForm(true); }} className="card py-3 flex flex-col items-center gap-1 hover:shadow-md transition">
            <span className="text-2xl">💩</span>
            <span className="text-xs font-medium">便便</span>
          </button>
          <button onClick={() => { setFormType('BATH'); setEditingRecord(null); setShowForm(true); }} className="card py-3 flex flex-col items-center gap-1 hover:shadow-md transition">
            <span className="text-2xl">🛁</span>
            <span className="text-xs font-medium">洗澡</span>
          </button>
          <button onClick={() => { setFormType('PLAY'); setEditingRecord(null); setShowForm(true); }} className="card py-3 flex flex-col items-center gap-1 hover:shadow-md transition">
            <span className="text-2xl">🧸</span>
            <span className="text-xs font-medium">玩耍</span>
          </button>
          <button onClick={() => { setFormType('NOTE'); setEditingRecord(null); setShowForm(true); }} className="card py-3 flex flex-col items-center gap-1 hover:shadow-md transition">
            <span className="text-2xl">📝</span>
            <span className="text-xs font-medium">备注</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
          {[
            { key: 'timeline', label: '时间线' },
            { key: 'photos', label: '照片' },
            { key: 'growth', label: '生长' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Tab */}
      {tab === 'timeline' && (
        <div className="max-w-xl mx-auto px-4 mt-4 space-y-3">
          {records.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <p>还没有记录，点击上方按钮添加第一条记录</p>
            </div>
          )}
          {records.map(r => {
            const typeInfo = RECORD_TYPES.find(t => t.key === r.type);
            return (
              <div key={r.id} onClick={() => openEditRecord(r)} className="card flex items-start gap-3 cursor-pointer hover:shadow-md transition">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${typeInfo?.color || ''}`}>
                  {typeInfo?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{typeInfo?.label}</span>
                    <span className="text-xs text-gray-400">{new Date(r.startedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {r.type === 'FEEDING' && `${r.feedingType === 'BREAST_MILK' ? '母乳' : r.feedingType === 'FORMULA' ? '配方奶' : r.feedingType === 'MIXED' ? '混合' : '辅食'} ${r.amount ? r.amount + 'ml' : ''} ${r.duration ? r.duration + '分钟' : ''} ${r.leftBreast ? '左' : ''}${r.rightBreast ? '右' : ''}`}
                    {r.type === 'SLEEP' && `睡了 ${r.duration ? Math.round(r.duration / 60 * 10) / 10 + ' 小时' : '中'}`}
                    {r.type === 'DIAPER' && `${r.diaperType === 'WET' ? '尿尿' : r.diaperType === 'DIRTY' ? '便便' : '都有'} ${r.color || ''} ${r.texture || ''}`}
                    {r.type === 'BATH' && '洗香香'}
                    {r.type === 'PLAY' && `玩耍 ${r.duration ? r.duration + '分钟' : ''}`}
                    {r.type === 'NOTE' && (r.note || '备注记录')}
                    {r.note && r.type !== 'NOTE' && <span className="text-gray-400"> · {r.note}</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photos Tab */}
      {tab === 'photos' && (
        <div className="max-w-xl mx-auto px-4 mt-4">
          <label htmlFor="photo-upload" className="card flex items-center justify-center py-8 border-dashed border-2 border-blue-200 cursor-pointer hover:bg-blue-50 transition mb-4">
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoUpload}
            />
            <div className="text-center">
              <div className="text-3xl mb-1">📷</div>
              <span className="text-sm text-blue-600 font-medium">上传照片</span>
            </div>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {photos.map(p => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={`http://localhost:3001${p.url}`} alt={p.caption} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📷</div>
              <p>还没有照片，点击上方上传</p>
            </div>
          )}
        </div>
      )}

      {/* Growth Tab */}
      {tab === 'growth' && (
        <div className="max-w-xl mx-auto px-4 mt-4 space-y-4">
          <form key={editingGrowth?.id || 'new-growth'} onSubmit={handleGrowthSubmit} className="card space-y-3">
            <h3 className="font-medium text-gray-800">{editingGrowth ? '编辑生长记录' : '添加生长记录'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-gray-500">日期</label>
                <input name="date" type="date" className="input text-sm" defaultValue={editingGrowth ? toDateInput(editingGrowth.date) : new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label className="text-xs text-gray-500">体重(kg)</label>
                <input name="weight" type="number" step="0.01" className="input text-sm" placeholder="3.5" defaultValue={editingGrowth?.weight ?? ''} />
              </div>
              <div>
                <label className="text-xs text-gray-500">身高(cm)</label>
                <input name="height" type="number" step="0.1" className="input text-sm" placeholder="52" defaultValue={editingGrowth?.height ?? ''} />
              </div>
              <div>
                <label className="text-xs text-gray-500">头围(cm)</label>
                <input name="headCircumference" type="number" step="0.1" className="input text-sm" placeholder="35" defaultValue={editingGrowth?.headCircumference ?? ''} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 text-sm">{editingGrowth ? '保存修改' : '保存'}</button>
              {editingGrowth && (
                <button type="button" onClick={() => setEditingGrowth(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">取消</button>
              )}
            </div>
          </form>

          {growth.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-gray-800 mb-3">生长记录</h3>
              <div className="space-y-2">
                {growth.map(g => (
                  <div key={g.id} onClick={() => setEditingGrowth(g)} className="flex justify-between text-sm py-2 border-b last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2 transition">
                    <span className="text-gray-500">{new Date(g.date).toLocaleDateString('zh-CN')}</span>
                    <span className="text-gray-800">
                      {g.weight && `体重 ${g.weight}kg`}
                      {g.height && ` · 身高 ${g.height}cm`}
                      {g.headCircumference && ` · 头围 ${g.headCircumference}cm`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800">
                {RECORD_TYPES.find(t => t.key === formType)?.icon} {editingRecord ? '编辑' : '添加'}{RECORD_TYPES.find(t => t.key === formType)?.label}记录
              </h2>
              <button onClick={closeForm} className="text-gray-400 text-xl">&times;</button>
            </div>
            <form key={editingRecord?.id || 'new-record'} onSubmit={handleRecordSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">记录类型</label>
                <select
                  className="input"
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                >
                  {RECORD_TYPES.map(t => (
                    <option key={t.key} value={t.key}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              {formType === 'FEEDING' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">喂养方式</label>
                    <select
                      name="feedingType"
                      className="input"
                      value={feedingSubType}
                      onChange={e => setFeedingSubType(e.target.value)}
                    >
                      <option value="BREAST_MILK">母乳</option>
                      <option value="FORMULA">配方奶</option>
                      <option value="MIXED">混合</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">奶量 (ml)</label>
                      <input name="amount" type="number" step="0.1" className="input" placeholder="例如：120" defaultValue={editingRecord?.amount ?? ''} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">时长 (分钟)</label>
                      <input name="feedingDuration" type="number" step="1" className="input" placeholder="例如：20" defaultValue={editingRecord?.duration ?? ''} />
                    </div>
                  </div>
                  {feedingSubType !== 'FORMULA' && (
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2"><input type="checkbox" name="leftBreast" className="w-4 h-4" defaultChecked={editingRecord?.leftBreast || false} /> 左胸</label>
                      <label className="flex items-center gap-2"><input type="checkbox" name="rightBreast" className="w-4 h-4" defaultChecked={editingRecord?.rightBreast || false} /> 右胸</label>
                    </div>
                  )}
                </>
              )}
              {formType === 'SLEEP' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                    <input name="startedAt" type="datetime-local" className="input" defaultValue={editingRecord ? toDatetimeLocal(editingRecord.startedAt) : new Date().toISOString().slice(0, 16)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                    <input name="endedAt" type="datetime-local" className="input" defaultValue={editingRecord?.endedAt ? toDatetimeLocal(editingRecord.endedAt) : ''} />
                  </div>
                </>
              )}
              {formType === 'DIAPER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                    <select name="diaperType" className="input" defaultValue={editingRecord?.diaperType || 'WET'}>
                      <option value="WET">尿尿</option>
                      <option value="DIRTY">便便</option>
                      <option value="BOTH">都有</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                    <input name="color" type="text" className="input" placeholder="例如：黄色" defaultValue={editingRecord?.color || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">性状</label>
                    <input name="texture" type="text" className="input" placeholder="例如：稀糊状" defaultValue={editingRecord?.texture || ''} />
                  </div>
                </>
              )}
              {formType === 'PLAY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时长 (分钟)</label>
                  <input name="duration" type="number" step="1" className="input" placeholder="例如：30" defaultValue={editingRecord?.duration ?? ''} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea name="note" className="input" rows={2} placeholder="可选..." defaultValue={editingRecord?.note || ''} />
              </div>
              <button type="submit" className="btn-primary w-full">{editingRecord ? '保存修改' : '保存记录'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
