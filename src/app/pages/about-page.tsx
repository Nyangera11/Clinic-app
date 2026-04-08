import { useNavigate } from "react-router";
import { Heart, MapPin, Users, Target, Award, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function AboutPage() {
  const navigate = useNavigate();

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
              <button onClick={() => navigate("/services")} className="text-gray-700 hover:text-green-600 font-medium">
                Services
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
            About Our Mission
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Bridging the healthcare gap in Turkana County through innovative mobile health solutions powered by AI and technology.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg">
                To provide accessible, affordable, and quality healthcare services to underserved communities in Turkana County through mobile health clinics powered by AI and modern technology.
              </p>
            </div>

            <div>
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700 text-lg">
                To become the leading mobile health service provider in Kenya, ensuring that every person in rural areas has access to timely and quality healthcare regardless of their location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Team Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Healthcare in Action</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758205307960-4a0ec7ad2c0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMGhlbHBpbmclMjBwYXRpZW50JTIwY2xpbmljfGVufDF8fHx8MTc3MjY5MjU2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Healthcare Worker Helping Patient"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758653500534-a47f6cd8abb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGhvc3BpdGFsJTIwcHJvZmVzc2lvbmFsc3xlbnwxfHx8fDE3NzI2MTc1MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Medical Team"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Long distances to healthcare facilities (average 50+ km in rural Turkana)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Limited medical personnel and resources</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Poor record-keeping and data loss</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Delayed diagnosis and lack of follow-up care</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span>Mobile clinics that travel to remote villages</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span>AI-powered diagnosis for early disease detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span>Secure digital health records (Kenya Data Protection Act compliant)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span>IoT devices for accurate vital signs monitoring</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-8 rounded-xl text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">5,000+</div>
              <p className="text-gray-700">Patients Served</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
              <p className="text-gray-700">Villages Reached</p>
            </div>

            <div className="bg-purple-50 p-8 rounded-xl text-center">
              <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">95%</div>
              <p className="text-gray-700">Patient Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Technology Stack</h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Built with modern technologies to ensure reliability, security, and efficiency
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">AI Diagnosis</h3>
              <p className="text-gray-600 text-sm">Machine learning models for disease prediction</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">IoT Integration</h3>
              <p className="text-gray-600 text-sm">Connected medical devices for real-time vitals</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Cloud Storage</h3>
              <p className="text-gray-600 text-sm">Secure, encrypted patient data management</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Offline Mode</h3>
              <p className="text-gray-600 text-sm">Works without internet, syncs when available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Us in Transforming Healthcare
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Together, we can make quality healthcare accessible to everyone.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2026 Mobile Health Clinic. All rights reserved. Compliant with Kenya Data Protection Act 2019.
          </p>
        </div>
      </footer>
    </div>
  );
}
