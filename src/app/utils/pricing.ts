// Pricing utilities for Kenyan Shillings

export const CURRENCY = {
  SYMBOL: 'KES',
  CODE: 'KES',
  NAME: 'Kenyan Shilling'
};

// Service pricing in Kenyan Shillings
export const SERVICE_PRICES = {
  'General Checkup': 500,
  'Vaccination': 1500,
  'Laboratory Tests': 800,
  'Maternal & Child Care': 1200,
  'Chronic Disease Management': 2000,
  'Cardiology Screening': 2500,
  'Eye Examinations': 600,
  'Malaria Treatment': 1000,
  'Dental Care': 700,
  'TB Screening': 1100,
  'Surgery': 5000,
  'Ultrasound': 1800,
  'X-Ray': 1200,
  'ECG': 1500,
  'Consultation': 300,
};

// Format price to KES currency
export function formatPrice(amount: number): string {
  return `KES ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// Format price with currency symbol
export function formatPriceWithSymbol(amount: number): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} KES`;
}

// Get price for a service
export function getServicePrice(serviceName: string): number {
  return SERVICE_PRICES[serviceName as keyof typeof SERVICE_PRICES] || 0;
}

// Calculate total with optional discount
export function calculateTotal(items: Array<{ price: number; quantity: number }>, discountPercent: number = 0): number {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = (subtotal * discountPercent) / 100;
  return subtotal - discount;
}

// Generate invoice download
export function generateInvoice(appointmentData: any): string {
  const price = SERVICE_PRICES[appointmentData.service as keyof typeof SERVICE_PRICES] || 0;
  
  const invoice = `
    ========================================
    MOBILE HEALTH CLINIC INVOICE
    ========================================
    
    Date: ${new Date().toLocaleDateString()}
    Invoice ID: INV-${Date.now()}
    
    ----------------------------------------
    PATIENT DETAILS
    ----------------------------------------
    Name: ${appointmentData.patientName || 'N/A'}
    Email: ${appointmentData.patientEmail || 'N/A'}
    Phone: ${appointmentData.patientPhone || 'N/A'}
    
    ----------------------------------------
    SERVICE DETAILS
    ----------------------------------------
    Service: ${appointmentData.service}
    Description: ${appointmentData.serviceDescription || 'Medical Service'}
    Appointment Date: ${appointmentData.scheduledAt || 'To be scheduled'}
    
    ----------------------------------------
    BILLING
    ----------------------------------------
    Service Fee: ${formatPrice(price)}
    Discount: KES 0
    Total Amount: ${formatPrice(price)}
    
    Payment Status: Pending
    
    ========================================
    Terms & Conditions
    ========================================
    - Payment must be made before service delivery
    - Appointment can be rescheduled up to 24 hours before
    - Cancellations within 24 hours will incur 50% charge
    
    Thank you for choosing Mobile Health Clinic!
    ========================================
  `;
  
  return invoice;
}
