import { pool } from '../config/db.js';

export async function createUser({ name, email, passwordHash, phone = '', role }) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, passwordHash, phone, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, phone, role]
  );
  return { id: result.insertId, name, email, phone, role };
}

export async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT id, name, email, passwordHash, phone, role FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.execute('SELECT id, name, email, phone, role FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function listUsers() {
  const [rows] = await pool.execute('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
  return rows;
}

export async function listDoctors() {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role FROM users WHERE role IN ('health_worker', 'admin') ORDER BY name ASC"
  );
  return rows;
}

export async function listPatients() {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role FROM users WHERE role = 'patient' ORDER BY name ASC"
  );
  return rows;
}
