import express from 'express';
import * as db from './db.js';

const router = express.Router();

function parseIntId(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error('Invalid id');
  return parsed;
}

// Patients
router.get('/patients', async (req, res) => {
  const { q, dateOfBirth, status } = req.query;
  let patients = await db.getPatients();

  if (q) {
    const search = String(q).toLowerCase();
    patients = patients.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(search) ||
        p.lastName?.toLowerCase().includes(search) ||
        p.email?.toLowerCase().includes(search) ||
        p.phone?.toLowerCase().includes(search)
    );
  }

  if (dateOfBirth) {
    patients = patients.filter((p) => p.dateOfBirth === dateOfBirth);
  }

  if (status) {
    patients = patients.filter((p) => p.status === status);
  }

  patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(patients);
});

router.get('/patients/:id', async (req, res) => {
  const id = parseIntId(req.params.id);
  const patient = await db.getPatientById(id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

router.post('/patients', async (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, village, status } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: 'firstName and lastName are required' });

  const newPatient = await db.addPatient({ firstName, lastName, email: email || null, phone: phone || null, dateOfBirth: dateOfBirth || null, village: village || null, status: status || 'Active' });
  res.status(201).json(newPatient);
});

router.put('/patients/:id', async (req, res) => {
  const id = parseIntId(req.params.id);
  const existing = await db.getPatientById(id);
  if (!existing) return res.status(404).json({ error: 'Patient not found' });

  const updated = await db.updatePatient(id, req.body);
  res.json(updated);
});

router.delete('/patients/:id', async (req, res) => {
  const id = parseIntId(req.params.id);
  const deleted = await db.deletePatient(id);
  if (!deleted) return res.status(404).json({ error: 'Patient not found' });
  res.status(204).end();
});

// Appointments
router.get('/appointments', async (req, res) => {
  const { patientId, patientEmail, provider, status } = req.query;
  let appointments = await db.getAppointments();

  if (patientId) {
    const id = parseIntId(patientId);
    appointments = appointments.filter((a) => a.patientId === id);
  }

  if (patientEmail) {
    const emailFilter = String(patientEmail).toLowerCase();
    appointments = appointments.filter((a) => a.patientEmail?.toLowerCase() === emailFilter);
  }

  if (provider) {
    const providerFilter = String(provider).toLowerCase();
    appointments = appointments.filter((a) => a.provider?.toLowerCase().includes(providerFilter));
  }

  if (status) {
    appointments = appointments.filter((a) => a.status?.toLowerCase() === String(status).toLowerCase());
  }

  appointments.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  res.json(appointments);
});

router.post('/appointments', async (req, res) => {
  const { patientId, patientName, patientEmail, patientPhone, provider, service, scheduledAt, status, notes } = req.body;
  if (!scheduledAt || !service) return res.status(400).json({ error: 'service and scheduledAt are required' });

  let effectivePatientId = patientId;

  if (!effectivePatientId) {
    if (!patientEmail || !patientName) {
      return res.status(400).json({ error: 'patientEmail and patientName are required when patientId is missing' });
    }

    const existing = (await db.getPatients()).find((p) => p.email?.toLowerCase() === String(patientEmail).toLowerCase());
    if (existing) {
      effectivePatientId = existing.id;
    } else {
      const [firstName, ...rest] = patientName.split(' ');
      const lastName = rest.join(' ') || '';
      const created = await db.addPatient({ firstName, lastName, email: patientEmail, phone: patientPhone, dateOfBirth: null });
      effectivePatientId = created.id;
    }
  }

  const appointment = await db.addAppointment({
    patientId: effectivePatientId,
    patientName,
    patientEmail,
    patientPhone,
    provider: provider || 'Any available clinician',
    service,
    scheduledAt,
    status: status || 'pending',
    notes: notes || null,
  });
  res.status(201).json(appointment);
});

router.put('/appointments/:id', async (req, res) => {
  const id = parseIntId(req.params.id);
  const existing = await db.getAppointmentById(id);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  const updated = await db.updateAppointment(id, req.body);
  res.json(updated);
});

router.patch('/appointments/:id/status', async (req, res) => {
  const id = parseIntId(req.params.id);
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  const existing = await db.getAppointmentById(id);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  const updated = await db.updateAppointment(id, { status });
  res.json(updated);
});

router.delete('/appointments/:id', async (req, res) => {
  const id = parseIntId(req.params.id);
  const deleted = await db.deleteAppointment(id);
  if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
  res.status(204).end();
});

// Reminder testing endpoint
router.post('/reminders/test/:appointmentId', async (req, res) => {
  try {
    const appointmentId = parseIntId(req.params.appointmentId);
    const reminderService = (await import('./reminder-service.js')).default;
    await reminderService.sendTestReminder(appointmentId);
    res.json({ message: 'Test reminder sent successfully' });
  } catch (error) {
    console.error('Test reminder failed:', error);
    res.status(500).json({ error: 'Failed to send test reminder' });
  }
});

// Medical Records
router.get('/records', async (req, res) => {
  const { patientId } = req.query;
  if (patientId) {
    const id = parseIntId(patientId);
    const records = await db.getRecordsByPatient(id);
    return res.json(records);
  }

  const records = await db.getRecords();
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(records);
});

router.post('/records', async (req, res) => {
  const { patientId, recordType, details } = req.body;
  if (!patientId || !recordType || !details) return res.status(400).json({ error: 'patientId, recordType, and details are required' });

  const patient = await db.getPatientById(patientId);
  if (!patient) return res.status(400).json({ error: 'Invalid patientId' });

  const record = await db.addRecord({ patientId, recordType, details });
  res.status(201).json(record);
});

// AI Chatbot Q&A
router.post('/chat', (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question is required' });

  const normalized = question.toLowerCase();
  const quickAnswers = [
    {
      match: ['appointments', 'book', 'schedule'],
      response:
        'To book an appointment, please use the appointments page and submit patient name, service, provider, and preferred date/time. You can also call the clinic at (555) 123-4567 for immediate scheduling.'
    },
    {
      match: ['records', 'medical record', 'history'],
      response:
        'Medical records are stored securely. You can view your records under the medical records page, or request a copy through patient support.'
    },
    {
      match: ['hours', 'open', 'closing'],
      response: 'Our clinic is open Monday–Friday, 8am–6pm, and Saturday 9am–2pm. Closed Sundays and holidays.'
    },
    {
      match: ['insurance', 'payment', 'billing'],
      response: 'We accept major insurance providers and offer self-pay. Contact billing support at billing@clinic.example.com.'
    },
    {
      match: ['covid', 'vaccine', 'vaccination'],
      response: 'COVID-19 vaccines and testing are available by appointment. Please use the appointments endpoint to reserve a slot.'
    }
  ];

  const found = quickAnswers.find((item) => item.match.some((keyword) => normalized.includes(keyword)));
  const answer = found
    ? found.response
    : 'Thank you for your question. Our team will follow up within 1 business day. For urgent concerns, call the clinic directly.';

  res.json({ question, answer });
});

export default router;
