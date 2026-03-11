import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'tdms.db');

let db;

export async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      student_id TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      document_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT DEFAULT (datetime('now')),
      is_reuploaded INTEGER DEFAULT 0
    );
  `);

  try {
    db.run("ALTER TABLE submissions ADD COLUMN is_reuploaded INTEGER DEFAULT 0");
  } catch (err) {
    // Column probably already exists
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS examiners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      event_date TEXT NOT NULL,
      clocktime TIME,
      chief_examiner TEXT,
      secretary TEXT,
      examiner_1 TEXT,
      examiner_2 TEXT,
      examiner_3 TEXT,
      examiner_4 TEXT
    );
  `);

  try {
    db.run("ALTER TABLE schedules ADD COLUMN clocktime TIME");
  } catch (err) {
    // Column probably already exists
  }

  // Seed data (only if tables are empty)
  const userCount = db.exec('SELECT COUNT(*) as count FROM users')[0]?.values[0][0] || 0;
  if (userCount === 0) {
    const hashedPassword = bcrypt.hashSync('Hermawan1234', 10);
    const studentPassword = bcrypt.hashSync('password123', 10);

    db.run(
      'INSERT INTO users (name, student_id, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['John Doe', '12345678', 'john@student.ac.id', studentPassword, 'student']
    );
    db.run(
      'INSERT INTO users (name, student_id, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Admin Vera', null, 'vera@admin.ac.id', hashedPassword, 'verificator']
    );
    db.run(
      'INSERT INTO users (name, student_id, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Prof. Smith', null, 'smith@faculty.ac.id', hashedPassword, 'supervisor']
    );
    console.log('✅ Seeded default users (verificator/supervisor password: Hermawan1234)');
  }

  const examinerCount = db.exec('SELECT COUNT(*) as count FROM examiners')[0]?.values[0][0] || 0;
  if (examinerCount === 0) {
    db.run('INSERT INTO examiners (name) VALUES (?)', ['Dr. Alan Turing']);
    db.run('INSERT INTO examiners (name) VALUES (?)', ['Dr. Ada Lovelace']);
    db.run('INSERT INTO examiners (name) VALUES (?)', ['Dr. Grace Hopper']);
    console.log('✅ Seeded default examiners');
  }

  saveDatabase();
  console.log('✅ Database initialized');
  return db;
}

export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function getDb() {
  return db;
}

// Helper: run a query and return all results as objects
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run a query and return first result as object
export function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper: run INSERT/UPDATE/DELETE and return lastInsertRowid
export function runSql(sql, params = []) {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  const lastId = result[0]?.values[0][0] || 0;
  saveDatabase();
  return lastId;
}
