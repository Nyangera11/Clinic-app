import { useState } from "react";
import { X, Send, MessageCircle, Bot, Sparkles } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
}

export function AIChatAssistant({ 
  isOpen, 
  onClose, 
  initialMessages = [],
  onSendMessage 
}: AIChatAssistantProps) {
  const [chatMessages, setChatMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: "1",
            text: "Hello! I'm your AI Health Assistant. 🩺 I can help you with:\n\n• Booking appointments\n• Understanding your medical records\n• Finding clinic locations\n• Learning about our services\n• General health questions\n\nHow can I assist you today?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]
  );
  const [inputMessage, setInputMessage] = useState("");

  const generateBotResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("appointment") || lowerQuestion.includes("book")) {
      return "To book an appointment, please click on 'Appointments' in the menu. You can view our mobile clinic schedule and book a visit when we're in your area. Our clinics visit different villages weekly!";
    } else if (lowerQuestion.includes("record") || lowerQuestion.includes("history")) {
      return "You can access your medical records by clicking on 'Medical Records' in the menu. All your health history, test results, and prescriptions are stored securely and accessible 24/7.";
    } else if (lowerQuestion.includes("location") || lowerQuestion.includes("where")) {
      return "Our mobile clinic visits different villages in Turkana County on a rotating schedule. Check the 'Appointments' page to see when we'll be in your area next. We currently serve 50+ villages!";
    } else if (lowerQuestion.includes("service")) {
      return "We offer comprehensive healthcare services including:\n\n✓ General Checkups\n✓ Vaccinations\n✓ Laboratory Tests\n✓ Maternal & Child Care\n✓ Chronic Disease Management\n✓ HIV Testing\n✓ Malaria Treatment\n✓ TB Screening\n✓ Dental Care\n✓ Eye Examinations\n\nAll services are delivered by qualified health professionals!";
    } else if (lowerQuestion.includes("cost") || lowerQuestion.includes("price") || lowerQuestion.includes("pay")) {
      return "Our services are affordable and subsidized to ensure accessibility. Basic consultations start from as low as 200 KES. Many services are free for registered patients. Contact us for specific pricing.";
    } else if (lowerQuestion.includes("emergency") || lowerQuestion.includes("urgent")) {
      return "⚠️ For medical emergencies, please call our 24/7 emergency hotline: +254 700 000 000 or visit the nearest health facility immediately. This chat is for general inquiries only.";
    } else if (lowerQuestion.includes("hello") || lowerQuestion.includes("hi") || lowerQuestion.includes("hey")) {
      return "Hello! 👋 I'm here to help you with any questions about our mobile health clinic. What would you like to know?";
    } else {
      return "I'm here to help! You can ask me about:\n\n📅 Booking appointments\n📋 Medical records\n🏥 Our services\n📍 Clinic locations\n💰 Service costs\n\nWhat would you like to know?";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");

    if (onSendMessage) {
      onSendMessage(currentMessage);
    }

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(currentMessage),
        sender: "bot",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-green-600 z-50 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full animate-pulse">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold flex items-center gap-2">
              AI Health Assistant
              <Sparkles className="w-4 h-4" />
            </h3>
            <p className="text-xs text-green-100">Online • Ready to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 border-b border-gray-200">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          Ask me anything about your health and our services!
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                  : "bg-white text-gray-800 shadow-md border border-gray-200"
              } p-3 rounded-2xl ${
                message.sender === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
              }`}
            >
              {message.sender === "bot" && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">AI Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-2 ${
                  message.sender === "user" ? "text-green-100" : "text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Suggestions */}
      <div className="px-4 py-2 bg-white border-t border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setInputMessage("How do I book an appointment?");
              setTimeout(() => handleSendMessage(), 100);
            }}
            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-green-200 transition-colors"
          >
            📅 Book Appointment
          </button>
          <button
            onClick={() => {
              setInputMessage("What services do you offer?");
              setTimeout(() => handleSendMessage(), 100);
            }}
            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-blue-200 transition-colors"
          >
            🏥 Our Services
          </button>
          <button
            onClick={() => {
              setInputMessage("Where is the clinic located?");
              setTimeout(() => handleSendMessage(), 100);
            }}
            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-purple-200 transition-colors"
          >
            📍 Location
          </button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
