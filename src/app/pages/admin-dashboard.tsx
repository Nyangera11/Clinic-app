import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  MapPin,
  FileText,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";
import { getApiUrl } from "../utils/api";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [patients, setPatients] = useState<any[]>([]);
  const [healthWorkers, setHealthWorkers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(user);
    if (userData.role !== "admin") {
      navigate("/login");
      return;
    }
    setCurrentUser(userData);
    loadUsers();
    loadAppointments();
  }, [navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      try {
        const patientsRes = await fetch(`${getApiUrl()}/api/users/patients`);
        const workersRes = await fetch(`${getApiUrl()}/api/users/doctors`);
        
        if (patientsRes.ok) {
          setPatients(await patientsRes.json());
        }
        if (workersRes.ok) {
          setHealthWorkers(await workersRes.json());
        }
      } catch (apiError) {
        // Fallback to localStorage if API fails
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const patientsList = users.filter((u: any) => u.role === "patient");
        const workersList = users.filter((u: any) => u.role === "health_worker");
        setPatients(patientsList);
        setHealthWorkers(workersList);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      // Try to fetch from API first
      try {
        const appointmentsRes = await fetch(`${getApiUrl()}/api/appointments`);
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          setAppointments(data);
        }
      } catch (apiError) {
        // Fallback to localStorage if API fails
        const userAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
        setAppointments(userAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const getCurrentAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.scheduledAt || apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= today;
    });
  };

  const getPastAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.scheduledAt || apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate < today;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!currentUser) return null;

  const stats = [
    { label: "Total Patients", value: patients.length.toString(), change: "+12%", icon: Users, color: "bg-blue-600" },
    { label: "Appointments Today", value: "18", change: "+5%", icon: Calendar, color: "bg-green-600" },
    { label: "Active Health Workers", value: healthWorkers.length.toString(), change: "0%", icon: Activity, color: "bg-purple-600" },
    { label: "Villages Served", value: "52", change: "+3", icon: MapPin, color: "bg-orange-600" },
  ];

  const recentAppointments = [
    { patient: "John Ekeno", service: "General Checkup", time: "09:00 AM", status: "Completed" },
    { patient: "Mary Arot", service: "Vaccination", time: "10:30 AM", status: "In Progress" },
    { patient: "Peter Lokai", service: "Laboratory", time: "11:00 AM", status: "Pending" },
    { patient: "Sarah Lokiru", service: "Maternal Care", time: "02:00 PM", status: "Pending" },
  ];

  const clinicLocations = [
    { location: "Kakuma Village", date: "March 10, 2026", appointments: 15, status: "Scheduled" },
    { location: "Lodwar Town", date: "March 15, 2026", appointments: 22, status: "Scheduled" },
    { location: "Lokichoggio", date: "March 20, 2026", appointments: 8, status: "Scheduled" },
  ];

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
              <div>
                <span className="font-bold text-lg">Admin Dashboard</span>
                <p className="text-xs text-gray-600">Mobile Health Clinic</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-800">
                <Settings className="w-6 h-6" />
              </button>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome, {currentUser.name}</h1>
          <p className="text-green-100">System Administrator - Mobile Health Clinic</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-2">
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "appointments"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "patients"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Patients ({patients.length})
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "staff"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Health Workers ({healthWorkers.length})
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "locations"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Locations
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New patient registered</p>
                    <p className="text-sm text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Appointment completed</p>
                    <p className="text-sm text-gray-600">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                  <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Medical record updated</p>
                    <p className="text-sm text-gray-600">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Health</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Database Status</span>
                    <span className="text-green-600 font-medium">Optimal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">API Response Time</span>
                    <span className="text-green-600 font-medium">Fast</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Storage Usage</span>
                    <span className="text-yellow-600 font-medium">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "62%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-8">
            {/* Current Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading appointments...</p>
                </div>
              ) : getCurrentAppointments().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No upcoming appointments</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getCurrentAppointments().map((apt, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">{apt.patientName || apt.patient || "N/A"}</td>
                          <td className="px-4 py-3 text-gray-600">{apt.service}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {apt.scheduledAt 
                              ? new Date(apt.scheduledAt).toLocaleString() 
                              : apt.date 
                              ? `${apt.date} ${apt.time || ""}`.trim()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{apt.location || "TBD"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                apt.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : apt.status === "Confirmed"
                                  ? "bg-blue-100 text-blue-700"
                                  : apt.status === "In Progress"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {apt.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Past Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Past Appointments</h2>
              {getPastAppointments().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No past appointments</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getPastAppointments().map((apt, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">{apt.patientName || apt.patient || "N/A"}</td>
                          <td className="px-4 py-3 text-gray-600">{apt.service}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {apt.scheduledAt 
                              ? new Date(apt.scheduledAt).toLocaleString() 
                              : apt.date 
                              ? `${apt.date} ${apt.time || ""}`.trim()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{apt.location || "TBD"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                apt.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {apt.status || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Registered Patients</h2>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No patients registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {patients.map((patient, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{patient.name || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-600">{patient.email}</td>
                        <td className="px-4 py-3 text-gray-600">{patient.phone || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{new Date().toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Health Workers Tab */}
        {activeTab === "staff" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Community Health Workers</h2>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading health workers...</p>
              </div>
            ) : healthWorkers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No health workers registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {healthWorkers.map((worker, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{worker.name || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-600">{worker.email}</td>
                        <td className="px-4 py-3 text-gray-600">{worker.phone || "N/A"}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Clinic Locations</h2>
            <div className="space-y-4">
              {clinicLocations.map((location, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:border-green-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{location.location}</h3>
                      <p className="text-sm text-gray-600 mt-1">{location.date}</p>
                      <p className="text-sm text-gray-600">{location.appointments} appointments scheduled</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {location.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
