import aiService from '../services/ai.service.js';

export async function diagnosePatient(req, res, next) {
  try {
    const { patientId, symptoms, vitals } = req.body;
    const result = await aiService.diagnosePatient({ patientId, symptoms, vitals });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generatePrescription(req, res, next) {
  try {
    const { patientId, diagnosis, medications, symptoms } = req.body;
    
    if (!patientId || !diagnosis) {
      return res.status(400).json({ error: 'patientId and diagnosis are required' });
    }
    
    const result = await aiService.generatePrescription({ patientId, diagnosis, medications, symptoms });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
