import { Pool } from 'pg';
import type { Regulation, ViolationRecord, Employee } from './types';
import fs from 'fs';
import path from 'path';

// Pure PostgreSQL 16 Connection Pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[PostgreSQL Warning] DATABASE_URL environment variable is missing.');
}

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Unexpected Error]:', err);
});

let isSchemaInitialized = false;

// Local JSON Backup Fallback Directory (Rule 1 compliance)
const JSON_DATA_DIR = path.join(process.cwd(), '.vux-data');
const EMPLOYEES_JSON_FILE = path.join(JSON_DATA_DIR, 'employees.json');

function ensureLocalJsonBackup(employees: Employee[]) {
  try {
    if (!fs.existsSync(JSON_DATA_DIR)) {
      fs.mkdirSync(JSON_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(EMPLOYEES_JSON_FILE, JSON.stringify(employees, null, 2), 'utf-8');
  } catch (err) {
    console.error('[JSON Fallback Backup Error]:', err);
  }
}

function readLocalJsonBackup(): Employee[] {
  try {
    if (fs.existsSync(EMPLOYEES_JSON_FILE)) {
      const content = fs.readFileSync(EMPLOYEES_JSON_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[JSON Fallback Read Error]:', err);
  }
  return [];
}

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp_1', name: 'Trình Mỹ Phượng Oanh', position: 'Nhân viên HR', department: 'Phòng Hành Chính Nhân Sự' },
  { id: 'emp_2', name: 'Trần Anh Tú', position: 'Quản Lý', department: 'Phòng Kỹ Thuật' },
  { id: 'emp_3', name: 'Phan Huỳnh Tiến', position: 'Lập Trình Viên', department: 'Phòng Kỹ Thuật' },
  { id: 'emp_4', name: 'Tạ Anh Khoa', position: 'Lập Trình Viên', department: 'Phòng Kỹ Thuật' },
];

export async function ensureSchema() {
  if (isSchemaInitialized) return;
  const client = await pool.connect();
  try {
    // Create tables if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS regulations (
        id VARCHAR(255) PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        violation TEXT NOT NULL,
        penalty JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS penalties (
        id VARCHAR(255) PRIMARY KEY,
        person_name VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        notes TEXT,
        regulation JSONB NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        department VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initial Seed Employees if empty
    const empCheck = await client.query('SELECT COUNT(*) FROM employees');
    if (parseInt(empCheck.rows[0].count, 10) === 0) {
      for (const emp of DEFAULT_EMPLOYEES) {
        await client.query(
          'INSERT INTO employees (id, name, position, department) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [emp.id, emp.name, emp.position, emp.department]
        );
      }
      ensureLocalJsonBackup(DEFAULT_EMPLOYEES);
      console.log('[PostgreSQL] Seeded initial default employees.');
    }

    isSchemaInitialized = true;
    console.log('[PostgreSQL] Database schema initialized successfully.');
  } finally {
    client.release();
  }
}

// Helper to safely parse JSON object or string
function parseJson<T>(value: any): T {
  if (!value) return {} as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return {} as T;
    }
  }
  return value as T;
}

// --- EMPLOYEES CRUD HANDLERS (PostgreSQL + JSON Backup Fallback) ---

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    await ensureSchema();
    const res = await pool.query('SELECT id, name, position, department, created_at as "createdAt" FROM employees ORDER BY created_at ASC');
    const employees = res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      position: row.position || undefined,
      department: row.department || undefined,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
    }));
    ensureLocalJsonBackup(employees);
    return employees;
  } catch (err) {
    console.warn('[PostgreSQL Fetch Employees Failed - Falling back to Local JSON]:', err);
    const local = readLocalJsonBackup();
    return local.length > 0 ? local : DEFAULT_EMPLOYEES;
  }
}

export async function createEmployee(data: Omit<Employee, 'id'> & { id?: string }): Promise<Employee> {
  const newId = data.id || `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: Employee = {
    id: newId,
    name: data.name,
    position: data.position || '',
    department: data.department || '',
    createdAt: new Date().toISOString(),
  };

  try {
    await ensureSchema();
    await pool.query(
      'INSERT INTO employees (id, name, position, department) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, position = $3, department = $4',
      [record.id, record.name, record.position, record.department]
    );
  } catch (err) {
    console.warn('[PostgreSQL Create Employee Failed - Saving to Local JSON Fallback]:', err);
  }

  // Backup sync to Local JSON
  const currentList = readLocalJsonBackup();
  const updatedList = [record, ...currentList.filter(e => e.id !== record.id)];
  ensureLocalJsonBackup(updatedList);

  return record;
}

export async function updateEmployeeRecord(id: string, data: Partial<Omit<Employee, 'id'>>): Promise<void> {
  try {
    await ensureSchema();
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(data.name);
    }
    if (data.position !== undefined) {
      fields.push(`position = $${index++}`);
      values.push(data.position);
    }
    if (data.department !== undefined) {
      fields.push(`department = $${index++}`);
      values.push(data.department);
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE employees SET ${fields.join(', ')} WHERE id = $${index}`, values);
    }
  } catch (err) {
    console.warn('[PostgreSQL Update Employee Failed]:', err);
  }

  // Sync to Local JSON
  const currentList = readLocalJsonBackup();
  const updatedList = currentList.map(e => e.id === id ? { ...e, ...data } : e);
  ensureLocalJsonBackup(updatedList);
}

