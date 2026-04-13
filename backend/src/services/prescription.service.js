import * as prescriptionModel from '../models/prescription.model.js';

export async function createPrescription(data) {
  const prescription = await prescriptionModel.createPrescription(data);
  return prescription;
}

export async function getPrescriptionsByPatient(patientId) {
  const prescriptions = await prescriptionModel.getPrescriptionsByPatient(patientId);
  return prescriptions;
}

export async function getPrescriptionById(id) {
  const prescription = await prescriptionModel.getPrescriptionById(id);
  return prescription;
}

export async function getPrescriptionsByAppointment(appointmentId) {
  const prescriptions = await prescriptionModel.getPrescriptionsByAppointment(appointmentId);
  return prescriptions;
}

export async function updatePrescription(id, updates) {
  const prescription = await prescriptionModel.updatePrescription(id, updates);
  return prescription;
}

export async function deletePrescription(id) {
  const result = await prescriptionModel.deletePrescription(id);
  return result;
}

export default {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  getPrescriptionsByAppointment,
  updatePrescription,
  deletePrescription,
};
