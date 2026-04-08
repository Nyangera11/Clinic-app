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

export function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!currentUser) return null;

  const stats = [
    { label: "Total Patients", value: "1,247", change: "+12%", icon: Users, color: "bg-blue-600" },
    { label: "Appointments Today", value: "18", change: "+5%", icon: Calendar, color: "bg-green-600" },
    { label: "Active Health Workers", value: "24", change: "0%", icon: Activity, color: "bg-purple-600" },
    { label: "Villages Served", value: "52", change: "+3", icon: MapPin, color: "bg-orange-600" },
  ];

  const recentAppointments = [
    { patient: "John Ekeno", service: "General Checkup", time: "09:00 AM", status: "Completed" },
    { patient: "Mary Arot", service: "Vaccination", time: "10:30 AM", status: "In Progress" },
    { patient: "Peter Lokai", service: "Laboratory", time: "11:00 AM", status: "Pending" },
    { patient: "Sarah Lokiru", service: "Maternal Care", time: "02:00 PM", status: "Pending" },
  ];

  const healthWorkers = [
    { name: "Dr. Mary Wanjiru", role: "Medical Officer", patients: 45, status: "Active" },
    { name: "CHW John Ekiru", role: "Community Health Worker", patients: 38, status: "Active" },
    { name: "Nurse Sarah Arot", role: "Registered Nurse", patients: 52, status: "Active" },
    { name: "Lab Tech David Lokai", role: "Laboratory Technician", patients: 29, status: "On Leave" },
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
          <div className="grid grid-cols-4 gap-2">
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
              onClick={() => setActiveTab("staff")}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "staff"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Health Workers
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Appointments</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentAppointments.map((apt, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{apt.patient}</td>
                      <td className="px-4 py-3 text-gray-600">{apt.service}</td>
                      <td className="px-4 py-3 text-gray-600">{apt.time}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            apt.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : apt.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Health Workers Tab */}
        {activeTab === "staff" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Health Workers</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patients</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {healthWorkers.map((worker, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{worker.name}</td>
                      <td className="px-4 py-3 text-gray-600">{worker.role}</td>
                      <td className="px-4 py-3 text-gray-600">{worker.patients}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            worker.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {worker.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
