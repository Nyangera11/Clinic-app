import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'clinic_system';
const DB_TYPE = process.env.DB_TYPE || 'mysql';
const dataFile = path.resolve('clinic-data.json');

let useJsonFallback = false;
let adminPool;
let mysqlPool;

let jsonDb = {
  users: [],
  patients: [],
  appointments: [],
  vitals: [],
  ai_results: [],
  medical_records: [],
  prescriptions: [],
  notifications: [],
};

let nextIds = {
  users: 1,
  patients: 1,
  appointments: 1,
  vitals: 1,
  ai_results: 1,
  medical_records: 1,
  prescriptions: 1,
  notifications: 1,
};

async function loadJsonDb() {
  try {
    const content = await fs.readFile(dataFile, 'utf-8');
    const parsed = JSON.parse(content);
    Object.assign(jsonDb, parsed);
    nextIds.users = Math.max(1, ...jsonDb.users.map((item) => item.id || 0)) + 1;
    nextIds.patients = Math.max(1, ...jsonDb.patients.map((item) => item.id || 0)) + 1;
    nextIds.appointments = Math.max(1, ...jsonDb.appointments.map((item) => item.id || 0)) + 1;
    nextIds.vitals = Math.max(1, ...jsonDb.vitals.map((item) => item.id || 0)) + 1;
    nextIds.ai_results = Math.max(1, ...jsonDb.ai_results.map((item) => item.id || 0)) + 1;
    nextIds.medical_records = Math.max(1, ...jsonDb.medical_records.map((item) => item.id || 0)) + 1;
    nextIds.prescriptions = Math.max(1, ...jsonDb.prescriptions.map((item) => item.id || 0)) + 1;
    nextIds.notifications = Math.max(1, ...jsonDb.notifications.map((item) => item.id || 0)) + 1;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(dataFile, JSON.stringify(jsonDb, null, 2), 'utf-8');
    } else {
      throw error;
    }
  }
}

async function saveJsonDb() {
  await fs.writeFile(dataFile, JSON.stringify(jsonDb, null, 2), 'utf-8');
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [value];
}

