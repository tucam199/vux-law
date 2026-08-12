import type { Regulation } from './types';

export const getRegulations = async (): Promise<Regulation[]> => {
  try {
    const res = await fetch('/api/regulations', { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch regulations');
  } catch (error) {
    console.error('Error fetching regulations:', error);
    return [];
  }
};

export const addRegulation = async (regulation: Omit<Regulation, 'id'>): Promise<Regulation> => {
  const res = await fetch('/api/regulations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regulation),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || 'Failed to add regulation');
};

export const updateRegulation = async (id: string, regulation: Partial<Omit<Regulation, 'id'>>): Promise<void> => {
  const res = await fetch('/api/regulations', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...regulation }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to update regulation');
  }
};

export const deleteRegulation = async (id: string): Promise<void> => {
  const res = await fetch(`/api/regulations?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete regulation');
  }
};
