import { pool } from '../config/db.js';

export async function createVital({ patient_id, BP, temperature, glucose, SpO2, timestamp, synced = 0 }) {
  const [result] = await pool.execute(
    'INSERT INTO vitals (patient_id, BP, temperature, glucose, SpO2, timestamp, synced) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [patient_id, BP, temperature, glucose, SpO2, timestamp || new Date(), synced]
  );
  return { id: result.insertId, patient_id, BP, temperature, glucose, SpO2, timestamp: timestamp || new Date(), synced };
}

export async function findVitalsByPatient(patientId) {
  const [rows] = await pool.execute(
    'SELECT id, patient_id, BP, temperature, glucose, SpO2, timestamp, synced, createdAt FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC',
    [patientId]
  );
  return rows;
}
