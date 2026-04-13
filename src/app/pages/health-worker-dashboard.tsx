import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Calendar, User, Clock, Phone, Mail, LogOut, CheckCircle, AlertCircle, X, Plus, Stethoscope, Pill } from "lucide-react";
import { apiCall, getApiUrl } from "../utils/api";
import { commonMedicines, dosageFrequencies, dosageDurations } from "../utils/medicines";

export function HealthWorkerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAttendModal, setShowAttendModal] = useState(false);
  const [attendForm, setAttendForm] = useState({ diagnosis: "", treatment: "", notes: "" });
  const [showRegisterPatientModal, setShowRegisterPatientModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<any>(null);
  const [registerForm, setRegisterForm] = useState({ name: "", DOB: "", gender: "other", location: "", contact: "" });
  const [diagnosisForm, setDiagnosisForm] = useState({ patientId: "", symptoms: "", BP: "", temperature: "", glucose: "", SpO2: "" });
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [prescriptionResult, setPrescriptionResult] = useState<any>(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<any[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        const doctorAppointments = data.filter(
          (apt: any) => apt.provider === currentUser?.name
        );
        setAppointments(doctorAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await apiCall('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data || []);
      }
    } catch (error) {
      console.error('Error loading patients', error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "health_worker" && parsed.role !== "admin") {
      navigate("/login");
      return;
    }
    setCurrentUser(parsed);
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
      loadPatients();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      const response = await apiCall(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Confirmed" }),
      });
      if (response.ok) {
        await loadAppointments();
        alert("Appointment confirmed successfully!");
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

  const handleOpenAttendModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setAttendForm({ diagnosis: appointment.service, treatment: "", notes: "" });
    setShowAttendModal(true);
  };

  const handleAttendAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await apiCall(`/api/appointments/${selectedAppointment.id}/attend`, {
        method: "POST",
        body: JSON.stringify(attendForm),
      });
      if (response.ok) {
        const result = await response.json();
        setShowAttendModal(false);
        await loadAppointments();
        alert("Appointment marked as attended and medical record created!");
      }
    } catch (error) {
      console.error("Error attending appointment:", error);
      alert("Error marking appointment as attended");
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await apiCall(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await loadAppointments();
        alert("Appointment cancelled!");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const handleRegisterPatient = async () => {
    if (!registerForm.name || !registerForm.DOB || !registerForm.contact) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await apiCall('/api/patients', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });

      if (response.ok) {
        const newPatient = await response.json();
        setShowRegisterPatientModal(false);
        setRegisterForm({ name: "", DOB: "", gender: "other", location: "", contact: "" });
        await loadPatients();
        alert("Patient registered successfully!");
      } else {
        const error = await response.json();
        alert("Error registering patient: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error registering patient:", error);
      alert("Error registering patient");
    }
  };

  const handleRunDiagnosis = async () => {
    if (!diagnosisForm.patientId || !diagnosisForm.symptoms) {
      alert("Please select a patient and enter symptoms");
      return;
    }

    try {
      const response = await apiCall('/api/ai/diagnose', {
        method: 'POST',
        body: JSON.stringify({
          patientId: Number(diagnosisForm.patientId),
          symptoms: diagnosisForm.symptoms,
          vitals: {
            BP: diagnosisForm.BP || "120/80",
            temperature: diagnosisForm.temperature ? Number(diagnosisForm.temperature) : 36.5,
            glucose: diagnosisForm.glucose ? Number(diagnosisForm.glucose) : 100,
            SpO2: diagnosisForm.SpO2 ? Number(diagnosisForm.SpO2) : 98,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDiagnosisResult(result);
      } else {
        alert("Error running diagnosis");
      }
    } catch (error) {
      console.error("Error running diagnosis:", error);
      alert("Error running diagnosis");
    }
  };

  const handleGeneratePrescription = async () => {
    if (!diagnosisResult || !diagnosisForm.patientId) {
      alert("Please run a diagnosis first");
      return;
    }

    try {
      const response = await apiCall('/api/ai/prescription', {
        method: 'POST',
        body: JSON.stringify({
          patientId: Number(diagnosisForm.patientId),
          diagnosis: diagnosisResult.prediction || "AI Diagnosis Result",
          medications: [],
          symptoms: diagnosisForm.symptoms,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPrescriptionResult(result);

        // Send notification to patient
        const patient = patients.find((p: any) => p.id === Number(diagnosisForm.patientId));
        if (patient && (patient.email || patient.contact)) {
          try {
            await apiCall('/api/notifications/prescription-ready', {
              method: 'POST',
              body: JSON.stringify({
                patientEmail: patient.email,
                patientPhone: patient.contact,
                prescriptionDetails: {
                  patientName: patient.name,
                  diagnosis: diagnosisResult.prediction || "AI Diagnosis Result",
                  medications: result.medications,
                  instructions: result.instructions,
                },
              }),
            });
          } catch (notificationError) {
            console.warn("Notification sent but with warning:", notificationError);
          }
        }
      } else {
        alert("Error generating prescription");
      }
    } catch (error) {
      console.error("Error generating prescription:", error);
      alert("Error generating prescription");
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'attended':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.scheduledAt) >= new Date() && apt.status?.toLowerCase() !== 'cancelled'
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.scheduledAt) < new Date() || apt.status?.toLowerCase() === 'attended'
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Health Worker Dashboard</h1>
              <p className="text-blue-100 mt-2">Welcome, {currentUser?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRegisterPatientModal(true)}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Register Patient
              </button>
              <button
                onClick={() => setShowDiagnosisModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                <Stethoscope className="w-5 h-5" />
                Run Diagnosis
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="text-4xl font-bold text-blue-600">{appointments.length}</div>
            <p className="text-gray-600 mt-2">Total Appointments</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="text-4xl font-bold text-green-600">{upcomingAppointments.length}</div>
            <p className="text-gray-600 mt-2">Upcoming Appointments</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="text-4xl font-bold text-purple-600">{pastAppointments.length}</div>
            <p className="text-gray-600 mt-2">Completed/Past Appointments</p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Upcoming Appointments
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading appointments...</p>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-green-50 to-blue-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-semibold">Patient Name</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{appointment.patientName}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-semibold">Email</span>
                      </div>
                      <p className="text-gray-700">{appointment.patientEmail}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="font-semibold">Phone</span>
                      </div>
                      <p className="text-gray-700">{appointment.patientPhone || "N/A"}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">Time</span>
                      </div>
                      <p className="text-gray-700">{formatDateTime(appointment.scheduledAt)}</p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-600">Service:</span>
                      <p className="text-gray-700">{appointment.service}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status || 'Pending'}
                      </span>
                    </div>

                    {appointment.notes && (
                      <div className="md:col-span-4">
                        <span className="font-semibold text-gray-600">Notes:</span>
                        <p className="text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 border-t pt-4">
                    <button
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      disabled={appointment.status?.toLowerCase() === 'confirmed' || appointment.status?.toLowerCase() === 'attended'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleOpenAttendModal(appointment)}
                      disabled={appointment.status?.toLowerCase() === 'attended'}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Attended
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-gray-600" />
              Completed Appointments
            </h2>

            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-green-50 to-green-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <span className="font-semibold text-gray-600">Patient:</span>
                      <p className="text-gray-700">{appointment.patientName}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-600">Email:</span>
                      <p className="text-gray-700">{appointment.patientEmail}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-600">Service:</span>
                      <p className="text-gray-700">{appointment.service}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-600">Date:</span>
                      <p className="text-gray-700">{formatDateTime(appointment.scheduledAt)}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attend Modal */}
      {showAttendModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Mark Appointment as Attended</h3>
              <button
                onClick={() => setShowAttendModal(false)}
                className="hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600"><strong>Patient:</strong> {selectedAppointment.patientName}</p>
                <p className="text-sm text-gray-600"><strong>Service:</strong> {selectedAppointment.service}</p>
                <p className="text-sm text-gray-600"><strong>Time:</strong> {formatDateTime(selectedAppointment.scheduledAt)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                <input
                  type="text"
                  value={attendForm.diagnosis}
                  onChange={(e) => setAttendForm({ ...attendForm, diagnosis: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., Common cold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Provided</label>
                <textarea
                  value={attendForm.treatment}
                  onChange={(e) => setAttendForm({ ...attendForm, treatment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., Prescribed antibiotics, rest advised"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Notes (Optional)</label>
                <textarea
                  value={attendForm.notes}
                  onChange={(e) => setAttendForm({ ...attendForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => setShowAttendModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAttendAppointment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Mark as Attended & Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {showRegisterPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Register New Patient</h3>
              <button
                onClick={() => setShowRegisterPatientModal(false)}
                className="hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name *</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  placeholder="Full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={registerForm.DOB}
                    onChange={(e) => setRegisterForm({ ...registerForm, DOB: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={registerForm.location}
                  onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  placeholder="Village/Town name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={registerForm.contact}
                  onChange={(e) => setRegisterForm({ ...registerForm, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  placeholder="Phone number"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => setShowRegisterPatientModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterPatient}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Register Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run Diagnosis Modal */}
      {showDiagnosisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center sticky top-0">
              <h3 className="text-2xl font-bold">Run Diagnosis</h3>
              <button
                onClick={() => {
                  setShowDiagnosisModal(false);
                  setDiagnosisResult(null);
                  setDiagnosisForm({ patientId: "", symptoms: "", BP: "", temperature: "", glucose: "", SpO2: "" });
                }}
                className="hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!diagnosisResult ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Patient *</label>
                    <select
                      value={diagnosisForm.patientId}
                      onChange={(e) => setDiagnosisForm({ ...diagnosisForm, patientId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">-- Select a patient --</option>
                      {patients.map((patient: any) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.contact})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms *</label>
                    <textarea
                      value={diagnosisForm.symptoms}
                      onChange={(e) => setDiagnosisForm({ ...diagnosisForm, symptoms: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Describe patient symptoms (e.g., fever, cough, headache)"
                      rows={3}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Vitals (Optional)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-600">BP (mmHg)</label>
                        <input
                          type="text"
                          value={diagnosisForm.BP}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, BP: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="120/80"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Temperature (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={diagnosisForm.temperature}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, temperature: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="36.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Glucose (mg/dL)</label>
                        <input
                          type="number"
                          value={diagnosisForm.glucose}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, glucose: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">SpO2 (%)</label>
                        <input
                          type="number"
                          value={diagnosisForm.SpO2}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, SpO2: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="98"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowDiagnosisModal(false);
                        setDiagnosisForm({ patientId: "", symptoms: "", BP: "", temperature: "", glucose: "", SpO2: "" });
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRunDiagnosis}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Run Diagnosis
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 space-y-4">
                    <h4 className="text-xl font-bold text-gray-800">Diagnosis Results</h4>

                    <div className="bg-white rounded p-4">
                      <p className="text-sm text-gray-600"><strong>Patient:</strong> {patients.find((p: any) => p.id === Number(diagnosisForm.patientId))?.name}</p>
                      <p className="text-sm text-gray-600"><strong>Symptoms:</strong> {diagnosisForm.symptoms}</p>
                    </div>

                    <div className="bg-white rounded p-4">
                      <p className="text-sm text-gray-600"><strong>Risk Level:</strong></p>
                      <p className={`text-lg font-bold ${
                        diagnosisResult.riskLevel === 'high' ? 'text-red-600' :
                        diagnosisResult.riskLevel === 'medium' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {diagnosisResult.riskLevel?.toUpperCase()}
                      </p>
                    </div>

                    <div className="bg-white rounded p-4">
                      <p className="text-sm text-gray-600"><strong>Prediction:</strong></p>
                      <p className="text-gray-700">{diagnosisResult.prediction}</p>
                    </div>

                    <div className="bg-white rounded p-4">
                      <p className="text-sm text-gray-600"><strong>Recommendation:</strong></p>
                      <p className="text-gray-700">{diagnosisResult.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      onClick={handleGeneratePrescription}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Generate Prescription
                    </button>
                    <button
                      onClick={() => {
                        setDiagnosisResult(null);
                        setDiagnosisForm({ patientId: "", symptoms: "", BP: "", temperature: "", glucose: "", SpO2: "" });
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Run Another Diagnosis
                    </button>
                    <button
                      onClick={() => {
                        setShowDiagnosisModal(false);
                        setDiagnosisResult(null);
                        setPrescriptionResult(null);
                        setDiagnosisForm({ patientId: "", symptoms: "", BP: "", temperature: "", glucose: "", SpO2: "" });
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  
                  {/* Prescription Result Display */}
                  {prescriptionResult && (
                    <>
                      <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-xl font-bold text-gray-800">Generated Prescription</h3>
                        
                        <div className="bg-white rounded p-4">
                          <p className="text-sm text-gray-600"><strong>Patient:</strong> {patients.find((p: any) => p.id === Number(diagnosisForm.patientId))?.name}</p>
                          <p className="text-sm text-gray-600"><strong>Diagnosis:</strong> {prescriptionResult.diagnosis}</p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded p-4">
                          <p className="text-sm text-green-700 font-semibold mb-3 flex items-center gap-2">
                            <Pill className="w-5 h-5" />
                            <strong>Prescribed Medications:</strong>
                          </p>
                          <ul className="mt-3 space-y-3">
                            {prescriptionResult.medications && prescriptionResult.medications.length > 0 ? (
                              prescriptionResult.medications.map((med: any, idx: number) => {
                                // Parse medication string to extract name, dosage, and frequency
                                const medString = typeof med === 'string' ? med : med.name || JSON.stringify(med);
                                const parts = medString.split(' - ');
                                const nameAndDose = parts[0] || medString;
                                const frequency = parts[1] || '';
                                
                                return (
                                  <li key={idx} className="bg-white p-3 rounded-lg border-l-4 border-green-600 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-sm font-semibold text-gray-800">{nameAndDose}</div>
                                    {frequency && <div className="text-xs text-gray-600 mt-1">📋 {frequency}</div>}
                                  </li>
                                );
                              })
                            ) : (
                              <li className="text-sm text-gray-500 italic">No medications prescribed</li>
                            )}
                          </ul>
                        </div>

                        {prescriptionResult.instructions && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <p className="text-sm text-blue-700 font-semibold mb-3">📝 <strong>Usage Instructions:</strong></p>
                            <ul className="mt-2 space-y-2">
                              {prescriptionResult.instructions.map((instruction: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 flex gap-2">
                                  <span className="text-blue-600 font-bold">✓</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {prescriptionResult.warnings && (
                          <div className="bg-red-50 border border-red-200 rounded p-4">
                            <p className="text-sm text-red-800 font-semibold mb-3">⚠️ <strong>Important Warnings:</strong></p>
                            <ul className="mt-2 space-y-2">
                              {prescriptionResult.warnings.map((warning: string, idx: number) => (
                                <li key={idx} className="text-sm text-red-700 flex gap-2">
                                  <span className="text-red-600 font-bold">!</span>
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4 border-t">
                        <button
                          onClick={() => {
                            setDiagnosisResult(null);
                            setPrescriptionResult(null);
                            setDiagnosisForm({ patientId: "", symptoms: "", BP: "", temperature: "", glucose: "", SpO2: "" });
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          New Diagnosis
                        </button>
                        <button
                          onClick={() => {
                            setShowDiagnosisModal(false);
                            setDiagnosisResult(null);
                            setPrescriptionResult(null);
                            setDiagnosisForm({ patientId: "", symptoms: "", BP: "", temperature: "", glucose: "", SpO2: "" });
                          }}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
