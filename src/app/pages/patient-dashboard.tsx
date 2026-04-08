import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Calendar,
  FileText,
  MessageCircle,
  LogOut,
  User,
  Bell,
  Activity,
  Clock,
  MapPin,
} from "lucide-react";
import { AIChatAssistant } from "../components/ai-chat-assistant";
import { getApiUrl } from "../utils/api";

export function PatientDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  const loadPatientData = async (user: any) => {
    try {
      const appointmentsResp = await fetch(`${getApiUrl()}/api/appointments?patientEmail=${encodeURIComponent(user.email)}`);
      if (appointmentsResp.ok) {
        const appts = await appointmentsResp.json();
        setUpcomingAppointments(appts);
      }

      const patientsResp = await fetch(`/api/patients?q=${encodeURIComponent(user.email)}`);
      let patientId = null;
      if (patientsResp.ok) {
        const patients = await patientsResp.json();
        if (patients && patients.length > 0) {
          patientId = patients[0].id;
        }
      }

      if (patientId !== null) {
        const recordsResp = await fetch(`${getApiUrl()}/api/records?patientId=${patientId}`);
        if (recordsResp.ok) {
          const records = await recordsResp.json();
          setRecentRecords(records);
        }
      }

      setNotifications([
        'You have 1 upcoming appointment in 2 days',
        'Your latest lab result is available',
      ]);
    } catch (error) {
      console.error('Error loading patient data', error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(user);
    setCurrentUser(parsed);
    loadPatientData(parsed);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Mobile Health Clinic</span>
            </div>
            <div className="flex items-center gap-4">
              <button
              onClick={() => {
                if (notifications.length === 0) {
                  alert('No new notifications');
                } else {
                  alert(notifications.join('\n'));
                }
              }}
              className="relative p-2 text-gray-600 hover:text-green-600"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="p-2 text-gray-600 hover:text-green-600"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {currentUser.name}!</h1>
              <p className="text-green-100">Here's your health dashboard</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate("/appointments")}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Calendar className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Book Appointment</h3>
            <p className="text-sm text-gray-600">Schedule a clinic visit</p>
          </button>

          <button
            onClick={() => navigate("/medical-records")}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Medical Records</h3>
            <p className="text-sm text-gray-600">View your health history</p>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <MessageCircle className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Chat Support</h3>
            <p className="text-sm text-gray-600">Get instant help</p>
          </button>

          <button
            onClick={() => navigate("/services")}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Activity className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Our Services</h3>
            <p className="text-sm text-gray-600">Explore what we offer</p>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
              <button
                onClick={() => navigate("/appointments")}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View All
              </button>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{appointment.service}</h3>
                        <p className="text-sm text-gray-600">{appointment.date}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {appointment.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No upcoming appointments</p>
                <button
                  onClick={() => navigate("/appointments")}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>

          {/* Recent Records */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Records</h2>
              <button
                onClick={() => navigate("/medical-records")}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View All
              </button>
            </div>

            {recentRecords.length > 0 ? (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div key={record.id} className="border-l-4 border-green-600 pl-4 py-2">
                    <p className="text-sm text-gray-500 mb-1">{record.date}</p>
                    <h3 className="font-bold text-gray-900 mb-1">{record.service}</h3>
                    <p className="text-sm text-gray-600">{record.provider}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No medical records yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Health Tips for Today</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Drink at least 8 glasses of water daily to stay hydrated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Wash your hands regularly to prevent infections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Get regular checkups even when you feel healthy</span>
            </li>
          </ul>
        </div>
      </div>

      {/* AI Chatbot Floating Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-50 flex items-center gap-2 group"
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
          <span className="hidden group-hover:inline-block pr-2 font-medium">Chat with AI</span>
        </button>
      )}

      {/* AI Chat Assistant */}
      <AIChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
