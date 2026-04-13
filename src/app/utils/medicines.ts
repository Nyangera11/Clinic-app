// Common medications database - can be extended with more medicines
export const commonMedicines = [
  // Antibiotics
  { name: 'Amoxicillin', category: 'Antibiotic', dosages: ['250mg', '500mg', '1000mg'] },
  { name: 'Azithromycin', category: 'Antibiotic', dosages: ['250mg', '500mg'] },
  { name: 'Ciprofloxacin', category: 'Antibiotic', dosages: ['250mg', '500mg', '750mg'] },
  { name: 'Metronidazole', category: 'Antibiotic', dosages: ['200mg', '400mg', '500mg'] },
  
  // Pain & Anti-inflammatory
  { name: 'Paracetamol', category: 'Pain Relief', dosages: ['500mg', '1000mg'] },
  { name: 'Ibuprofen', category: 'Anti-inflammatory', dosages: ['200mg', '400mg', '600mg'] },
  { name: 'Aspirin', category: 'Pain Relief', dosages: ['100mg', '300mg', '500mg'] },
  { name: 'Diclofenac', category: 'Anti-inflammatory', dosages: ['25mg', '50mg', '75mg'] },
  
  // Antacids & GI
  { name: 'Omeprazole', category: 'Antacid', dosages: ['20mg', '40mg'] },
  { name: 'Ranitidine', category: 'Antacid', dosages: ['75mg', '150mg', '300mg'] },
  { name: 'Metoclopramide', category: 'GI', dosages: ['10mg'] },
  
  // Cough & Cold
  { name: 'Codeine', category: 'Cough Suppressant', dosages: ['15mg', '30mg'] },
  { name: 'Chlorpheniramine', category: 'Antihistamine', dosages: ['2mg', '4mg'] },
  { name: 'Phenylephrine', category: 'Decongestant', dosages: ['10mg'] },
  
  // Hypertension
  { name: 'Lisinopril', category: 'Antihypertensive', dosages: ['5mg', '10mg', '20mg'] },
  { name: 'Amlodipine', category: 'Antihypertensive', dosages: ['2.5mg', '5mg', '10mg'] },
  { name: 'Metoprolol', category: 'Beta Blocker', dosages: ['25mg', '50mg', '100mg'] },
  
  // Diabetes
  { name: 'Metformin', category: 'Antidiabetic', dosages: ['500mg', '850mg', '1000mg'] },
  { name: 'Glibenclamide', category: 'Antidiabetic', dosages: ['2.5mg', '5mg'] },
  
  // Respiratory
  { name: 'Salbutamol', category: 'Bronchodilator', dosages: ['100mcg', '200mcg'] },
  { name: 'Theophylline', category: 'Bronchodilator', dosages: ['125mg', '250mg'] },
  
  // Antimalarials
  { name: 'Artemether', category: 'Antimalarial', dosages: ['20mg', '40mg', '80mg'] },
  { name: 'Quinine', category: 'Antimalarial', dosages: ['200mg', '300mg'] },
  { name: 'Chloroquine', category: 'Antimalarial', dosages: ['150mg', '300mg'] },
  
  // Vitamins & Supplements
  { name: 'Vitamin C', category: 'Vitamin', dosages: ['250mg', '500mg', '1000mg'] },
  { name: 'Vitamin B Complex', category: 'Vitamin', dosages: ['1 tablet'] },
  { name: 'Iron supplement', category: 'Supplement', dosages: ['65mg', '130mg'] },
  
  // Others
  { name: 'Antihistamine', category: 'Allergy', dosages: ['5mg', '10mg'] },
];

export const dosageFrequencies = [
  'Once daily (OD)',
  'Twice daily (BD)',
  'Thrice daily (TDS)',
  'Four times daily (QID)',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
];

export const dosageDurations = [
  '1 day',
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  'As advised',
];
