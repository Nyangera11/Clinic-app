import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Calendar, MapPin, Clock, Heart, ChevronLeft, Plus } from "lucide-react";
import { apiCall, getApiUrl } from "../utils/api";
import { formatPrice, calculateTotal } from "../utils/pricing";

const services = [
  "General Checkup",
  "Vaccination",
  "Laboratory Tests",
  "Maternal Care",
  "Dental Care",
  "Pediatric Care",
  "Mental Health Counseling",
  "Chronic Disease Management",
  "Nutrition Counseling",
  "Antenatal Care",
  "Eye Care",
  "Dermatology",
  "Cardiology",
  "Orthopedics",
  "Emergency Care",
  "Physiotherapy",
  "Radiology",
  "Surgery",
  "Oncology",
  "Nephrology",
  "Consultation",
];

const SERVICE_PRICES: Record<string, number> = {
  "General Checkup": 500,
  "Vaccination": 1500,
  "Laboratory Tests": 800,
  "Maternal Care": 1200,
  "Dental Care": 2000,
  "Pediatric Care": 900,
  "Mental Health Counseling": 1100,
  "Chronic Disease Management": 1300,
  "Nutrition Counseling": 600,
  "Antenatal Care": 1400,
  "Eye Care": 1800,
  "Dermatology": 1600,
  "Cardiology": 2500,
  "Orthopedics": 2000,
  "Emergency Care": 3000,
  "Physiotherapy": 1000,
  "Radiology": 2200,
  "Surgery": 5000,
  "Oncology": 3500,
  "Nephrology": 2800,
  "Consultation": 400,
};

const providers = [
  "Dr. Mary Wanjiru",
  "Dr. John Mwangi",
  "Dr. Amina Hassan",
  "Dr. Grace Njoroge",
  "Dr. Samuel Otieno",
  "Nurse Esther Kamau",
  "Clinical Officer Peter Ochieng",
  "Any Available Clinician",
];

