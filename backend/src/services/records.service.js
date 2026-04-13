import * as patientModel from '../models/patient.model.js';
import * as medicalRecordModel from '../models/medicalrecord.model.js';

export async function createMedicalRecord(data) {
  const patient = await patientModel.findPatientById(data.patientId);
  if (!patient) {
    const error = new Error('Invalid patientId');
    error.status = 400;
    throw error;
  }
  return medicalRecordModel.createMedicalRecord({
    patient_id: data.patientId,
    diagnosis: data.diagnosis,
    treatment: data.treatment,
    notes: data.notes,
    synced: 0,
  });
}

export async function getRecordsByPatient(patientId) {
  return medicalRecordModel.findMedicalRecordsByPatient(patientId);
}

export default {
  createMedicalRecord,
  getRecordsByPatient,
};
