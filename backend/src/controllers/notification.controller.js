import notificationService from '../services/notification.service.js';

export async function sendSMS(req, res, next) {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'phoneNumber and message are required' });
    }

    const result = await notificationService.sendSMSNotification(phoneNumber, message);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function sendEmail(req, res, next) {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'email, subject, and message are required' });
    }

    const result = await notificationService.sendEmailNotification(email, subject, message);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req, res, next) {
  try {
    const { recipient, type } = req.query;

    if (!recipient) {
      return res.status(400).json({ error: 'recipient is required' });
    }

    const notifications = await notificationService.getNotifications(recipient, type);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function notifyAppointmentCreated(req, res, next) {
  try {
    const { patientEmail, patientPhone, appointmentDetails } = req.body;

    if (!appointmentDetails) {
      return res.status(400).json({ error: 'appointmentDetails are required' });
    }

    const results = await notificationService.notifyAppointmentCreated(
      patientEmail,
      patientPhone,
      appointmentDetails
    );
    res.status(201).json({ message: 'Notifications sent', results });
  } catch (error) {
    next(error);
  }
}

export async function notifyAppointmentReminder(req, res, next) {
  try {
    const { patientEmail, patientPhone, appointmentDetails } = req.body;

    if (!appointmentDetails) {
      return res.status(400).json({ error: 'appointmentDetails are required' });
    }

    const results = await notificationService.notifyAppointmentReminder(
      patientEmail,
      patientPhone,
      appointmentDetails
    );
    res.status(201).json({ message: 'Reminder notifications sent', results });
  } catch (error) {
    next(error);
  }
}

export async function notifyPrescriptionReady(req, res, next) {
  try {
    const { patientEmail, patientPhone, prescriptionDetails } = req.body;

    if (!prescriptionDetails) {
      return res.status(400).json({ error: 'prescriptionDetails are required' });
    }

    const results = await notificationService.notifyPrescriptionReady(
      patientEmail,
      patientPhone,
      prescriptionDetails
    );
    res.status(201).json({ message: 'Prescription notifications sent', results });
  } catch (error) {
    next(error);
  }
}

export async function notifyPrescriptionReminder(req, res, next) {
  try {
    const { patientEmail, patientPhone, prescriptionDetails } = req.body;

    if (!prescriptionDetails) {
      return res.status(400).json({ error: 'prescriptionDetails are required' });
    }

    const results = await notificationService.notifyPrescriptionReminder(
      patientEmail,
      patientPhone,
      prescriptionDetails
    );
    res.status(201).json({ message: 'Prescription reminder sent', results });
  } catch (error) {
    next(error);
  }
}

export default {
  sendSMS,
  sendEmail,
  getNotifications,
  notifyAppointmentCreated,
  notifyAppointmentReminder,
  notifyPrescriptionReady,
  notifyPrescriptionReminder,
};
