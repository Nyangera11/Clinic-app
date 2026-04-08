import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Calendar, MapPin, Clock, Heart, ChevronLeft, Plus } from "lucide-react";
import { getApiUrl } from "../utils/api";

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    service: "",
    date: "",
    location: "",
    provider: "",
    time: "",
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

  const loadAppointments = async (userEmail: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/appointments?patientEmail=${encodeURIComponent(userEmail)}`);
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
      const patientsResp = await fetch(`${getApiUrl()}/api/patients?q=${encodeURIComponent(currentUser.email)}`);
      if (patientsResp.ok) {
        const existingPatients = await patientsResp.json();
        if (existingPatients.length > 0) {
          patientId = existingPatients[0].id;
        }
      }

      if (!patientId) {
        const createResp = await fetch(`${getApiUrl()}/api/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

      const response = await fetch(`${getApiUrl()}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const res = await fetch(`${getApiUrl()}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${getApiUrl()}/api/appointments/${reschedulingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
                  onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Choose a service...</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Laboratory Tests">Laboratory Tests</option>
                  <option value="Maternal Care">Maternal Care</option>
                  <option value="Dental Care">Dental Care</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date & Location
                </label>
                <select
                  value={newAppointment.date}
                  onChange={(e) => {
                    const chosenDate = e.target.value;
                    const schedule = clinicSchedule.find((s) => s.date === chosenDate);
                    setNewAppointment({
                      ...newAppointment,
                      date: chosenDate,
                      location: schedule?.location || "",
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Choose a date...</option>
                  {clinicSchedule.map((schedule, index) => (
                    <option key={index} value={schedule.date}>
                      {formatDisplayDate(schedule.date)} - {schedule.location} ({schedule.availableSlots} slots available)
                    </option>
                  ))}
                </select>
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
                  <option value="">Select doctor...</option>
                  <option value="Dr. Mary Wanjiru">Dr. Mary Wanjiru</option>
                  <option value="Dr. John Mwangi">Dr. John Mwangi</option>
                  <option value="Dr. Amina Hassan">Dr. Amina Hassan</option>
                  <option value="Any Available Clinician">Any Available Clinician</option>
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
                          await fetch(`${getApiUrl()}/api/reminders/test/${appointment.id}`, {
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
                <select
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
                >
                  <option value="">Choose a date...</option>
                  {clinicSchedule.map((schedule, idx) => (
                    <option key={idx} value={schedule.date}>
                      {schedule.date} - {schedule.location}
                    </option>
                  ))}
                </select>
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