const locations = [
  "Kakuma Village",
  "Lodwar Town",
  "Lokichoggio",
  "Turkana Central",
  "Kajiado North",
];

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [newAppointment, setNewAppointment] = useState({
    service: "",
    date: "",
    location: "",
    provider: "",
    time: "",
    price: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
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

  const loadDoctors = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/users/doctors`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error loading doctors', error);
    }
  };

  const loadAppointments = async (userEmail: string) => {
    try {
      const response = await apiCall(`/api/appointments?patientEmail=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setUpcomingAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments', error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "patient") {
      navigate("/login");
      return;
    }
    setCurrentUser(parsed);
    loadAppointments(parsed.email);
    loadDoctors();
  }, [navigate]);

  const pastAppointments = upcomingAppointments.filter((appointment) => new Date(appointment.scheduledAt) < new Date());
  const futureAppointments = upcomingAppointments.filter((appointment) => new Date(appointment.scheduledAt) >= new Date());

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in as a patient to book.');
      return;
    }

    console.debug('Submitting new appointment', newAppointment);

    if (!newAppointment.service || !newAppointment.date || !newAppointment.location || !newAppointment.provider || !newAppointment.time) {
      alert('Please fill all fields to book an appointment.');
      return;
    }

    setBookingLoading(true);
    try {
      const [firstName, ...rest] = (currentUser.name || '').split(' ');
      const lastName = rest.join(' ') || currentUser.name;

      // Ensure patient exists in backend and fetch patientId
      let patientId: number | null = null;
      const patientsResp = await apiCall(`/api/patients?q=${encodeURIComponent(currentUser.email)}`);
      if (patientsResp.ok) {
        const existingPatients = await patientsResp.json();
        if (existingPatients.length > 0) {
          patientId = existingPatients[0].id;
        }
      }

      if (!patientId) {
        const createResp = await apiCall('/api/patients', {
          method: 'POST',
          body: JSON.stringify({
            firstName,
            lastName,
            email: currentUser.email,
            phone: currentUser.phone || null,
            dateOfBirth: currentUser.dateOfBirth || null,
            village: 'Unknown',
          }),
        });

        if (!createResp.ok) {
          const err = await createResp.json();
          throw new Error(err.error || 'Unable to create patient profile');
        }

        const createdPatient = await createResp.json();
        patientId = createdPatient.id;
      }

      const response = await apiCall('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          patientName: currentUser.name,
          patientEmail: currentUser.email,
          patientPhone: currentUser.phone,
          provider: newAppointment.provider,
          service: newAppointment.service,
          scheduledAt: `${newAppointment.date} ${newAppointment.time}`,
          notes: `Location: ${newAppointment.location}`,
          status: 'Confirmed',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        const err = errText ? JSON.parse(errText) : { error: errText };
        throw new Error(err.error || errText || 'Unable to book appointment');
      }

      const created = await response.json();
      setUpcomingAppointments((prev) => [created, ...prev]);
      setShowBooking(false);
      setNewAppointment({ service: '', date: '', location: '', provider: '', time: '' });
      alert('Appointment booked successfully!');
      loadAppointments(currentUser.email);
    } catch (error: any) {
      console.error('Booking error', error);
      alert(`Failed to book appointment: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const res = await apiCall(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Cancelled' }),
      });

      if (!res.ok) throw new Error('Failed to cancel appointment');

      alert('Appointment cancelled successfully');
      loadAppointments(currentUser.email);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reschedulingId || !rescheduleForm.date || !rescheduleForm.provider || !rescheduleForm.time) {
      alert('Please fill all reschedule fields');
      return;
    }

    try {
      const res = await apiCall(`/api/appointments/${reschedulingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          provider: rescheduleForm.provider,
          scheduledAt: `${rescheduleForm.date} ${rescheduleForm.time}`,
          status: 'Confirmed',
        }),
      });

      if (!res.ok) throw new Error('Failed to reschedule appointment');

      alert('Appointment rescheduled successfully');
      setReschedulingId(null);
      setRescheduleForm({ date: '', provider: '', time: '' });
      loadAppointments(currentUser.email);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/patient-dashboard")}
              className="flex items-center gap-2 text-gray-700 hover:text-green-600"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-green-600" fill="currentColor" />
              <span className="font-bold text-xl">Appointments</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book New Appointment */}
        {!showBooking ? (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
                <p className="text-green-100">Schedule your visit to our mobile clinic</p>
              </div>
              <button
                onClick={() => setShowBooking(true)}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Appointment
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book New Appointment</h2>
              <button
                onClick={() => setShowBooking(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service
                </label>
                <select
                  value={newAppointment.service}
                  onChange={(e) => {
                    const selectedService = e.target.value;
                    setNewAppointment({ 
                      ...newAppointment, 
                      service: selectedService,
                      price: SERVICE_PRICES[selectedService] || 0
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Appointment Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newAppointment.date}
                  onChange={(e) => {
                    const chosenDate = e.target.value;
                    const schedule = clinicSchedule.find((s) => s.date === chosenDate);
                    setNewAppointment({
                      ...newAppointment,
                      date: chosenDate,
                      location: schedule?.location || newAppointment.location,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Select a date from the calendar. If it matches a clinic stop, the location will auto-suggest.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Location
                </label>
                <select
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select location...</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Choose a North Kenya clinic location for your appointment.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Provider
                </label>
                <select
                  value={newAppointment.provider}
                  onChange={(e) => setNewAppointment({ ...newAppointment, provider: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select clinician...</option>
                  {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                    ))
                  ) : (
                    <option disabled>Loading clinicians...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {newAppointment.service && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Service Cost</p>
                      <p className="text-xl font-bold text-green-600">{formatPrice(newAppointment.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-700">{formatPrice(newAppointment.price)}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${bookingLoading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
          <div className="space-y-4">
            {futureAppointments.length > 0 ? (
              futureAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-green-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{appointment.service}</h3>
                      <p className="text-sm text-gray-600 mt-1">{new Date(appointment.scheduledAt).toLocaleString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "Completed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {appointment.time || "09:00 AM"}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {appointment.location || "TBD"}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Provider:</span> {appointment.provider || "Any"}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <span className="text-lg font-bold text-green-600">{formatPrice(SERVICE_PRICES[appointment.service] || 0)}</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => {
                        setReschedulingId(appointment.id);
                        const date = appointment.scheduledAt.split(' ')[0];
                        const time = appointment.scheduledAt.split(' ')[1] || '09:00';
                        setRescheduleForm({ date, provider: appointment.provider || '', time });
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await apiCall(`/api/reminders/test/${appointment.id}`, {
                            method: 'POST'
                          });
                          alert('Test reminder sent!');
                        } catch (error) {
                          alert('Failed to send test reminder');
                        }
                      }}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      Test Reminder
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">No upcoming appointments.</div>
            )}
          </div>
        </div>

        {/* Past Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Past Appointments</h2>
          <div className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-6 opacity-75"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{appointment.service}</h3>
                      <p className="text-sm text-gray-600 mt-1">{new Date(appointment.scheduledAt).toLocaleString()}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {appointment.time || "09:00 AM"}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {appointment.location || "TBD"}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Provider:</span> {appointment.provider || "Any"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">No past appointments yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {reschedulingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reschedule Appointment</h2>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleForm.date}
                  onChange={(e) => {
                    const chosenDate = e.target.value;
                    setRescheduleForm({
                      ...rescheduleForm,
                      date: chosenDate,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select
                  value={rescheduleForm.provider}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, provider: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                >
                  <option value="">Select doctor...</option>
                  <option value="Dr. Mary Wanjiru">Dr. Mary Wanjiru</option>
                  <option value="Dr. John Mwangi">Dr. John Mwangi</option>
                  <option value="Dr. Amina Hassan">Dr. Amina Hassan</option>
                  <option value="Any Available Clinician">Any Available Clinician</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Confirm Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReschedulingId(null);
                    setRescheduleForm({ date: '', provider: '', time: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
