import * as patientService from './patient.service.js';
import * as vitalsService from './vitals.service.js';
import * as recordsService from './records.service.js';
import * as aiService from './ai.service.js';

export async function syncBulkData(payload) {
  if (!Array.isArray(payload)) {
    const error = new Error('Sync payload must be an array');
    error.status = 400;
    throw error;
  }

  const results = {
    patients: [],
    vitals: [],
    records: [],
    aiResults: [],
  };

  for (const item of payload) {
    if (!item.entity || !item.data) continue;
    switch (item.entity) {
      case 'patients': {
        const saved = await patientService.createPatient(item.data);
        results.patients.push({ ...saved, synced: true });
        break;
      }
      case 'vitals': {
        const saved = await vitalsService.createVital({ ...item.data, synced: 1 });
        results.vitals.push(saved);
        break;
      }
      case 'medical_records': {
        const saved = await recordsService.createMedicalRecord({ ...item.data, synced: 1 });
        results.records.push(saved);
        break;
      }
      case 'ai_results': {
        const saved = await aiService.diagnosePatient({
          patientId: item.data.patientId,
          symptoms: item.data.symptoms,
          vitals: item.data.vitals,
        });
        results.aiResults.push({ ...saved, synced: true });
        break;
      }
      default:
        break;
    }
  }

  return results;
}

export default {
  syncBulkData,
};
