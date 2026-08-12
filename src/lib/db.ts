import { Pool } from 'pg';
import type { Regulation, ViolationRecord } from './types';

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
    `);

    // Schema Migration: Ensure regulations.penalty column is of type JSONB
    try {
      await client.query(`
        ALTER TABLE regulations ALTER COLUMN penalty TYPE JSONB USING (
          CASE 
            WHEN penalty::text LIKE '{%' THEN penalty::jsonb 
            ELSE jsonb_build_object('type', 'fine', 'amount', 0)
          END
        );
      `);
    } catch (e) {
      // Ignore if already JSONB
    }

    // Clean up any corrupted [object Object] records from previous insertions
    try {
      await client.query(`
        UPDATE regulations 
        SET penalty = jsonb_build_object('type', 'fine', 'amount', 50000) 
        WHERE penalty::text LIKE '%object%' OR penalty::text = '"{}"';
      `);
    } catch (e) {
      // Ignore
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
