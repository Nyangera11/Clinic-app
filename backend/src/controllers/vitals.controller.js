import vitalsService from '../services/vitals.service.js';

export async function createVital(req, res, next) {
  try {
    const vital = await vitalsService.createVital(req.body);
    res.status(201).json(vital);
  } catch (error) {
    next(error);
  }
}

export async function getVitalsByPatient(req, res, next) {
  try {
    const { patientId } = req.params;
    const vitals = await vitalsService.getVitalsByPatient(Number(patientId));
    res.json(vitals);
  } catch (error) {
    next(error);
  }
}
