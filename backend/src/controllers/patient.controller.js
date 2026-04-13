import patientService from '../services/patient.service.js';

export async function listPatients(req, res, next) {
  try {
    const { q } = req.query;
    const patients = await patientService.listPatients(q);
    res.json(patients);
  } catch (error) {
    next(error);
  }
}

export async function createPatient(req, res, next) {
  try {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
}

export async function getPatientById(req, res, next) {
  try {
    const { id } = req.params;
    const patient = await patientService.getPatientById(Number(id));
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
}

export async function updatePatient(req, res, next) {
  try {
    const { id } = req.params;
    const patient = await patientService.updatePatient(Number(id), req.body);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
}
