const API_URL = 'http://localhost:3001/api';

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  register: (data: any) => fetchJSON('/users/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => fetchJSON('/users/login', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (id: string) => fetchJSON(`/users/${id}`),
  createBaby: (data: any) => fetchJSON('/babies', { method: 'POST', body: JSON.stringify(data) }),
  getBaby: (id: string) => fetchJSON(`/babies/${id}`),
  getRecords: (babyId: string, params?: string) => fetchJSON(`/babies/${babyId}/records${params || ''}`),
  createRecord: (babyId: string, data: any) => fetchJSON(`/babies/${babyId}/records`, { method: 'POST', body: JSON.stringify(data) }),
  getTodayStats: (babyId: string) => fetchJSON(`/babies/${babyId}/records/stats/today`),
  deleteRecord: (babyId: string, id: string) => fetchJSON(`/babies/${babyId}/records/${id}`, { method: 'DELETE' }),
  getPhotos: (babyId: string) => fetchJSON(`/babies/${babyId}/photos`),
  uploadPhoto: (babyId: string, formData: FormData) => fetch(`${API_URL}/babies/${babyId}/photos`, { method: 'POST', body: formData }).then(r => r.json()),
  getMilestones: (babyId: string) => fetchJSON(`/babies/${babyId}/milestones`),
  createMilestone: (babyId: string, data: any) => fetchJSON(`/babies/${babyId}/milestones`, { method: 'POST', body: JSON.stringify(data) }),
  getGrowth: (babyId: string) => fetchJSON(`/babies/${babyId}/growth`),
  createGrowth: (babyId: string, data: any) => fetchJSON(`/babies/${babyId}/growth`, { method: 'POST', body: JSON.stringify(data) }),
};
