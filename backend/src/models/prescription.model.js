import { pool } from '../config/db.js';

export async function createPrescription({ appointmentId, patientId, medicines, doctorName, notes, createdAt = new Date().toISOString() }) {
  const [result] = await pool.execute(
    'INSERT INTO prescriptions (appointmentId, patientId, medicines, doctorName, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [appointmentId, patientId, JSON.stringify(medicines), doctorName, notes || null, createdAt]
  );
  return { 
    id: result.insertId, 
    appointmentId, 
    patientId, 
    medicines, 
    doctorName, 
    notes: notes || null, 
    createdAt 
  };
}

export async function getPrescriptionsByPatient(patientId) {
  const [rows] = await pool.query(
    'SELECT id, appointmentId, patientId, medicines, doctorName, notes, createdAt FROM prescriptions WHERE patientId = ? ORDER BY createdAt DESC',
    [patientId]
  );
  return rows.map(row => ({
    ...row,
    medicines: typeof row.medicines === 'string' ? JSON.parse(row.medicines) : row.medicines
  }));
}

export async function getPrescriptionById(id) {
  const [rows] = await pool.query(
    'SELECT id, appointmentId, patientId, medicines, doctorName, notes, createdAt FROM prescriptions WHERE id = ?',
    [id]
  );
  if (rows && rows.length > 0) {
    const row = rows[0];
    return {
      ...row,
      medicines: typeof row.medicines === 'string' ? JSON.parse(row.medicines) : row.medicines
    };
  }
  return null;
}

export async function getPrescriptionsByAppointment(appointmentId) {
  const [rows] = await pool.query(
    'SELECT id, appointmentId, patientId, medicines, doctorName, notes, createdAt FROM prescriptions WHERE appointmentId = ? ORDER BY createdAt DESC',
    [appointmentId]
  );
  return rows.map(row => ({
    ...row,
    medicines: typeof row.medicines === 'string' ? JSON.parse(row.medicines) : row.medicines
  }));
}

export async function updatePrescription(id, updates) {
  const { medicines, notes } = updates;
  const updateFields = [];
  const params = [];

  if (medicines !== undefined) {
    updateFields.push('medicines = ?');
    params.push(JSON.stringify(medicines));
  }
  if (notes !== undefined) {
    updateFields.push('notes = ?');
    params.push(notes);
  }

  if (updateFields.length === 0) return null;

  params.push(id);
  const query = `UPDATE prescriptions SET ${updateFields.join(', ')} WHERE id = ?`;

  const [result] = await pool.execute(query, params);
  if (result.affectedRows === 0) return null;

  return getPrescriptionById(id);
}

export async function deletePrescription(id) {
  const [result] = await pool.execute('DELETE FROM prescriptions WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
