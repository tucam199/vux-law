import type { ViolationRecord } from './types';

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

export const getPenalties = async (): Promise<ViolationRecord[]> => {
  try {
    const { ok, data } = await safeFetchJson('/api/penalties', { cache: 'no-store' });
    if (ok && data.success) {
      return data.data || [];
    }
    throw new Error(data?.error || 'Không thể tải danh sách vi phạm');
  } catch (error) {
    console.error('Error fetching penalties:', error);
    return [];
  }
};

export const addPenalty = async (penalty: Omit<ViolationRecord, 'id'>): Promise<ViolationRecord> => {
  const { ok, data } = await safeFetchJson('/api/penalties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(penalty),
  });
  if (ok && data.success) {
    return data.data;
  }
  throw new Error(data?.error || 'Không thể thêm trường hợp vi phạm');
};

export const addMultiplePenalties = async (penalties: Omit<ViolationRecord, 'id'>[]): Promise<void> => {
  const { ok, data } = await safeFetchJson('/api/penalties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ penalties }),
  });
  if (!ok || !data.success) {
    throw new Error(data?.error || 'Không thể thêm danh sách vi phạm');
  }
};

export const updatePenalty = async (id: string, data: Partial<Omit<ViolationRecord, 'id'>>): Promise<void> => {
  const { ok, data: resData } = await safeFetchJson('/api/penalties', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!ok || !resData.success) {
    throw new Error(resData?.error || 'Không thể cập nhật trường hợp vi phạm');
  }
};

export const deletePenalty = async (id: string): Promise<void> => {
  const { ok, data } = await safeFetchJson(`/api/penalties?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!ok || !data.success) {
    throw new Error(data?.error || 'Không thể xóa trường hợp vi phạm');
  }
};
