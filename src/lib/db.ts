import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Regulation, ViolationRecord } from './types';

// Safely determine writable directory for local JSON fallback
const BASE_DIR = process.env.NODE_ENV === 'production' ? os.tmpdir() : process.cwd();
const DATA_DIR = path.join(BASE_DIR, '.vux-data');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[DB Fallback Warning] Writable data dir creation skipped/failed:', err);
  }
}

const REGULATIONS_FILE = path.join(DATA_DIR, 'regulations.json');
const PENALTIES_FILE = path.join(DATA_DIR, 'penalties.json');

function initLocalJsonFiles() {
  ensureDataDir();
  try {
    if (!fs.existsSync(REGULATIONS_FILE)) {
      fs.writeFileSync(REGULATIONS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(PENALTIES_FILE)) {
      fs.writeFileSync(PENALTIES_FILE, JSON.stringify([], null, 2));
    }
  } catch (err) {
    console.warn('[DB Fallback Warning] Local JSON file init skipped:', err);
  }
}

// In-memory fallback if file system is read-only
let memoryRegulations: Regulation[] = [];
let memoryPenalties: ViolationRecord[] = [];

// Local JSON Helpers
function readLocalJson<T>(filePath: string, inMemoryFallback: T[]): T[] {
  try {
    if (!fs.existsSync(filePath)) return inMemoryFallback;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.warn(`[DB Fallback Warning] Failed reading ${filePath}, using memory fallback:`, error);
    return inMemoryFallback;
  }
}

function writeLocalJson<T>(filePath: string, data: T[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.warn(`[DB Fallback Warning] Failed writing ${filePath}:`, error);
  }
}

// PostgreSQL Connection Pool
const connectionString = process.env.DATABASE_URL;
let pool: Pool | null = null;
let isPgConnected = false;

if (connectionString) {
  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('[DB Pool Error]:', err);
    isPgConnected = false;
  });
}

let isSchemaInitialized = false;

async function ensureSchema() {
  if (!pool || isSchemaInitialized) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS regulations (
          id VARCHAR(255) PRIMARY KEY,
          category VARCHAR(255) NOT NULL,
          violation TEXT NOT NULL,
          penalty TEXT NOT NULL,
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
      isPgConnected = true;
      isSchemaInitialized = true;
      console.log('[DB] PostgreSQL schema initialized successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn('[DB Warning] PostgreSQL connection failed, switching to local JSON fallback:', error);
    isPgConnected = false;
  }
}

// Initial connection attempt
ensureSchema().catch(() => {});

// --- REGULATIONS CRUD HANDLERS ---

export async function fetchRegulations(): Promise<Regulation[]> {
  await ensureSchema();
  if (pool && isPgConnected) {
    try {
      const res = await pool.query('SELECT id, category, violation, penalty FROM regulations ORDER BY created_at DESC');
      const rows: Regulation[] = res.rows;
      memoryRegulations = rows;
      writeLocalJson(REGULATIONS_FILE, rows);
      return rows;
    } catch (error) {
      console.error('[DB Error] fetchRegulations PG failed, using local JSON fallback:', error);
    }
  }
  return readLocalJson<Regulation>(REGULATIONS_FILE, memoryRegulations);
}

export async function createRegulation(data: Omit<Regulation, 'id'> & { id?: string }): Promise<Regulation> {
  const newId = data.id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: Regulation = {
    id: newId,
    category: data.category,
    violation: data.violation,
    penalty: data.penalty,
  };

  if (pool) {
    try {
      await ensureSchema();
      if (isPgConnected) {
        await pool.query(
          'INSERT INTO regulations (id, category, violation, penalty) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET category = $2, violation = $3, penalty = $4',
          [record.id, record.category, record.violation, record.penalty]
        );
      }
    } catch (error) {
      console.error('[DB Error] createRegulation PG insert failed:', error);
    }
  }

  memoryRegulations = [record, ...memoryRegulations.filter((r) => r.id !== record.id)];
  writeLocalJson(REGULATIONS_FILE, memoryRegulations);

  return record;
}

export async function updateRegulationRecord(id: string, data: Partial<Omit<Regulation, 'id'>>): Promise<void> {
  if (pool) {
    try {
      await ensureSchema();
      if (isPgConnected) {
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
          values.push(data.penalty);
        }

        if (fields.length > 0) {
          values.push(id);
          await pool.query(`UPDATE regulations SET ${fields.join(', ')} WHERE id = $${index}`, values);
        }
      }
    } catch (error) {
      console.error('[DB Error] updateRegulationRecord PG update failed:', error);
    }
  }

  memoryRegulations = memoryRegulations.map((r) => (r.id === id ? { ...r, ...data } : r));
  writeLocalJson(REGULATIONS_FILE, memoryRegulations);
}

