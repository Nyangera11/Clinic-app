import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Stethoscope,
  Activity,
  Thermometer,
  Droplet,
  LogOut,
  User,
  Plus,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function HealthWorkerPortal() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    temperature: "",
    glucose: "",
    spo2: "",
    heartRate: "",
  });
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [recordSaving, setRecordSaving] = useState(false);
  const [showNewPatientPanel, setShowNewPatientPanel] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    village: "",
  });
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentPatient, setAppointmentPatient] = useState<any>(null);
  const [appointmentData, setAppointmentData] = useState({
    service: "",
    date: "",
    location: "",
    provider: "",
    time: "",
  });

  const getFutureDate = (daysAhead: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateValue: string) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const clinicSchedule = [
    { date: getFutureDate(1), location: "Kakuma Village", availableSlots: 5 },
    { date: getFutureDate(3), location: "Lodwar Town", availableSlots: 8 },
    { date: getFutureDate(5), location: "Lokichoggio", availableSlots: 3 },
    { date: getFutureDate(7), location: "Kakuma Village", availableSlots: 6 },
  ];

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(user);
    if (userData.role !== "health_worker") {
      navigate("/login");
      return;
    }
    setCurrentUser(userData);
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const loadData = async () => {
    try {
      const patientsRes = await fetch(`/api/patients?q=${encodeURIComponent(patientSearch)}`);
      if (patientsRes.ok) {
        setPatients(await patientsRes.json());
      }
      const appointmentsRes = await fetch(`/api/appointments`);
      if (appointmentsRes.ok) {
        setAppointments(await appointmentsRes.json());
      }
    } catch (err) {
      console.error('Error loading health worker data', err);
    }
  };

  const handleNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientData),
      });
      if (!res.ok) throw new Error('Failed to create patient');
      await loadData();
      setShowNewPatientPanel(false);
      setNewPatientData({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', village: '' });
      alert('Patient record created');
    } catch (err) {
      console.error(err);
      alert('Could not save patient');
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedPatient) {
      alert('Please pick a patient dropdown first.');
      return;
    }

    setRecordSaving(true);
    try {
      const details = `Vitals: BP ${vitals.bloodPressure}, Temp ${vitals.temperature}, Glucose ${vitals.glucose}, SpO2 ${vitals.spo2}, HR ${vitals.heartRate}.`;
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          recordType: 'Vitals',
          details,
        }),
      });
      await loadData();
      alert('Patient vitals saved to record.');
    } catch (err) {
      console.error(err);
      alert('Failed to save patient record');
    } finally {
      setRecordSaving(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentPatient) {
      alert('No patient selected');
      return;
    }

    if (!appointmentData.service || !appointmentData.date || !appointmentData.location || !appointmentData.provider || !appointmentData.time) {
      alert('Please fill all fields to book an appointment.');
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: appointmentPatient.id,
          patientName: `${appointmentPatient.firstName} ${appointmentPatient.lastName}`,
          patientEmail: appointmentPatient.email,
          provider: appointmentData.provider,
          service: appointmentData.service,
          scheduledAt: `${appointmentData.date} ${appointmentData.time}`,
          notes: `Location: ${appointmentData.location}`,
          status: 'Confirmed',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        const err = errText ? JSON.parse(errText) : { error: errText };
        throw new Error(err.error || errText || 'Unable to book appointment');
      }

      await loadData();
      setShowAppointmentModal(false);
      setAppointmentData({ service: '', date: '', location: '', provider: '', time: '' });
      alert('Appointment booked successfully!');
    } catch (error: any) {
      console.error('Booking error', error);
      alert(`Failed to book appointment: ${error.message}`);
    }
  };

  const getPatientAppointments = (patientId: number) => {
    return appointments.filter((apt) => apt.patientId === patientId);
  };

  const handlePatientSearch = async (value: string) => {
    setPatientSearch(value);
    try {
      const patientsRes = await fetch(`/api/patients?q=${encodeURIComponent(value)}`);
      if (patientsRes.ok) {
        setPatients(await patientsRes.json());
      }
    } catch (err) {
      console.error('Search error', err);
    }
  };

  const handleCaptureVitals = () => {
    // Simulate AI diagnosis based on vitals
    const bp = vitals.bloodPressure.split("/");
    const systolic = parseInt(bp[0] || "0");
    const temp = parseFloat(vitals.temperature || "0");
    const glucose = parseFloat(vitals.glucose || "0");

    let diagnosis = "Patient vitals captured successfully. ";

    if (systolic > 140) {
      diagnosis += "⚠️ High blood pressure detected. Recommend referral to specialist. ";
    } else if (systolic < 90) {
      diagnosis += "⚠️ Low blood pressure detected. Monitor closely. ";
    } else {
      diagnosis += "✓ Blood pressure within normal range. ";
    }

    if (temp > 37.5) {
      diagnosis += "⚠️ Fever detected. Consider malaria test or infection screening. ";
    } else {
      diagnosis += "✓ Temperature normal. ";
    }

    if (glucose > 126) {
      diagnosis += "⚠️ High blood glucose. Possible diabetes, recommend further testing. ";
    } else if (glucose < 70 && glucose > 0) {
      diagnosis += "⚠️ Low blood glucose. Risk of hypoglycemia. ";
    } else if (glucose > 0) {
      diagnosis += "✓ Blood glucose normal. ";
    }

    setAiDiagnosis(diagnosis);
  };

  if (!currentUser) return null;

  const todaysAppointments = appointments
    .filter((apt) => new Date(apt.scheduledAt).toDateString() === new Date().toDateString())
    .map((apt) => ({
      time: apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
      patient: apt.patientName || 'Unknown',
      service: apt.service || 'Unknown',
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-white p-2 rounded-lg">
                <Heart className="w-6 h-6 text-green-600" fill="currentColor" />
              </div>
              <div>
                <span className="font-bold text-lg">Health Worker Portal</span>
                <p className="text-xs text-green-100">Mobile Health Clinic</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white hidden md:block">CHW: {currentUser.name}</span>
              <button onClick={handleLogout} className="text-white hover:text-green-100">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "patients"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Patients
            </button>
            <button
              onClick={() => setActiveTab("vitals")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "vitals"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Capture Vitals
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <User className="w-8 h-8 text-blue-600" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">124</div>
                <div className="text-sm text-gray-600">Patients Registered</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-green-600" />
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-sm text-gray-600">Today's Appointments</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Stethoscope className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">18</div>
                <div className="text-sm text-gray-600">Checkups This Week</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-600">Follow-ups Pending</div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Schedule</h2>
              <div className="space-y-3">
                {todaysAppointments.map((apt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 px-3 py-1 rounded-lg">
                        <span className="text-green-700 font-medium text-sm">{apt.time}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{apt.patient}</h3>
                        <p className="text-sm text-gray-600">{apt.service}</p>
                      </div>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                      Start Visit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Patient List</h2>
              <button
                onClick={() => setShowNewPatientPanel((value) => !value)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {showNewPatientPanel ? 'Close Form' : 'Register New Patient'}
              </button>
            </div>

            {showNewPatientPanel && (
              <form onSubmit={handleNewPatient} className="mb-6 space-y-3 border border-gray-200 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newPatientData.firstName} onChange={(e) => setNewPatientData({ ...newPatientData, firstName: e.target.value })} className="border rounded p-2" placeholder="First Name" required />
                  <input value={newPatientData.lastName} onChange={(e) => setNewPatientData({ ...newPatientData, lastName: e.target.value })} className="border rounded p-2" placeholder="Last Name" required />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newPatientData.email} onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })} className="border rounded p-2" placeholder="Email" required />
                  <input value={newPatientData.phone} onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })} className="border rounded p-2" placeholder="Phone" />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input type="date" value={newPatientData.dateOfBirth} onChange={(e) => setNewPatientData({ ...newPatientData, dateOfBirth: e.target.value })} className="border rounded p-2" required />
                  <input value={newPatientData.village} onChange={(e) => setNewPatientData({ ...newPatientData, village: e.target.value })} className="border rounded p-2" placeholder="Village" />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save Patient</button>
              </form>
            )}

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Village</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{`${patient.firstName} ${patient.lastName}`}</td>
                      <td className="px-4 py-3 text-gray-600">{patient.email}</td>
                      <td className="px-4 py-3 text-gray-600">{patient.village || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(patient.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setActiveTab('vitals');
                            }}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setAppointmentPatient(patient);
                              setAppointmentData({
                                service: '',
                                date: clinicSchedule[0]?.date || '',
                                location: clinicSchedule[0]?.location || '',
                                provider: '',
                                time: '',
                              });
                              setShowAppointmentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Capture Vitals Tab */}
        {activeTab === "vitals" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Capture Patient Vitals</h2>

              {selectedPatient && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-600">
                    Age: {selectedPatient.age} | Village: {selectedPatient.village}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure (mmHg)
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      placeholder="120/80"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°C)
                  </label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                      placeholder="36.5"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Glucose (mg/dL)
                  </label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={vitals.glucose}
                      onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })}
                      placeholder="90"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SpO₂ (%)
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      placeholder="98"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Rate (bpm)
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                      placeholder="72"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCaptureVitals}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Get AI Diagnosis
                </button>
              </div>
            </div>

            {/* AI Diagnosis Results */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">AI Diagnosis Results</h2>

              {aiDiagnosis ? (
                <div>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-blue-900 mb-2">Preliminary Assessment</h3>
                    <p className="text-blue-800">{aiDiagnosis}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900">Recommendations:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Continue regular monitoring of vitals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Schedule follow-up visit in 2 weeks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Maintain healthy diet and exercise</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handleSaveRecord}
                    disabled={recordSaving}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${recordSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {recordSaving ? 'Saving...' : 'Save to Patient Record'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Enter patient vitals and click "Get AI Diagnosis" to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAppointmentModal && appointmentPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Appointment for {appointmentPatient.firstName} {appointmentPatient.lastName}</h2>
                <p className="text-sm text-gray-500">Patient email: {appointmentPatient.email || 'N/A'}</p>
              </div>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleBookAppointment} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <select
                      value={appointmentData.service}
                      onChange={(e) => setAppointmentData({ ...appointmentData, service: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    >
                      <option value="">Select service</option>
                      <option value="General Checkup">General Checkup</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Laboratory Tests">Laboratory Tests</option>
                      <option value="Maternal Care">Maternal Care</option>
                      <option value="Dental Care">Dental Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <select
                      value={appointmentData.date}
                      onChange={(e) => {
                        const chosenDate = e.target.value;
                        const schedule = clinicSchedule.find((item) => item.date === chosenDate);
                        setAppointmentData({
                          ...appointmentData,
                          date: chosenDate,
                          location: schedule?.location || appointmentData.location,
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    >
                      <option value="">Choose a date</option>
                      {clinicSchedule.map((schedule) => (
                        <option key={schedule.date} value={schedule.date}>
                          {formatDisplayDate(schedule.date)} - {schedule.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={appointmentData.location}
                      onChange={(e) => setAppointmentData({ ...appointmentData, location: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Clinic location"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                    <select
                      value={appointmentData.provider}
                      onChange={(e) => setAppointmentData({ ...appointmentData, provider: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    >
                      <option value="">Select clinician</option>
                      <option value="Dr. Mary Wanjiru">Dr. Mary Wanjiru</option>
                      <option value="Dr. John Mwangi">Dr. John Mwangi</option>
                      <option value="Dr. Amina Hassan">Dr. Amina Hassan</option>
                      <option value="Any Available Clinician">Any Available Clinician</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
