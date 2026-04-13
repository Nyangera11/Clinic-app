import * as vitalsModel from '../models/vitals.model.js';
import * as patientModel from '../models/patient.model.js';

export async function createVital(data) {
  const patient = await patientModel.findPatientById(data.patient_id);
  if (!patient) {
    const error = new Error('Invalid patient_id');
    error.status = 400;
    throw error;
  }
  return vitalsModel.createVital({ ...data, synced: 0 });
}

export async function getVitalsByPatient(patientId) {
  return vitalsModel.findVitalsByPatient(patientId);
}

export default {
  createVital,
  getVitalsByPatient,
};
