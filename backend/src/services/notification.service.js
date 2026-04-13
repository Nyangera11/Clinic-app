import { pool } from '../config/db.js';

// Mock SMS/Email service - Can be replaced with Twilio, SendGrid, etc.
export async function sendSMSNotification(phoneNumber, message) {
  try {
    // In production, replace with actual SMS service like Twilio
    console.log(`[SMS NOTIFICATION] To: ${phoneNumber}`);
    console.log(`[SMS NOTIFICATION] Message: ${message}`);
    
    // Store notification in database
    await storeNotification({
      type: 'SMS',
      recipient: phoneNumber,
      message,
      status: 'sent'
    });

    return { success: true, type: 'SMS', recipient: phoneNumber };
  } catch (error) {
    console.error('Error sending SMS:', error);
    await storeNotification({
      type: 'SMS',
      recipient: phoneNumber,
      message,
      status: 'failed',
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

export async function sendEmailNotification(email, subject, message) {
  try {
    // In production, replace with actual email service like SendGrid, Gmail API
    console.log(`[EMAIL NOTIFICATION] To: ${email}`);
    console.log(`[EMAIL NOTIFICATION] Subject: ${subject}`);
    console.log(`[EMAIL NOTIFICATION] Message: ${message}`);

    await storeNotification({
      type: 'EMAIL',
      recipient: email,
      message: `${subject}: ${message}`,
      status: 'sent'
    });

    return { success: true, type: 'EMAIL', recipient: email };
  } catch (error) {
    console.error('Error sending email:', error);
    await storeNotification({
      type: 'EMAIL',
      recipient: email,
      message: `${subject}: ${message}`,
      status: 'failed',
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

export async function storeNotification(data) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO notifications (type, recipient, message, status) VALUES (?, ?, ?, ?)',
      [data.type, data.recipient, data.message, data.status]
    );
    return { id: result.insertId, ...data };
  } catch (error) {
    console.error('Error storing notification:', error);
  }
}

export async function getNotifications(recipient, type = null) {
  try {
    let query = 'SELECT * FROM notifications WHERE recipient = ?';
    const params = [recipient];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY createdAt DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    return rows || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Appointment notification helpers
export async function notifyAppointmentCreated(patientEmail, patientPhone, appointmentDetails) {
  const { patientName, service, scheduledAt, provider } = appointmentDetails;

  const message = `Your appointment with ${provider} for ${service} has been scheduled for ${new Date(scheduledAt).toLocaleString()}. You will receive a reminder 24 hours before the appointment.`;
  
  const results = [];

  if (patientPhone) {
    const smsResult = await sendSMSNotification(patientPhone, message);
    results.push(smsResult);
  }

  if (patientEmail) {
    const emailResult = await sendEmailNotification(
      patientEmail,
      'Appointment Confirmation',
      message
    );
    results.push(emailResult);
  }

  return results;
}

export async function notifyAppointmentReminder(patientEmail, patientPhone, appointmentDetails) {
  const { patientName, service, scheduledAt, provider } = appointmentDetails;

  const message = `Reminder: Your appointment with ${provider} for ${service} is coming up on ${new Date(scheduledAt).toLocaleString()}. Please arrive 15 minutes early.`;
  
  const results = [];

  if (patientPhone) {
    const smsResult = await sendSMSNotification(patientPhone, message);
    results.push(smsResult);
  }

  if (patientEmail) {
    const emailResult = await sendEmailNotification(
      patientEmail,
      'Appointment Reminder',
      message
    );
    results.push(emailResult);
  }

  return results;
}

export async function notifyPrescriptionReady(patientEmail, patientPhone, prescriptionDetails) {
  const { patientName, diagnosis, medications, instructions } = prescriptionDetails;

  const medicationList = Array.isArray(medications) ? medications.join(', ') : medications;
  const message = `Your prescription for ${diagnosis} is ready. Medications: ${medicationList}. Please collect from the pharmacy. Follow all instructions carefully.`;
  
  const results = [];

  if (patientPhone) {
    const smsResult = await sendSMSNotification(patientPhone, message);
    results.push(smsResult);
  }

  if (patientEmail) {
    const emailResult = await sendEmailNotification(
      patientEmail,
      'Prescription Ready for Collection',
      message
    );
    results.push(emailResult);
  }

  return results;
}

export async function notifyPrescriptionReminder(patientEmail, patientPhone, prescriptionDetails) {
  const { patientName, medications, instructions } = prescriptionDetails;

  const medicationList = Array.isArray(medications) ? medications.join(', ') : medications;
  const message = `Reminder: Take your prescribed medications - ${medicationList}. ${Array.isArray(instructions) ? instructions[0] : instructions || 'Follow doctor\'s instructions carefully.'}`;
  
  const results = [];

  if (patientPhone) {
    const smsResult = await sendSMSNotification(patientPhone, message);
    results.push(smsResult);
  }

  if (patientEmail) {
    const emailResult = await sendEmailNotification(
      patientEmail,
      'Medication Reminder',
      message
    );
    results.push(emailResult);
  }

  return results;
}

export default {
  sendSMSNotification,
  sendEmailNotification,
  storeNotification,
  getNotifications,
  notifyAppointmentCreated,
  notifyAppointmentReminder,
  notifyPrescriptionReady,
  notifyPrescriptionReminder,
};
