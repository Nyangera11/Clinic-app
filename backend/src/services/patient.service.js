import * as patientModel from '../models/patient.model.js';

export async function listPatients(query) {
  return patientModel.listPatients(query);
}

export async function createPatient(data) {
  // Normalize data to handle both frontend and backend formats
  const normalized = {
    // Support both 'name' (backend) and 'firstName/lastName' (frontend)
    name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    
    // Support both 'DOB' (backend) and 'dateOfBirth' (frontend), default to 1990-01-01 if not provided
    DOB: data.DOB || data.dateOfBirth || '1990-01-01',
    
    // Support both 'gender' and default to 'other' if not provided
    gender: data.gender || 'other',
    
    // Support both 'location' (backend) and 'village' (frontend), default to 'Unknown'
    location: data.location || data.village || 'Unknown',
    
    // Support both 'contact' (backend) and 'phone' (frontend), default to empty string
    contact: data.contact || data.phone || '',
  };

  // Validate required fields
  if (!normalized.name || normalized.name.trim() === '') {
    const error = new Error('name is required');
    error.status = 400;
    throw error;
  }

  return patientModel.createPatient(normalized);
}

export async function getPatientById(id) {
  return patientModel.findPatientById(id);
}

export async function updatePatient(id, updates) {
  return patientModel.updatePatient(id, updates);
}

export default {
  listPatients,
  createPatient,
  getPatientById,
  updatePatient,
};
