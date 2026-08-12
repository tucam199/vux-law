import type { ViolationRecord } from './types';

export const getPenalties = async (): Promise<ViolationRecord[]> => {
  try {
    const res = await fetch('/api/penalties', { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch penalties');
  } catch (error) {
    console.error('Error fetching penalties:', error);
    return [];
  }
};

export const addPenalty = async (penalty: Omit<ViolationRecord, 'id'>): Promise<ViolationRecord> => {
  const res = await fetch('/api/penalties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(penalty),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || 'Failed to add penalty');
};

export const addMultiplePenalties = async (penalties: Omit<ViolationRecord, 'id'>[]): Promise<void> => {
  const res = await fetch('/api/penalties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ penalties }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to add multiple penalties');
  }
};

export const updatePenalty = async (id: string, data: Partial<Omit<ViolationRecord, 'id'>>): Promise<void> => {
  const res = await fetch('/api/penalties', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  const resData = await res.json();
  if (!resData.success) {
    throw new Error(resData.error || 'Failed to update penalty');
  }
};

export const deletePenalty = async (id: string): Promise<void> => {
  const res = await fetch(`/api/penalties?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete penalty');
  }
};