async function jsonExecute(sql, params = []) {
  const normalized = sql.trim().replace(/\s+/g, ' ').toLowerCase();
  if (/^select 1 as test/.test(normalized)) {
    return [[{ test: 1 }], []];
  }

  if (normalized.startsWith('insert into users')) {
    const item = {
      id: nextIds.users++,
      name: params[0],
      email: params[1],
      passwordHash: params[2],
      phone: params[3] || '',
      role: params[4],
      createdAt: new Date().toISOString(),
    };
    jsonDb.users.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select id, name, email, passwordhash, phone, role from users where email = ?')) {
    const rows = jsonDb.users.filter((row) => row.email.toLowerCase() === String(params[0]).toLowerCase());
    return [rows, []];
  }

  if (normalized.startsWith('select id, name, email, phone, role from users where id = ?')) {
    const rows = jsonDb.users.filter((row) => row.id === Number(params[0]));
    return [rows, []];
  }

  if (normalized.startsWith('select id, name, email, role, createdat from users order by createdat desc')) {
    const rows = [...jsonDb.users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [rows, []];
  }

  if (normalized.startsWith("select id, name, email, role from users where role in ('health_worker', 'admin')")) {
    const rows = [...jsonDb.users].filter((row) => row.role === 'health_worker' || row.role === 'admin').sort((a, b) => a.name.localeCompare(b.name));
    return [rows, []];
  }

  if (normalized.startsWith("select id, name, email, role from users where role = 'patient'")) {
    const rows = [...jsonDb.users].filter((row) => row.role === 'patient').sort((a, b) => a.name.localeCompare(b.name));
    return [rows, []];
  }

  if (normalized.startsWith('insert into patients')) {
    const item = {
      id: nextIds.patients++,
      name: params[0],
      DOB: params[1],
      gender: params[2],
      location: params[3],
      contact: params[4],
      createdAt: new Date().toISOString(),
    };
    jsonDb.patients.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('update patients set')) {
    const matches = sql.match(/update patients set (.+) where id = \?/i);
    const setClause = matches?.[1] || '';
    const updates = {};
    const columns = setClause.split(',').map((segment) => segment.trim().split('=')[0].trim());
    columns.forEach((col, index) => {
      updates[col] = params[index];
    });
    const id = Number(params[params.length - 1]);
    const patient = jsonDb.patients.find((p) => p.id === id);
    if (!patient) {
      return [{ affectedRows: 0 }, []];
    }
    Object.assign(patient, updates);
    await saveJsonDb();
    return [{ affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select id, name, dob, gender, location, contact, createdat from patients where id = ?')) {
    const rows = jsonDb.patients.filter((row) => row.id === Number(params[0]));
    return [rows, []];
  }

  if (normalized.startsWith('select id, name, dob, gender, location, contact, createdat from patients')) {
    let rows = [...jsonDb.patients];
    if (normalized.includes('where name like ? or location like ? or contact like ?')) {
      const search = String(params[0]).toLowerCase().replace(/%/g, '');
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(search) ||
          row.location.toLowerCase().includes(search) ||
          row.contact.toLowerCase().includes(search)
      );
    }
    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [rows, []];
  }

  if (normalized.startsWith('insert into vitals')) {
    const item = {
      id: nextIds.vitals++,
      patient_id: Number(params[0]),
      BP: params[1],
      temperature: Number(params[2]),
      glucose: Number(params[3]),
      SpO2: Number(params[4]),
      timestamp: params[5],
      synced: params[6],
      createdAt: new Date().toISOString(),
    };
    jsonDb.vitals.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select id, patient_id, bp, temperature, glucose, spo2, timestamp, synced, createdat from vitals where patient_id = ? order by timestamp desc')) {
    const rows = jsonDb.vitals
      .filter((row) => row.patient_id === Number(params[0]))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return [rows, []];
  }

  if (normalized.startsWith('insert into ai_results')) {
    const item = {
      id: nextIds.ai_results++,
      patient_id: Number(params[0]),
      symptoms: params[1],
      prediction: params[2],
      riskLevel: params[3],
      recommendation: params[4],
      synced: params[5],
      createdAt: new Date().toISOString(),
    };
    jsonDb.ai_results.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select id, patient_id, symptoms, prediction, risklevel, recommendation, synced, createdat from ai_results where patient_id = ? order by createdat desc')) {
    const rows = jsonDb.ai_results
      .filter((row) => row.patient_id === Number(params[0]))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [rows, []];
  }

  if (normalized.startsWith('insert into medical_records')) {
    const item = {
      id: nextIds.medical_records++,
      patient_id: Number(params[0]),
      diagnosis: params[1],
      treatment: params[2],
      notes: params[3],
      synced: params[4],
      createdAt: new Date().toISOString(),
    };
    jsonDb.medical_records.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select id, patient_id, diagnosis, treatment, notes, synced, createdat from medical_records where patient_id = ? order by createdat desc')) {
    const rows = jsonDb.medical_records
      .filter((row) => row.patient_id === Number(params[0]))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [rows, []];
  }

  // Appointments
  if (normalized.startsWith('insert into appointments')) {
    const item = {
      id: nextIds.appointments++,
      patientId: Number(params[0]),
      patientName: params[1],
      patientEmail: params[2],
      patientPhone: params[3],
      provider: params[4],
      service: params[5],
      scheduledAt: params[6],
      status: params[7],
      notes: params[8],
      createdAt: new Date().toISOString(),
    };
    jsonDb.appointments.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select id, patientid, patientname, patientemail, patientphone, provider, service, scheduledat, status, notes, createdat from appointments')) {
    let rows = [...jsonDb.appointments].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
    
    // Handle WHERE conditions
    if (normalized.includes('where')) {
      rows = rows.filter((row) => {
        if (normalized.includes('patientid = ?') && params[0] !== undefined) {
          return row.patientId === Number(params[0]);
        }
        if (normalized.includes('patientemail = ?') && params[0] !== undefined) {
          return row.patientEmail === String(params[0]);
        }
        return true;
      });
    }
    
    return [rows, []];
  }

  if (normalized.includes('update appointments set') && normalized.includes('where id = ?')) {
    const id = Number(params[params.length - 1]);
    const appointment = jsonDb.appointments.find((a) => a.id === id);
    if (!appointment) {
      return [{ affectedRows: 0 }, []];
    }
    
    // Parse updates from the SET clause
    const matches = normalized.match(/set (.+?) where/);
    if (matches) {
      const setClauses = matches[1].split(',').map(s => s.trim());
      setClauses.forEach((clause, index) => {
        const field = clause.split('=')[0].trim();
        if (field === 'provider') appointment.provider = params[index];
        if (field === 'scheduledat') appointment.scheduledAt = params[index];
        if (field === 'status') appointment.status = params[index];
      });
    }
    
    await saveJsonDb();
    return [{ affectedRows: 1 }, []];
  }

  if (normalized.includes('delete from appointments') && normalized.includes('where id = ?')) {
    const id = Number(params[0]);
    const index = jsonDb.appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return [{ affectedRows: 0 }, []];
    }
    jsonDb.appointments.splice(index, 1);
    await saveJsonDb();
    return [{ affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select * from appointments where id = ?')) {
    const rows = jsonDb.appointments.filter((a) => a.id === Number(params[0]));
    return [rows, []];
  }

  if (normalized.startsWith('update appointments set status = ?') && normalized.includes('where id = ?')) {
    const id = Number(params[params.length - 1]);
    const appointment = jsonDb.appointments.find((a) => a.id === id);
    if (!appointment) {
      return [{ affectedRows: 0 }, []];
    }
    appointment.status = params[0];
    await saveJsonDb();
    return [{ affectedRows: 1 }, []];
  }

  if (normalized.startsWith('insert into medical_records')) {
    const item = {
      id: nextIds.medical_records++,
      patient_id: Number(params[0]),
      diagnosis: params[1],
      treatment: params[2],
      notes: params[3] || null,
      synced: 0,
      createdAt: new Date().toISOString(),
    };
    jsonDb.medical_records.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select * from medical_records where patient_id = ?')) {
    const rows = jsonDb.medical_records
      .filter((row) => row.patient_id === Number(params[0]))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [rows, []];
  }

  // Prescriptions
  if (normalized.startsWith('insert into prescriptions')) {
    const item = {
      id: nextIds.prescriptions++,
      appointmentId: params[0] || null,
      patientId: Number(params[1]),
      medicines: typeof params[2] === 'string' ? JSON.parse(params[2]) : params[2],
      doctorName: params[3],
      notes: params[4] || null,
      createdAt: new Date().toISOString(),
    };
    jsonDb.prescriptions.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select id, appointmentid, patientid, medicines, doctorname, notes, createdat from prescriptions')) {
    let rows = [...jsonDb.prescriptions];
    if (normalized.includes('where patientid = ?')) {
      rows = rows.filter((row) => row.patientId === Number(params[0]));
    }
    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [rows, []];
  }

  if (normalized.startsWith('select id, appointmentid, patientid, medicines, doctorname, notes, createdat from prescriptions where id = ?')) {
    const rows = jsonDb.prescriptions.filter((row) => row.id === Number(params[0]));
    return [rows, []];
  }

  // Notifications
  if (normalized.startsWith('insert into notifications')) {
    const item = {
      id: nextIds.notifications++,
      type: params[0],
      recipient: params[1],
      message: params[2],
      status: params[3] || 'sent',
      createdAt: new Date().toISOString(),
    };
    jsonDb.notifications.push(item);
    await saveJsonDb();
    return [{ insertId: item.id, affectedRows: 1 }, []];
  }

  if (normalized.startsWith('select * from notifications where recipient = ?')) {
    let rows = jsonDb.notifications.filter((row) => row.recipient === params[0]);
    if (normalized.includes('and type = ?')) {
      rows = rows.filter((row) => row.type === params[1]);
    }
    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [rows.slice(0, 100), []];
  }

  throw new Error(`Unsupported SQL in JSON fallback: ${sql}`);
}

export const pool = {
  execute: async (sql, params = []) => {
    if (useJsonFallback) {
      return jsonExecute(sql, params);
    }
    return mysqlPool.execute(sql, params);
  },
  query: async (sql, params = []) => {
    if (useJsonFallback) {
      return jsonExecute(sql, params);
    }
    return mysqlPool.query(sql, params);
  },
};

export async function initDb() {
  if (DB_TYPE === 'json') {
    useJsonFallback = true;
    await loadJsonDb();
    return;
  }

  try {
    adminPool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    mysqlPool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await adminPool.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'health_worker', 'patient') NOT NULL DEFAULT 'health_worker',
        email VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        DOB DATE NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        location VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS vitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        BP VARCHAR(50) NOT NULL,
        temperature DECIMAL(5,2) NOT NULL,
        glucose DECIMAL(6,2) NOT NULL,
        SpO2 DECIMAL(5,2) NOT NULL,
        timestamp DATETIME NOT NULL,
        synced TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        symptoms TEXT NOT NULL,
        prediction VARCHAR(255) NOT NULL,
        riskLevel ENUM('low', 'medium', 'high') NOT NULL,
        recommendation TEXT NOT NULL,
        synced TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        diagnosis TEXT NOT NULL,
        treatment TEXT NOT NULL,
        notes TEXT NULL,
        synced TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patientId INT NOT NULL,
        patientName VARCHAR(255),
        patientEmail VARCHAR(255),
        patientPhone VARCHAR(20),
        provider VARCHAR(255),
        service VARCHAR(255),
        scheduledAt DATETIME NOT NULL,
        status VARCHAR(50) DEFAULT 'Confirmed',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointmentId INT,
        patientId INT NOT NULL,
        medicines JSON NOT NULL,
        doctorName VARCHAR(255) NOT NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'sent',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (error) {
    console.warn('MySQL unavailable, falling back to local JSON storage.');
    console.warn(error.message);
    useJsonFallback = true;
    await loadJsonDb();
  }
}
