import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart, Lock, Mail, User, UserCircle, Phone } from "lucide-react";

type UserRole = "patient" | "health_worker" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient" as UserRole,
  });

  const seedDefaultUsers = () => {
    const existing = JSON.parse(localStorage.getItem("users") || "[]");
    if (existing.length === 0) {
      const demoUsers = [
        { name: "Demo Patient", email: "patient@clinic.test", password: "patient123", phone: "712345678", role: "patient" },
        { name: "Demo Health Worker", email: "worker@clinic.test", password: "worker123", phone: "723456789", role: "health_worker" },
        { name: "Demo Admin", email: "admin@clinic.test", password: "admin123", phone: "734567890", role: "admin" },
      ];
      localStorage.setItem("users", JSON.stringify(demoUsers));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    seedDefaultUsers();

    // Store user data in localStorage (simulating backend)
    let userToStore = { ...formData };

    if (isSignUp) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.some((u: any) => u.email === formData.email)) {
        alert("An account with this email already exists");
        return;
      }
      users.push(formData);
      localStorage.setItem("users", JSON.stringify(users));
    } else {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(
        (u: any) => u.email === formData.email && u.password === formData.password
      );
      if (!user) {
        alert("Invalid email or password. If new, please register first.");
        return;
      }
      userToStore = { name: user.name, email: user.email, role: user.role, phone: user.phone, password: user.password };
    }

    // Store current user
    localStorage.setItem("currentUser", JSON.stringify(userToStore));

    // Navigate based on role
    if (userToStore.role === "patient") {
      navigate("/patient-dashboard");
    } else if (userToStore.role === "health_worker") {
      navigate("/health-worker");
    } else if (userToStore.role === "admin") {
      navigate("/admin");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Password reset link sent to ${formData.email}`);
    setShowForgotPassword(false);
    setFormData({ ...formData, email: "" });
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-green-600">
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 p-4 rounded-full">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Reset Password
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Enter your email to receive a reset link
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-green-600 py-2 font-medium hover:text-green-700 transition-colors"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-green-600">
          <div className="flex justify-center mb-6">
            <div className="bg-green-600 p-4 rounded-full">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Mobile Health Clinic
          </h1>
          <p className="text-center text-gray-600 mb-2">
            {isSignUp ? "Create your account" : "Welcome back! Please login to your account"}
          </p>
          <p className="text-center text-sm text-green-600 mb-8 font-medium">
            {isSignUp ? "For Patients, Health Workers & Administrators" : "Patients • Health Workers • Admins"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none bg-white"
                      required
                    >
                      <option value="patient">Patient</option>
                      <option value="health_worker">Community Health Worker</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (for SMS reminders)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="712345678"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {isSignUp ? "Create Account" : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormData({ name: "", email: "", password: "", role: "patient" });
                }}
                className="text-green-600 font-semibold hover:text-green-700"
              >
                {isSignUp ? "Sign In" : "Create New Account"}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/")}
              className="w-full text-gray-600 py-2 font-medium hover:text-gray-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
