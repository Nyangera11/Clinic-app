import { pool } from '../config/db.js';

export async function createAiResult({ patient_id, symptoms, prediction, riskLevel, recommendation, synced = 0 }) {
  const [result] = await pool.execute(
    'INSERT INTO ai_results (patient_id, symptoms, prediction, riskLevel, recommendation, synced) VALUES (?, ?, ?, ?, ?, ?)',
    [patient_id, symptoms, prediction, riskLevel, recommendation, synced]
  );
  return { id: result.insertId, patient_id, symptoms, prediction, riskLevel, recommendation, synced };
}

export async function findAiResultsByPatient(patientId) {
  const [rows] = await pool.execute(
    'SELECT id, patient_id, symptoms, prediction, riskLevel, recommendation, synced, createdAt FROM ai_results WHERE patient_id = ? ORDER BY createdAt DESC',
    [patientId]
  );
  return rows;
}
