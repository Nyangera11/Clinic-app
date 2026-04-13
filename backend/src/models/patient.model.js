import { pool } from '../config/db.js';

export async function createPatient({ name, DOB, gender, location, contact }) {
  const [result] = await pool.execute(
    'INSERT INTO patients (name, DOB, gender, location, contact) VALUES (?, ?, ?, ?, ?)',
    [name, DOB, gender, location, contact]
  );
  return { id: result.insertId, name, DOB, gender, location, contact };
}

export async function updatePatient(id, updates) {
  const fields = [];
  const values = [];

  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.DOB) {
    fields.push('DOB = ?');
    values.push(updates.DOB);
  }
  if (updates.gender) {
    fields.push('gender = ?');
    values.push(updates.gender);
  }
  if (updates.location) {
    fields.push('location = ?');
    values.push(updates.location);
  }
  if (updates.contact) {
    fields.push('contact = ?');
    values.push(updates.contact);
  }

  if (fields.length === 0) {
    return findPatientById(id);
  }

  values.push(id);
  const [result] = await pool.execute(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, values);
  if (result.affectedRows === 0) {
    return null;
  }
  return findPatientById(id);
}

export async function findPatientById(id) {
  const [rows] = await pool.execute('SELECT id, name, DOB, gender, location, contact, createdAt FROM patients WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function listPatients(query) {
  let sql = 'SELECT id, name, DOB, gender, location, contact, createdAt FROM patients';
  const values = [];
  if (query) {
    sql += ' WHERE name LIKE ? OR location LIKE ? OR contact LIKE ?';
    const search = `%${query}%`;
    values.push(search, search, search);
  }
  sql += ' ORDER BY createdAt DESC';
  const [rows] = await pool.execute(sql, values);
  return rows;
}
