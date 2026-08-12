import type { Regulation } from './types';

async function safeFetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Lỗi Server [HTTP ${res.status}]: ${text.slice(0, 120)}`);
  }
  return { ok: res.ok, status: res.status, data };
}

export const getRegulations = async (): Promise<Regulation[]> => {
  try {
    const { ok, data } = await safeFetchJson('/api/regulations', { cache: 'no-store' });
    if (ok && data.success) {
      return data.data || [];
    }
    throw new Error(data?.error || 'Không thể tải danh sách quy định');
  } catch (error) {
    console.error('Error fetching regulations:', error);
    return [];
  }
};

export const addRegulation = async (regulation: Omit<Regulation, 'id'>): Promise<Regulation> => {
  const { ok, data } = await safeFetchJson('/api/regulations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regulation),
  });
  if (ok && data.success) {
    return data.data;
  }
  throw new Error(data?.error || 'Không thể thêm quy định');
};

export const updateRegulation = async (id: string, regulation: Partial<Omit<Regulation, 'id'>>): Promise<void> => {
  const { ok, data } = await safeFetchJson('/api/regulations', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...regulation }),
  });
  if (!ok || !data.success) {
    throw new Error(data?.error || 'Không thể cập nhật quy định');
  }
};

export const deleteRegulation = async (id: string): Promise<void> => {
  const { ok, data } = await safeFetchJson(`/api/regulations?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!ok || !data.success) {
    throw new Error(data?.error || 'Không thể xóa quy định');
  }
};
