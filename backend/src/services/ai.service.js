import * as aiModel from '../models/airesult.model.js';
import * as patientModel from '../models/patient.model.js';

function mockDiagnosis(symptoms, vitals) {
  const riskScore = Math.min(
    100,
    Math.max(
      0,
      (vitals.temperature > 38 ? 25 : 0) +
        (vitals.glucose > 140 ? 20 : 0) +
        (vitals.SpO2 < 94 ? 25 : 0) +
        (vitals.BP.includes('/') && Number(vitals.BP.split('/')[0]) > 140 ? 20 : 0)
    )
  );

  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  const prediction = riskLevel === 'high' ? 'Possible urgent condition' : riskLevel === 'medium' ? 'Possible moderate risk condition' : 'Low risk presentation';
  const recommendation =
    riskLevel === 'high'
      ? 'Refer patient to the nearest facility immediately and perform further tests.'
      : riskLevel === 'medium'
      ? 'Provide closer monitoring, follow up within 24-48 hours, and consider additional diagnostics.'
      : 'Continue standard care and monitor symptoms over the next few days.';

  return { prediction, riskLevel, recommendation, riskScore };
}

export async function diagnosePatient({ patientId, symptoms, vitals }) {
  const patient = await patientModel.findPatientById(patientId);
  if (!patient) {
    const error = new Error('Invalid patientId');
    error.status = 400;
    throw error;
  }

  const normalizedVitals = {
    BP: vitals.BP || '',
    temperature: Number(vitals.temperature) || 0,
    glucose: Number(vitals.glucose) || 0,
    SpO2: Number(vitals.SpO2) || 0,
  };

  const { prediction, riskLevel, recommendation, riskScore } = mockDiagnosis(symptoms, normalizedVitals);
  const aiResult = await aiModel.createAiResult({
    patient_id: patientId,
    symptoms,
    prediction,
    riskLevel,
    recommendation,
    synced: 0,
  });

  return { ...aiResult, riskScore };
}

export async function generatePrescription({ patientId, diagnosis, medications, symptoms }) {
  const patient = await patientModel.findPatientById(patientId);
  if (!patient) {
    const error = new Error('Invalid patientId');
    error.status = 400;
    throw error;
  }

  // Generate medications based on diagnosis/symptoms
  const generatedMedications = generateMedications(diagnosis, symptoms);

  // Generate prescription recommendations based on diagnosis and symptoms
  const prescriptionData = {
    patientId,
    diagnosis,
    medications: generatedMedications,
    generatedAt: new Date().toISOString(),
    instructions: generateInstructions(symptoms, diagnosis),
    warnings: generateWarnings(generatedMedications),
    doctorName: 'AI System',
  };

  return prescriptionData;
}

