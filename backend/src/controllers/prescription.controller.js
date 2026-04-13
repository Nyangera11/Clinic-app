import prescriptionService from '../services/prescription.service.js';

export async function createPrescription(req, res, next) {
  try {
    const { appointmentId, patientId, medicines, doctorName, notes } = req.body;

    if (!patientId || !medicines || !doctorName) {
      return res.status(400).json({ error: 'patientId, medicines, and doctorName are required' });
    }

    const prescription = await prescriptionService.createPrescription({
      appointmentId,
      patientId,
      medicines,
      doctorName,
      notes,
    });

    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
}

export async function getPrescriptionsByPatient(req, res, next) {
  try {
    const { patientId } = req.params;
    const prescriptions = await prescriptionService.getPrescriptionsByPatient(Number(patientId));
    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
}

export async function getPrescriptionById(req, res, next) {
  try {
    const { id } = req.params;
    const prescription = await prescriptionService.getPrescriptionById(Number(id));
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    next(error);
  }
}

export async function updatePrescription(req, res, next) {
  try {
    const { id } = req.params;
    const prescription = await prescriptionService.updatePrescription(Number(id), req.body);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    next(error);
  }
}

export async function deletePrescription(req, res, next) {
  try {
    const { id } = req.params;
    const result = await prescriptionService.deletePrescription(Number(id));
    if (!result) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export default {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};
