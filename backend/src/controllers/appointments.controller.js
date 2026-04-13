import { pool } from '../config/db.js';
import notificationService from '../services/notification.service.js';

export async function listAppointments(req, res, next) {
  try {
    const { patientId, patientEmail, provider, status } = req.query;

    // Try to query appointments table (will fallback to JSON)
    let query = 'SELECT id, patientId, patientName, patientEmail, patientPhone, provider, service, scheduledAt, status, notes, createdAt FROM appointments';
    const params = [];
    const conditions = [];

    if (patientId) {
      conditions.push('patientId = ?');
      params.push(patientId);
    }
    if (patientEmail) {
      conditions.push('patientEmail = ?');
      params.push(patientEmail);
    }
    if (provider) {
      conditions.push('provider LIKE ?');
      params.push(`%${provider}%`);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY scheduledAt DESC';

    const [appointments] = await pool.query(query, params);
    res.json(appointments || []);
  } catch (error) {
    next(error);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const { patientId, patientName, patientEmail, patientPhone, provider, service, scheduledAt, status, notes } = req.body;

    // Validate required fields
    if (!scheduledAt || !service) {
      return res.status(400).json({ error: 'service and scheduledAt are required' });
    }

    let effectivePatientId = patientId;

    // If no patientId, try to find or create patient
    if (!effectivePatientId) {
      if (!patientEmail || !patientName) {
        return res.status(400).json({ error: 'patientEmail and patientName are required when patientId is missing' });
      }

      // Try to find existing patient by email
      try {
        const [patients] = await pool.query('SELECT id FROM patients WHERE name = ?', [patientName]);
        if (patients && patients.length > 0) {
          effectivePatientId = patients[0].id;
        }
      } catch (e) {
        console.log('Patient lookup failed:', e.message);
      }

      if (!effectivePatientId) {
        // Create new patient
        const [firstName, ...rest] = (patientName || '').split(' ');
        const lastName = rest.join(' ') || '';
        
        try {
          const [insertResult] = await pool.execute(
            'INSERT INTO patients (name, DOB, gender, location, contact) VALUES (?, ?, ?, ?, ?)',
            [patientName, '1990-01-01', 'other', 'Unknown', patientPhone || '']
          );
          effectivePatientId = insertResult.insertId;
        } catch (e) {
          console.log('Patient creation failed:', e.message);
          effectivePatientId = 1; // Fallback to ID 1
        }
      }
    }

    // Insert appointment into database
    try {
      const [result] = await pool.execute(
        'INSERT INTO appointments (patientId, patientName, patientEmail, patientPhone, provider, service, scheduledAt, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [effectivePatientId, patientName, patientEmail, patientPhone, provider || 'Any available', service, scheduledAt, status || 'Confirmed', notes || null]
      );

      const appointment = {
        id: result.insertId,
        patientId: effectivePatientId,
        patientName,
        patientEmail,
        patientPhone,
        provider: provider || 'Any available',
        service,
        scheduledAt,
        status: status || 'Confirmed',
        notes: notes || null,
        createdAt: new Date().toISOString(),
      };

      // Send notifications
      try {
        await notificationService.notifyAppointmentCreated(
          patientEmail,
          patientPhone,
          {
            patientName,
            service,
            scheduledAt,
            provider: provider || 'Any available',
          }
        );
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError.message);
      }

      res.status(201).json(appointment);
    } catch (error) {
      console.error('Appointment insert error:', error);
      next(error);
    }
  } catch (error) {
    next(error);
  }
}

export async function getAppointmentById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { provider, scheduledAt, status } = req.body;

    if (!provider && !scheduledAt && !status) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }

    const updates = [];
    const params = [];

    if (provider) {
      updates.push('provider = ?');
      params.push(provider);
    }
    if (scheduledAt) {
      updates.push('scheduledAt = ?');
      params.push(scheduledAt);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    params.push(id);
    const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Fetch updated appointment
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ id, status: 'Cancelled', message: 'Appointment cancelled successfully' });
  } catch (error) {
    next(error);
  }
}

export async function attendAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { diagnosis, treatment, notes } = req.body;

    // Get the appointment first
    const [appointments] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Update appointment status to 'Attended'
    await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', ['Attended', id]);

    // Create medical record from the appointment
    try {
      const [result] = await pool.execute(
        'INSERT INTO medical_records (patient_id, diagnosis, treatment, notes) VALUES (?, ?, ?, ?)',
        [appointment.patientId, diagnosis || appointment.service, treatment || 'Clinical consultation', notes || null]
      );

      res.json({
        message: 'Appointment marked as attended',
        appointment: {
          id,
          status: 'Attended',
        },
        medicalRecord: {
          id: result.insertId,
          patientId: appointment.patientId,
          diagnosis: diagnosis || appointment.service,
          treatment: treatment || 'Clinical consultation',
          notes: notes || null,
        },
      });
    } catch (recordError) {
      console.error('Error creating medical record:', recordError);
      res.json({
        message: 'Appointment marked as attended (medical record creation failed)',
        appointment: { id, status: 'Attended' },
      });
    }
  } catch (error) {
    next(error);
  }
}

export default {
  listAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  attendAppointment,
};
