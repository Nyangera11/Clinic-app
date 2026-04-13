import recordsService from '../services/records.service.js';

export async function createMedicalRecord(req, res, next) {
  try {
    const record = await recordsService.createMedicalRecord(req.body);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
}

export async function getRecordsByPatient(req, res, next) {
  try {
    const { patientId } = req.params;
    const records = await recordsService.getRecordsByPatient(Number(patientId));
    res.json(records);
  } catch (error) {
    next(error);
  }
}
