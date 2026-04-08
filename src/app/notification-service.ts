class NotificationService {
  constructor() {
    this.permission = null;
    this.registration = null;
  }

  async init() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    if (this.permission === 'granted') {
      // Register service worker for push notifications
      if ('serviceWorker' in navigator) {
        try {
          this.registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service worker registered for notifications');
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    }

    return this.permission === 'granted';
  }

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      timestamp: Date.now(),
      ...options
    };

    if (this.registration) {
      // Use service worker to show notification
      this.registration.showNotification(title, defaultOptions);
    } else {
      // Fallback to direct notification
      new Notification(title, defaultOptions);
    }
  }

  async showAppointmentReminder(appointment) {
    const appointmentTime = new Date(appointment.scheduledAt);
    const timeString = appointmentTime.toLocaleString();

    const title = 'Appointment Reminder';
    const options = {
      body: `You have a ${appointment.service} appointment at ${timeString}. Location: ${appointment.location || 'Mobile Clinic'}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `appointment-${appointment.id}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        appointmentId: appointment.id,
        type: 'appointment-reminder'
      }
    };

    await this.showNotification(title, options);
  }

  async showGeneralReminder(message, options = {}) {
    await this.showNotification('Clinic Reminder', {
      body: message,
      ...options
    });
  }
}

export default new NotificationService();