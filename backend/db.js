import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic';

await mongoose.connect(mongoUri);

const patientSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  dateOfBirth: String,
  village: String,
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  patientId: Number,
  patientName: String,
  patientEmail: String,
  patientPhone: String,
  provider: String,
  service: String,
  scheduledAt: String,
  status: { type: String, default: 'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const recordSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  patientId: Number,
  recordType: String,
  details: String,
  provider: String,
  date: String,
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Record = mongoose.model('Record', recordSchema);

let nextPatientId = 1;
let nextAppointmentId = 1;
let nextRecordId = 1;

// Initialize nextIds
async function initIds() {
  const maxPatient = await Patient.findOne().sort({ id: -1 });
  if (maxPatient) nextPatientId = maxPatient.id + 1;
  const maxApt = await Appointment.findOne().sort({ id: -1 });
  if (maxApt) nextAppointmentId = maxApt.id + 1;
  const maxRecord = await Record.findOne().sort({ id: -1 });
  if (maxRecord) nextRecordId = maxRecord.id + 1;
}

await initIds();

export async function getPatients() {
  return await Patient.find();
}

export async function addPatient(data) {
  const patient = new Patient({ id: nextPatientId++, ...data });
  await patient.save();
  return patient;
}

export async function getPatientById(id) {
  const numId = Number(id);
  return await Patient.findOne({ id: numId });
}

export async function updatePatient(id, updates) {
  const numId = Number(id);
  return await Patient.findOneAndUpdate({ id: numId }, updates, { new: true });
}

export async function deletePatient(id) {
  const numId = Number(id);
  const patient = await Patient.findOneAndDelete({ id: numId });
  if (patient) {
    await Appointment.deleteMany({ patientId: numId });
    await Record.deleteMany({ patientId: numId });
  }
  return !!patient;
}

export async function getAppointments() {
  return await Appointment.find();
}

export async function addAppointment(data) {
  const appointment = new Appointment({ id: nextAppointmentId++, ...data });
  await appointment.save();
  return appointment;
}

export async function getAppointmentById(id) {
  const numId = Number(id);
  return await Appointment.findOne({ id: numId });
}

export async function updateAppointment(id, updates) {
  const numId = Number(id);
  return await Appointment.findOneAndUpdate({ id: numId }, updates, { new: true });
}

export async function deleteAppointment(id) {
  const numId = Number(id);
  return await Appointment.findOneAndDelete({ id: numId });
}

export async function getRecords() {
  return await Record.find();
}

export async function addRecord(data) {
  const record = new Record({ id: nextRecordId++, ...data });
  await record.save();
  return record;
}

export async function getRecordsByPatient(patientId) {
  const numId = Number(patientId);
  return await Record.find({ patientId: numId });
}

export async function close() {
  await mongoose.connection.close();
}