function generateMedications(diagnosis, symptoms) {
  const medications = [];
  const diagnosisLower = diagnosis.toLowerCase();
  const symptomsLower = symptoms.toLowerCase();
  
  // Fever-related medications
  if (diagnosisLower.includes('fever') || diagnosisLower.includes('high temperature') || symptomsLower.includes('fever')) {
    medications.push('Paracetamol 500mg - 3 times daily');
    medications.push('Ibuprofen 400mg - Every 6 hours if needed');
    if (diagnosisLower.includes('flu') || diagnosisLower.includes('cold')) {
      medications.push('Vitamin C 1000mg - Daily');
    }
  }
  
  // Cough-related medications
  if (diagnosisLower.includes('cough') || diagnosisLower.includes('cold') || symptomsLower.includes('cough')) {
    medications.push('Cough Syrup DXM - 10ml every 4-6 hours');
    medications.push('Lozenges - 1 lozenge every 2-3 hours');
    if (diagnosisLower.includes('productive cough') || diagnosisLower.includes('phlegm')) {
      medications.push('Ambroxol 30mg - 3 times daily');
    }
  }
  
  // Pain-related medications
  if (diagnosisLower.includes('pain') || diagnosisLower.includes('ache') || symptomsLower.includes('pain')) {
    medications.push('Paracetamol 500mg - 3 times daily');
    medications.push('Ibuprofen 400mg - Every 6 hours if needed');
    if (diagnosisLower.includes('muscle') || diagnosisLower.includes('joint')) {
      medications.push('Muscle Relaxant - As prescribed');
    }
  }
  
  // Headache/Migraine medications
  if (diagnosisLower.includes('headache') || diagnosisLower.includes('migraine') || symptomsLower.includes('headache')) {
    medications.push('Aspirin 500mg - Twice daily');
    medications.push('Paracetamol 500mg - 3 times daily');
  }
  
  // Respiratory infections
  if (diagnosisLower.includes('respiratory') || diagnosisLower.includes('bronchitis') || diagnosisLower.includes('pneumonia')) {
    medications.push('Amoxicillin 500mg - 3 times daily for 7 days');
    medications.push('Inhalant Steam Therapy - Twice daily');
    medications.push('Cough Syrup - 10ml every 4-6 hours');
  }
  
  // Nausea/Vomiting
  if (diagnosisLower.includes('nausea') || diagnosisLower.includes('vomiting') || symptomsLower.includes('nausea')) {
    medications.push('Metoclopramide 10mg - 3 times daily');
    medications.push('Ginger - As natural remedy');
  }
  
  // Diarrhea
  if (diagnosisLower.includes('diarrhea') || diagnosisLower.includes('gastroenteritis') || symptomsLower.includes('diarrhea')) {
    medications.push('Loperamide 2mg - After each loose stool');
    medications.push('Oral Rehydration Salts - As needed');
    medications.push('Probiotics - Daily');
  }
  
  // Acid Reflux/GERD
  if (diagnosisLower.includes('reflux') || diagnosisLower.includes('heartburn') || symptomsLower.includes('heartburn')) {
    medications.push('Omeprazole 20mg - Daily before breakfast');
    medications.push('Antacid - As needed');
  }
  
  // Allergies
  if (diagnosisLower.includes('allergy') || diagnosisLower.includes('allergic') || symptomsLower.includes('allergy')) {
    medications.push('Cetirizine 10mg - Once daily');
    medications.push('Antihistamine Cream - Topically as needed');
  }
  
  // Hypertension (if high BP mentioned)
  if (diagnosisLower.includes('hypertension') || diagnosisLower.includes('high blood pressure')) {
    medications.push('Amlodipine 5mg - Once daily');
    medications.push('Lisinopril 10mg - Once daily');
  }
  
  // Diabetes
  if (diagnosisLower.includes('diabetes') || diagnosisLower.includes('hyperglycemia')) {
    medications.push('Metformin 500mg - 3 times daily');
    medications.push('Blood Sugar Monitoring - Twice daily');
  }
  
  // Default general medications if no specific condition
  if (medications.length === 0) {
    medications.push('Paracetamol 500mg - 3 times daily as needed');
    medications.push('Rest and Hydration - Recommended');
    medications.push('Follow-up with healthcare provider - Within 7 days');
  }
  
  return medications;
}

function generateInstructions(symptoms, diagnosis) {
  const instructions = [];
  
  if (diagnosis.toLowerCase().includes('fever')) {
    instructions.push('Take medication with food or water');
    instructions.push('Monitor temperature every 4-6 hours');
  }
  if (diagnosis.toLowerCase().includes('cough')) {
    instructions.push('Take medication as prescribed');
    instructions.push('Avoid smoking and secondhand smoke');
  }
  if (diagnosis.toLowerCase().includes('pain')) {
    instructions.push('Do not exceed recommended dosage');
    instructions.push('Avoid activities that may aggravate the condition');
  }
  
  instructions.push('Complete the full course of medication');
  instructions.push('Report any adverse reactions immediately');
  
  return instructions;
}

function generateWarnings(medications) {
  const warnings = [];
  
  if (medications && medications.length > 0) {
    medications.forEach(med => {
      if (med.toLowerCase().includes('aspirin')) {
        warnings.push('Do not use if allergic to aspirin');
        warnings.push('May cause stomach irritation - take with food');
      }
      if (med.toLowerCase().includes('antibiotic')) {
        warnings.push('Complete full course even if symptoms improve');
        warnings.push('May interact with oral contraceptives');
      }
    });
  }
  
  warnings.push('Consult doctor if symptoms persist after 5 days');
  warnings.push('Keep medication out of reach of children');
  
  return warnings;
}

export default {
  diagnosePatient,
  generatePrescription,
};