export async function removeEmployeeRecord(id: string): Promise<void> {
  try {
    await ensureSchema();
    await pool.query('DELETE FROM employees WHERE id = $1', [id]);
  } catch (err) {
    console.warn('[PostgreSQL Delete Employee Failed]:', err);
  }

  // Sync to Local JSON
  const currentList = readLocalJsonBackup();
  const updatedList = currentList.filter(e => e.id !== id);
  ensureLocalJsonBackup(updatedList);
}

// --- REGULATIONS CRUD HANDLERS ---

export async function fetchRegulations(): Promise<Regulation[]> {
  await ensureSchema();
  const res = await pool.query('SELECT id, category, violation, penalty FROM regulations ORDER BY created_at DESC');
  return res.rows.map((row) => ({
    id: row.id,
    category: row.category,
    violation: row.violation,
    penalty: parseJson(row.penalty),
  }));
}

export async function createRegulation(data: Omit<Regulation, 'id'> & { id?: string }): Promise<Regulation> {
  await ensureSchema();
  const newId = data.id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: Regulation = {
    id: newId,
    category: data.category,
    violation: data.violation,
    penalty: data.penalty,
  };

  const penaltyJson = JSON.stringify(record.penalty);

  await pool.query(
    'INSERT INTO regulations (id, category, violation, penalty) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET category = $2, violation = $3, penalty = $4',
    [record.id, record.category, record.violation, penaltyJson]
  );

  return record;
}

export async function updateRegulationRecord(id: string, data: Partial<Omit<Regulation, 'id'>>): Promise<void> {
  await ensureSchema();
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (data.category !== undefined) {
    fields.push(`category = $${index++}`);
    values.push(data.category);
  }
  if (data.violation !== undefined) {
    fields.push(`violation = $${index++}`);
    values.push(data.violation);
  }
  if (data.penalty !== undefined) {
    fields.push(`penalty = $${index++}`);
    values.push(JSON.stringify(data.penalty));
  }

  if (fields.length > 0) {
    values.push(id);
    await pool.query(`UPDATE regulations SET ${fields.join(', ')} WHERE id = $${index}`, values);
  }
}

export async function removeRegulationRecord(id: string): Promise<void> {
  await ensureSchema();
  await pool.query('DELETE FROM regulations WHERE id = $1', [id]);
}

// --- PENALTIES CRUD HANDLERS ---

export async function fetchPenalties(): Promise<ViolationRecord[]> {
  await ensureSchema();
  const res = await pool.query('SELECT id, person_name as "personName", date, notes, regulation, is_completed as "isCompleted" FROM penalties ORDER BY date DESC');
  return res.rows.map((row) => ({
    id: row.id,
    personName: row.personName,
    date: row.date,
    notes: row.notes,
    regulation: parseJson(row.regulation),
    isCompleted: Boolean(row.isCompleted),
  }));
}

export async function createPenalty(data: Omit<ViolationRecord, 'id'> & { id?: string }): Promise<ViolationRecord> {
  await ensureSchema();
  const newId = data.id || `pen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: ViolationRecord = {
    id: newId,
    personName: data.personName,
    date: data.date,
    notes: data.notes,
    regulation: data.regulation,
    isCompleted: data.isCompleted || false,
  };

  await pool.query(
    'INSERT INTO penalties (id, person_name, date, notes, regulation, is_completed) VALUES ($1, $2, $3, $4, $5, $6)',
    [record.id, record.personName, record.date, record.notes || null, JSON.stringify(record.regulation), record.isCompleted]
  );

  return record;
}

export async function createMultiplePenalties(penalties: Omit<ViolationRecord, 'id'>[]): Promise<void> {
  for (const pen of penalties) {
    await createPenalty(pen);
  }
}

export async function updatePenaltyRecord(id: string, data: Partial<Omit<ViolationRecord, 'id'>>): Promise<void> {
  await ensureSchema();
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (data.personName !== undefined) {
    fields.push(`person_name = $${index++}`);
    values.push(data.personName);
  }
  if (data.date !== undefined) {
    fields.push(`date = $${index++}`);
    values.push(data.date);
  }
  if (data.notes !== undefined) {
    fields.push(`notes = $${index++}`);
    values.push(data.notes);
  }
  if (data.regulation !== undefined) {
    fields.push(`regulation = $${index++}`);
    values.push(JSON.stringify(data.regulation));
  }
  if (data.isCompleted !== undefined) {
    fields.push(`is_completed = $${index++}`);
    values.push(data.isCompleted);
  }

  if (fields.length > 0) {
    values.push(id);
    await pool.query(`UPDATE penalties SET ${fields.join(', ')} WHERE id = $${index}`, values);
  }
}

export async function removePenaltyRecord(id: string): Promise<void> {
  await ensureSchema();
  await pool.query('DELETE FROM penalties WHERE id = $1', [id]);
}
