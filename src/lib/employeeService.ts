import type { Employee } from './types';

const API_BASE = '/api/employees';

export async function getEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch(API_BASE, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch employees: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error in getEmployees:', error);
    // Fallback default employees in case API fails
    return [
      { id: 'emp_1', name: 'Trình Mỹ Phượng Oanh', position: 'Nhân viên HR', department: 'Phòng Hành Chính Nhân Sự' },
      { id: 'emp_2', name: 'Trần Anh Tú', position: 'Quản Lý', department: 'Phòng Kỹ Thuật' },
      { id: 'emp_3', name: 'Phan Huỳnh Tiến', position: 'Lập Trình Viên', department: 'Phòng Kỹ Thuật' },
      { id: 'emp_4', name: 'Tạ Anh Khoa', position: 'Lập Trình Viên', department: 'Phòng Kỹ Thuật' },
    ];
  }
}

export async function addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });

  if (!res.ok) {
    throw new Error(`Failed to add employee: ${res.statusText}`);
  }

  return await res.json();
}

export async function updateEmployee(id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<void> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...employee }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update employee: ${res.statusText}`);
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(`Failed to delete employee: ${res.statusText}`);
  }
}
