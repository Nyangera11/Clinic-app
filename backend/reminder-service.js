import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import * as db from './db.js';

// Load environment variables
dotenv.config();

// Africa's Talking credentials (you'll need to set these as environment variables)
const AT_USERNAME = process.env.AT_USERNAME || 'your_username';
const AT_API_KEY = process.env.AT_API_KEY || 'your_api_key';

// Reminder settings
const REMINDER_TIMES = [
  { hours: 24, message: 'tomorrow' },
  { hours: 1, message: 'in 1 hour' }
];

class ReminderService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    // Run every hour to check for upcoming appointments
    cron.schedule('0 * * * *', async () => {
      console.log('Checking for appointment reminders...');
      await this.checkAndSendReminders();
    });

    this.isRunning = true;
    console.log('Reminder service started');
  }

  async checkAndSendReminders() {
    try {
      const appointments = await db.getAppointments();
      const now = new Date();

      for (const appointment of appointments) {
        if (appointment.status !== 'confirmed') continue;

        const appointmentTime = new Date(appointment.scheduledAt);
        const timeDiff = appointmentTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        for (const reminderTime of REMINDER_TIMES) {
          if (Math.abs(hoursDiff - reminderTime.hours) < 0.1) { // Within 6 minutes
            await this.sendReminder(appointment, reminderTime);
            break; // Only send one reminder per appointment per check
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  async sendReminder(appointment, reminderTime) {
    try {
      const message = `Reminder: You have a ${appointment.service} appointment ${reminderTime.message} at ${new Date(appointment.scheduledAt).toLocaleString()}. Location: ${appointment.location || 'Mobile Clinic'}`;

      // Send SMS if phone number available
      if (appointment.patientPhone) {
        await this.sendSMS(appointment.patientPhone, message);
      }

      // Log the reminder
      console.log(`Reminder sent for appointment ${appointment.id}: ${message}`);

      // In a real app, you might want to store reminder history
      // await db.logReminder(appointment.id, 'sms', message);

    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }

  async sendSMS(phoneNumber, message) {
    try {
      // Format phone number for Africa's Talking (ensure it starts with +254)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const response = await axios.post('https://api.africastalking.com/version1/messaging', {
        username: AT_USERNAME,
        to: formattedNumber,
        message: message,
        from: 'CLINIC' // Your registered sender ID
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': AT_API_KEY
        }
      });

      console.log('SMS sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('SMS sending failed:', error.response?.data || error.message);
      throw error;
    }
  }

  formatPhoneNumber(phone) {
    // Remove any spaces, dashes, etc.
    let cleaned = phone.replace(/\D/g, '');

    // If it starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }

    // If it doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  // Method to manually trigger reminders for testing
  async sendTestReminder(appointmentId) {
    const appointment = await db.getAppointmentById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    const reminderTime = { hours: 0, message: 'NOW (test)' };
    await this.sendReminder(appointment, reminderTime);
  }
}

export default new ReminderService();