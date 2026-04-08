import { promises as fs } from 'fs';
import path from 'path';

const dataFile = path.resolve('clinic-data.json');

const INITIAL_DATA = {
  patients: [],
  appointments: [],
  records: [],
};

let cache = null;
let nextPatientId = 1;
let nextAppointmentId = 1;
let nextRecordId = 1;

async function load() {
  try {
    const content = await fs.readFile(dataFile, 'utf-8');
    cache = JSON.parse(content);

    const maxPatient = cache.patients.reduce((max, p) => Math.max(max, p.id), 0);
    const maxApt = cache.appointments.reduce((max, a) => Math.max(max, a.id), 0);
    const maxRecord = cache.records.reduce((max, r) => Math.max(max, r.id), 0);

    nextPatientId = maxPatient + 1;
    nextAppointmentId = maxApt + 1;
    nextRecordId = maxRecord + 1;
  } catch (err) {
    if (err.code === 'ENOENT') {
      cache = JSON.parse(JSON.stringify(INITIAL_DATA));
      await save();
    } else {
      throw err;
    }
  }
}

async function save() {
  await fs.writeFile(dataFile, JSON.stringify(cache, null, 2), 'utf-8');
}

async function ensureLoaded() {
  if (cache === null) {
    await load();
  }
}

export async function getPatients() {
  await ensureLoaded();
  return [...cache.patients];
}

export async function addPatient(patient) {
  await ensureLoaded();
  const newPatient = { id: nextPatientId++, createdAt: new Date().toISOString(), ...patient };
  cache.patients.push(newPatient);
  await save();
  return newPatient;
}

export async function getPatientById(id) {
  await ensureLoaded();
  return cache.patients.find((p) => p.id === id) || null;
}

export async function updatePatient(id, updates) {
  await ensureLoaded();
  const idx = cache.patients.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  cache.patients[idx] = { ...cache.patients[idx], ...updates };
  await save();
  return cache.patients[idx];
}

export async function deletePatient(id) {
  await ensureLoaded();
  const originalLength = cache.patients.length;
  cache.patients = cache.patients.filter((p) => p.id !== id);
  cache.appointments = cache.appointments.filter((a) => a.patientId !== id);
  cache.records = cache.records.filter((r) => r.patientId !== id);

  if (cache.patients.length === originalLength) return false;
  await save();
  return true;
}

export async function getAppointments() {
  await ensureLoaded();
  return [...cache.appointments];
}

export async function addAppointment(appointment) {
  await ensureLoaded();
  const newAppointment = {
    id: nextAppointmentId++,
    createdAt: new Date().toISOString(),
    status: 'pending',
    ...appointment,
  };
  cache.appointments.push(newAppointment);
  await save();
  return newAppointment;
}

export async function getAppointmentById(id) {
  await ensureLoaded();
  return cache.appointments.find((a) => a.id === id) || null;
}

export async function updateAppointment(id, updates) {
  await ensureLoaded();
  const idx = cache.appointments.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  cache.appointments[idx] = { ...cache.appointments[idx], ...updates };
  await save();
  return cache.appointments[idx];
}

export async function deleteAppointment(id) {
  await ensureLoaded();
  const orig = cache.appointments.length;
  cache.appointments = cache.appointments.filter((a) => a.id !== id);
  if (cache.appointments.length === orig) return false;
  await save();
  return true;
}

export async function getRecords() {
  await ensureLoaded();
  return [...cache.records];
}

export async function addRecord(record) {
  await ensureLoaded();
  const newRecord = { id: nextRecordId++, createdAt: new Date().toISOString(), ...record };
  cache.records.push(newRecord);
  await save();
  return newRecord;
}

export async function getRecordsByPatient(patientId) {
  await ensureLoaded();
  return cache.records.filter((r) => r.patientId === patientId);
}

export async function close() {
  cache = null;
}

