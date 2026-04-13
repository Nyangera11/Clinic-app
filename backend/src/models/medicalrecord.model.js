import { pool } from '../config/db.js';

export async function createMedicalRecord({ patient_id, diagnosis, treatment, notes, synced = 0 }) {
  const [result] = await pool.execute(
    'INSERT INTO medical_records (patient_id, diagnosis, treatment, notes, synced) VALUES (?, ?, ?, ?, ?)',
    [patient_id, diagnosis, treatment, notes || null, synced]
  );
  return { id: result.insertId, patient_id, diagnosis, treatment, notes: notes || null, synced };
}

export async function findMedicalRecordsByPatient(patientId) {
  const [rows] = await pool.execute(
    'SELECT id, patient_id, diagnosis, treatment, notes, synced, createdAt FROM medical_records WHERE patient_id = ? ORDER BY createdAt DESC',
    [patientId]
  );
  return rows;
}