export async function removeRegulationRecord(id: string): Promise<void> {
  if (pool) {
    try {
      await ensureSchema();
      if (isPgConnected) {
        await pool.query('DELETE FROM regulations WHERE id = $1', [id]);
      }
    } catch (error) {
      console.error('[DB Error] removeRegulationRecord PG delete failed:', error);
    }
  }

  memoryRegulations = memoryRegulations.filter((r) => r.id !== id);
  writeLocalJson(REGULATIONS_FILE, memoryRegulations);
}

// --- PENALTIES CRUD HANDLERS ---

export async function fetchPenalties(): Promise<ViolationRecord[]> {
  await ensureSchema();
  if (pool && isPgConnected) {
    try {
      const res = await pool.query('SELECT id, person_name as "personName", date, notes, regulation, is_completed as "isCompleted" FROM penalties ORDER BY date DESC');
      const rows: ViolationRecord[] = res.rows.map((row) => ({
        id: row.id,
        personName: row.personName,
        date: row.date,
        notes: row.notes,
        regulation: typeof row.regulation === 'string' ? JSON.parse(row.regulation) : row.regulation,
        isCompleted: Boolean(row.isCompleted),
      }));

      memoryPenalties = rows;
      writeLocalJson(PENALTIES_FILE, rows);
      return rows;
    } catch (error) {
      console.error('[DB Error] fetchPenalties PG failed, using local JSON fallback:', error);
    }
  }
  return readLocalJson<ViolationRecord>(PENALTIES_FILE, memoryPenalties);
}

export async function createPenalty(data: Omit<ViolationRecord, 'id'> & { id?: string }): Promise<ViolationRecord> {
  const newId = data.id || `pen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: ViolationRecord = {
    id: newId,
    personName: data.personName,
    date: data.date,
    notes: data.notes,
    regulation: data.regulation,
    isCompleted: data.isCompleted || false,
  };

  if (pool) {
    try {
      await ensureSchema();
      if (isPgConnected) {
        await pool.query(
          'INSERT INTO penalties (id, person_name, date, notes, regulation, is_completed) VALUES ($1, $2, $3, $4, $5, $6)',
          [record.id, record.personName, record.date, record.notes || null, JSON.stringify(record.regulation), record.isCompleted]
        );
      }
    } catch (error) {
      console.error('[DB Error] createPenalty PG insert failed:', error);
    }
  }

  memoryPenalties = [record, ...memoryPenalties.filter((p) => p.id !== record.id)];
  writeLocalJson(PENALTIES_FILE, memoryPenalties);

  return record;
}

export async function createMultiplePenalties(penalties: Omit<ViolationRecord, 'id'>[]): Promise<void> {
  for (const pen of penalties) {
    await createPenalty(pen);
  }
}

export async function updatePenaltyRecord(id: string, data: Partial<Omit<ViolationRecord, 'id'>>): Promise<void> {
  if (pool) {
    try {
      await ensureSchema();
      if (isPgConnected) {
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
    } catch (error) {
      console.error('[DB Error] updatePenaltyRecord PG update failed:', error);
    }
  }

  memoryPenalties = memoryPenalties.map((p) => (p.id === id ? { ...p, ...data } : p));
  writeLocalJson(PENALTIES_FILE, memoryPenalties);
}

export async function removePenaltyRecord(id: string): Promise<void> {
  if (pool) {
    try {
      await ensureSchema();
      if (isPgConnected) {
        await pool.query('DELETE FROM penalties WHERE id = $1', [id]);
      }
    } catch (error) {
      console.error('[DB Error] removePenaltyRecord PG delete failed:', error);
    }
  }

  memoryPenalties = memoryPenalties.filter((p) => p.id !== id);
  writeLocalJson(PENALTIES_FILE, memoryPenalties);
}
