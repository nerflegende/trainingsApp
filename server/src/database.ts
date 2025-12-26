import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'data', 'trainingsapp.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db: DatabaseType = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      gender TEXT,
      body_weight REAL,
      body_height REAL,
      age INTEGER,
      weekly_goal INTEGER DEFAULT 3,
      step_goal INTEGER DEFAULT 10000,
      pal_value REAL DEFAULT 1.4,
      dark_mode INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- Workout plans table
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      days TEXT NOT NULL,
      is_template INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Workout history table
    CREATE TABLE IF NOT EXISTS workout_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      plan_name TEXT,
      day_name TEXT,
      exercises TEXT NOT NULL,
      duration INTEGER NOT NULL,
      total_weight REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Body measurements table
    CREATE TABLE IF NOT EXISTS body_measurements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      weight REAL,
      height REAL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Custom exercises table
    CREATE TABLE IF NOT EXISTS custom_exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      muscles TEXT NOT NULL,
      gadgets TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL
    );

    -- Custom gadgets table
    CREATE TABLE IF NOT EXISTS custom_gadgets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
    CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_workout_history_date ON workout_history(date);
    CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
    CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON body_measurements(date);
  `);

  // Add new columns if they don't exist (for migration)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN age INTEGER`);
  } catch { /* Column may already exist */ }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN step_goal INTEGER DEFAULT 10000`);
  } catch { /* Column may already exist */ }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN pal_value REAL DEFAULT 1.4`);
  } catch { /* Column may already exist */ }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN gender TEXT`);
  } catch { /* Column may already exist */ }
  try {
    db.exec(`ALTER TABLE workout_history ADD COLUMN total_weight REAL DEFAULT 0`);
  } catch { /* Column may already exist */ }

  console.log('Database initialized successfully');
}

export default db;
