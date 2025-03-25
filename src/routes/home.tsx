import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isSignedIn) {
      navigate("/generate");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 p-6">
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 text-gray-600">Ace Every Interview with AI-Powered Precision</h1>
        <p className="text-lg text-gray-700 mb-6">
          Your AI mentor for interview success. Practice, get real-time feedback, and boost your confidence like never before.
        </p>
        <button 
          onClick={handleButtonClick} 
          className="px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-lg">
          {isSignedIn ? "Take an Interview" : "Get Started"}
        </button>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-md text-center border border-gray-300">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const features = [
  { title: "AI-Powered Mock Interviews", description: "Practice tailored interviews with intelligent AI feedback." },
  { title: "Real-Time Performance Insights", description: "Get instant feedback on answers, tone, and confidence." },
  { title: "Unlimited Practice Rounds", description: "Hone your skills with real-world interview scenarios." },
  { title: "Smart Coaching & Recommendations", description: "Receive AI-driven tips to improve your responses." },
  { title: "Personalized Experience", description: "Custom-tailored interview questions based on your job role." },
  { title: "Track Your Progress", description: "Monitor improvement and refine your answers over time." }
];

export default HomePage;