import { useNavigate } from "react-router";
import {
  Stethoscope,
  Syringe,
  Activity,
  Baby,
  Heart,
  Eye,
  TestTube,
  Pill,
  Smile,
  Users,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ServicesPage() {
  const navigate = useNavigate();

  const services = [
    {
      icon: Stethoscope,
      name: "General Checkup",
      description: "Comprehensive health examinations and consultations for all ages",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Syringe,
      name: "Vaccination",
      description: "Immunizations for children and adults including COVID-19, measles, polio",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: TestTube,
      name: "Laboratory Tests",
      description: "Blood tests, malaria screening, HIV testing, and diagnostic services",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Baby,
      name: "Maternal & Child Care",
      description: "Prenatal care, postnatal support, and pediatric health services",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Activity,
      name: "Chronic Disease Management",
      description: "Monitoring and treatment for diabetes, hypertension, and other conditions",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Heart,
      name: "Cardiology Screening",
      description: "Heart health monitoring and cardiovascular disease prevention",
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: Eye,
      name: "Eye Examinations",
      description: "Vision testing and basic eye care services",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: Pill,
      name: "Malaria Treatment",
      description: "Testing, treatment, and prevention of malaria",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Smile,
      name: "Dental Care",
      description: "Basic dental checkups and oral health education",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      icon: Users,
      name: "TB Screening",
      description: "Tuberculosis testing and treatment referrals",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Mobile Health Clinic</span>
            </button>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="text-gray-700 hover:text-green-600 font-medium">
                Home
              </button>
              <button onClick={() => navigate("/about")} className="text-gray-700 hover:text-green-600 font-medium">
                About
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Medical Services
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Comprehensive healthcare delivered directly to your community with the help of advanced technology
          </p>
        </div>
      </section>

      {/* Services In Action */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quality Healthcare in Action
            </h2>
            <p className="text-xl text-gray-600">
              See how we deliver essential medical services to communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1621525434111-87a99d170b0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2hlY2t1cCUyMGJsb29kJTIwcHJlc3N1cmV8ZW58MXx8fHwxNzcyNjkyNTY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Medical Checkup"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Vital Signs Monitoring</h3>
                <p className="text-gray-600">Regular monitoring of blood pressure, glucose levels, temperature, and SpO2 using IoT devices</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1612277795000-c6f7766e469d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YWNjaW5hdGlvbiUyMGltbXVuaXphdGlvbiUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzcyNjkyNTY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Vaccination"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Immunization Programs</h3>
                <p className="text-gray-600">Comprehensive vaccination services for children and adults to prevent infectious diseases</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="h-64 rounded-xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758202292826-c40e172eed1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMGhlYWx0aGNhcmUlMjB0ZWNobm9sb2d5JTIwZGlnaXRhbHxlbnwxfHx8fDE3NzI2OTI1Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="AI Healthcare Technology"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Diagnosis</h3>
              <p className="text-gray-700 mb-6">
                Our mobile health clinic leverages artificial intelligence to assist healthcare workers in providing accurate diagnoses. The AI chatbot provides instant health guidance and helps patients understand their conditions better.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Try AI Health Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Healthcare Services</h2>
            <p className="text-xl text-gray-600">All the medical services you need, delivered to your doorstep</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-green-600 hover:shadow-lg transition-all"
                >
                  <div className={`${service.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Services Work */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How Our Services Work</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Register</h3>
              <p className="text-gray-600">Create your account with your basic information</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Book Service</h3>
              <p className="text-gray-600">Choose the service you need and schedule an appointment</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Visit Clinic</h3>
              <p className="text-gray-600">Meet our health workers when we visit your area</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Get Care</h3>
              <p className="text-gray-600">Receive treatment and access your records anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Access Healthcare?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our mobile health clinic and get quality medical services in your community.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
          >
            Book an Appointment
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2026 Mobile Health Clinic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
