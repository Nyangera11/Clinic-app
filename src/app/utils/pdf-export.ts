// PDF Export utility for prescriptions
export async function exportPrescriptionToPDF(prescription: any) {
  // Using HTML2PDF library via CDN (no additional dependency needed)
  const element = createPrescriptionHTML(prescription);
  
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = element;
  container.style.display = 'none';
  document.body.appendChild(container);
  
  // Use browser's print to PDF functionality
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(element);
    printWindow.document.close();
    printWindow.print();
    setTimeout(() => {
      document.body.removeChild(container);
    }, 1000);
  }
}

function createPrescriptionHTML(prescription: any): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #0ea5e9;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
        }
        .prescription-id {
          color: #666;
          margin-top: 10px;
        }
        .section {
          margin: 20px 0;
        }
        .section-title {
          background-color: #f0fdf4;
          padding: 10px;
          font-weight: bold;
          border-left: 4px solid #059669;
          margin-bottom: 10px;
        }
        .patient-info, .doctor-info {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .medications-list {
          margin: 10px 0;
        }
        .medication-item {
          background-color: #f9fafb;
          padding: 10px;
          margin: 8px 0;
          border-left: 3px solid #0ea5e9;
        }
        .medication-name {
          font-weight: bold;
          color: #1f2937;
        }
        .medication-details {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .instructions {
          background-color: #eff6ff;
          padding: 10px;
          margin: 5px 0;
          border-radius: 4px;
        }
        .warnings {
          background-color: #fef2f2;
          padding: 10px;
          margin: 5px 0;
          border-left: 3px solid #dc2626;
          color: #991b1b;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        @media print {
          body { margin: 0; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-name">🏥 Mobile Health Clinic</div>
        <div class="prescription-id">Prescription Date: ${currentDate}</div>
      </div>

      <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="patient-info">
          <span><strong>Patient Name:</strong> ${prescription.patientName || 'N/A'}</span>
          <span><strong>Patient ID:</strong> ${prescription.patientId || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Diagnosis & Clinical Notes</div>
        <p><strong>Diagnosis:</strong> ${prescription.diagnosis || 'N/A'}</p>
        ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Prescribed Medications</div>
        <div class="medications-list">
          ${(prescription.medications || []).map((med: any) => `
            <div class="medication-item">
              <div class="medication-name">${typeof med === 'string' ? med.split(' - ')[0] : med.name || med}</div>
              <div class="medication-details">
                ${typeof med === 'string' ? med.split(' - ').slice(1).join(' - ') : med.dosage || ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${prescription.instructions && prescription.instructions.length > 0 ? `
      <div class="section">
        <div class="section-title">Usage Instructions</div>
        <div class="instructions">
          <ul style="margin: 10px 0;">
            ${prescription.instructions.map((instr: string) => `<li>${instr}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      ${prescription.warnings && prescription.warnings.length > 0 ? `
      <div class="section">
        <div class="section-title">⚠️ Important Warnings</div>
        <div class="warnings">
          <ul style="margin: 10px 0;">
            ${prescription.warnings.map((warn: string) => `<li>${warn}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p>This prescription was generated by Mobile Health Clinic AI system.</p>
        <p>Please consult with your healthcare provider for any concerns.</p>
        <p>Generated on ${currentDate}</p>
      </div>
    </body>
    </html>
  `;
}
