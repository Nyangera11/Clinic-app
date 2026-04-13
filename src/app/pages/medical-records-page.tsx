import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, ChevronLeft, Heart, Download, Eye } from "lucide-react";
import { apiCall } from "../utils/api";

export function MedicalRecordsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "patient") {
      navigate("/patient-dashboard");
      return;
    }
    setCurrentUser(parsed);
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      loadMedicalRecords();
    }
  }, [currentUser]);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      // Get patient's user ID by email from users endpoint
      const userResponse = await apiCall(`/api/users?email=${currentUser.email}`);
      if (!userResponse.ok) {
        console.error("Failed to fetch user");
        setLoading(false);
        return;
      }

      const users = await userResponse.json();
      let userId = currentUser.id;
      
      if (Array.isArray(users) && users.length > 0) {
        userId = users[0].id;
      }

      // Get medical records
      const recordsResponse = await apiCall(`/api/records/${userId}`);
      if (recordsResponse.ok) {
        const records = await recordsResponse.json();
        setMedicalRecords(records || []);
      }
    } catch (error) {
      console.error("Error loading medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!currentUser) return null;

  const displayRecords = medicalRecords.length > 0 ? medicalRecords : [
    {
      id: 1,
      date: "February 28, 2026",
      service: "Vaccination",
      provider: "Dr. Mary Wanjiru",
      diagnosis: "Routine Immunization - COVID-19 Booster",
      treatment: "Administered COVID-19 booster vaccine",
      vitals: {
        bloodPressure: "120/80 mmHg",
        temperature: "36.5°C",
        weight: "68 kg",
      },
      notes: "Patient tolerated vaccine well. Advised to monitor for any adverse reactions.",
    },
  ];

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
              <FileText className="w-6 h-6 text-green-600" />
              <span className="font-bold text-xl">Medical Records</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Your Medical Records</h1>
          <p className="text-green-100">
            Secure access to your complete health history. All records are encrypted and compliant with Kenya Data Protection Act 2019.
          </p>
        </div>

        {/* Records List */}
        {!selectedRecord ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Record History</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading medical records...</p>
              </div>
            ) : displayRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No medical records yet</p>
                <p className="text-gray-500 text-sm mt-2">Your medical records from attended appointments will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-green-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{record.diagnosis}</h3>
                        <p className="text-sm text-gray-600 mt-1">{formatDate(record.createdAt || record.date)}</p>
                      </div>
                      <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                        <Eye className="w-5 h-5" />
                        View Details
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Treatment:</span> {record.treatment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Detailed Record View */
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Records</span>
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <div className="border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRecord.service}</h2>
                <p className="text-gray-600">Date: {selectedRecord.date}</p>
                <p className="text-gray-600">Provider: {selectedRecord.provider}</p>
              </div>

              {/* Vitals */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Vital Signs</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(selectedRecord.vitals).map(([key, value]) => (
                    <div key={key} className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-lg font-bold text-gray-900">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Results */}
              {selectedRecord.labResults && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Laboratory Results</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(selectedRecord.labResults).map(([key, value]) => (
                      <div key={key} className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-lg font-bold text-gray-900">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Diagnosis</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedRecord.diagnosis}</p>
                </div>
              </div>

              {/* Treatment */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Treatment Provided</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedRecord.treatment}</p>
                </div>
              </div>

              {/* Prescription */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Prescription</h3>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedRecord.prescription}</p>
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Clinical Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedRecord.notes}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
