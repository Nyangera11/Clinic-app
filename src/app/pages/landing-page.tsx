import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart, MapPin, Users, Activity, Clock, Shield, ChevronRight, MessageCircle, Moon, Sun } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AIChatAssistant } from "../components/ai-chat-assistant";
import { useDarkMode } from "../context/DarkModeContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Mobile Health Clinic</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate("/")} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium">
                Home
              </button>
              <button onClick={() => navigate("/about")} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium">
                About
              </button>
              <button onClick={() => navigate("/services")} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium">
                Services
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Get Started
              </button>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Healthcare Delivered to Your Doorstep
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                Bringing quality medical services to rural communities in Turkana County through AI-powered mobile health clinics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Book Appointment
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/services")}
                  className="border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Services
                </button>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1634710664586-fe890319a9fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwd29ya2VyJTIwcGF0aWVudCUyMGV4YW1pbmF0aW9uJTIwYWZyaWNhfGVufDF8fHx8MTc3MjY5MjU2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Healthcare Worker Examining Patient"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Mobile Clinic?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We leverage technology to provide accessible, affordable, and quality healthcare to underserved communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-8 rounded-xl">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accessible Healthcare</h3>
              <p className="text-gray-700">
                Our mobile clinics travel to remote areas, bringing medical services directly to your community.
              </p>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Diagnosis</h3>
              <p className="text-gray-700">
                Advanced AI technology assists our health workers in providing accurate and timely diagnoses.
              </p>
            </div>

            <div className="bg-purple-50 p-8 rounded-xl">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Records</h3>
              <p className="text-gray-700">
                Your medical records are securely stored and accessible anytime, compliant with Kenya's Data Protection Act.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <Users className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-green-100">Patients Served</div>
            </div>
            <div>
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-green-100">Villages Reached</div>
            </div>
            <div>
              <Heart className="w-12 h-12 mx-auto mb-4" fill="white" />
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-green-100">Medical Services</div>
            </div>
            <div>
              <Clock className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Team Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600">
              Experienced and compassionate medical staff dedicated to your wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1616291446004-b89a8453561c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZG9jdG9yJTIwc21pbGluZyUyMGhvc3BpdGFsfGVufDF8fHx8MTc3MjY5MjU2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Medical Doctor"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Qualified Doctors</h3>
                <p className="text-gray-600">Expert medical professionals providing comprehensive care</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758205307960-4a0ec7ad2c0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMGhlbHBpbmclMjBwYXRpZW50JTIwY2xpbmljfGVufDF8fHx8MTc3MjY5MjU2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Nurse Helping Patient"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Caring Nurses</h3>
                <p className="text-gray-600">Compassionate nursing staff ensuring your comfort</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691462126-2ee47c8bf9e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBjb25zdWx0YXRpb24lMjBwYXRpZW50JTIwY2FyZXxlbnwxfHx8fDE3NzI2OTI1Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Doctor Consultation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Community Health Workers</h3>
                <p className="text-gray-600">Local health advocates connecting communities to care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Getting healthcare has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Register</h3>
              <p className="text-gray-600">Create your account and complete your health profile</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Book Appointment</h3>
              <p className="text-gray-600">Schedule a visit when our mobile clinic is in your area</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Get Treatment</h3>
              <p className="text-gray-600">Receive care from qualified health workers</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Follow Up</h3>
              <p className="text-gray-600">Access your records and get reminders for follow-up care</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Access Quality Healthcare?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of patients who trust our mobile health clinic for their healthcare needs.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6" fill="white" />
                <span className="font-bold text-lg">Mobile Health Clinic</span>
              </div>
              <p className="text-gray-400">
                Bringing quality healthcare to rural communities in Turkana County.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate("/")} className="hover:text-white">Home</button></li>
                <li><button onClick={() => navigate("/about")} className="hover:text-white">About Us</button></li>
                <li><button onClick={() => navigate("/services")} className="hover:text-white">Services</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>General Checkup</li>
                <li>Vaccination</li>
                <li>Laboratory Tests</li>
                <li>Maternal Care</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Turkana County, Kenya</li>
                <li>Phone: +254 700 000 000</li>
                <li>Email: info@mobilehealthclinic.ke</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Mobile Health Clinic. All rights reserved. Compliant with Kenya Data Protection Act 2019.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot Floating Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-50 flex items-center gap-2 group"
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
          <span className="hidden group-hover:inline-block pr-2 font-medium">Ask AI</span>
        </button>
      )}

      {/* AI Chat Assistant */}
      <AIChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
