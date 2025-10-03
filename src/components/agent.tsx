import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { doc, getDoc } from "firebase/firestore";
import WebCam from "react-webcam";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader } from "lucide-react";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useVAPI } from "@/hooks/useVAPI";
import { FeedbackService } from "@/services/feedback.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoaderPage } from "@/routes/loader-page";

export const Agent = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const webcamRef = useRef<WebCam>(null);

  const {
    isCallActive,
    isMuted,
    isLoading: isVAPILoading,
    error: vapiError,
    transcript,
    startInterview,
    endInterview,
    toggleMute,
  } = useVAPI(interview);

  // Fetch interview data
  useEffect(() => {
    if (!interviewId) {
      navigate("/interview", { replace: true });
      return;
    }

    const fetchInterview = async () => {
      try {
        const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
        if (interviewDoc.exists()) {
          setInterview({
            id: interviewDoc.id,
            ...interviewDoc.data(),
          } as Interview);
        } else {
          toast.error("Interview not found");
          navigate("/interview", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview");
        navigate("/interview", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  // Handle starting the interview
  const handleStartInterview = useCallback(async () => {
    if (!interview || !userId) {
      toast.error("Missing interview data or user authentication");
      return;
    }

    try {
      // Create interview session in Firebase
      const newSessionId = await FeedbackService.createSession(
        interview.id,
        userId
      );
      setSessionId(newSessionId);
      console.log("✅ Interview session created in Firebase:", newSessionId);

      // Start VAPI call
      await startInterview();
      toast.success("Interview started successfully!");
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview");
    }
  }, [interview, userId, startInterview]);

  // Handle ending the interview
  const handleEndInterview = useCallback(async () => {
    if (!sessionId || !interview || !userId) {
      toast.error("Missing session data");
      return;
    }

    try {
      // Stop the VAPI call
      endInterview();
      
      // Update session in Firebase with transcript
      await FeedbackService.updateSession(sessionId, transcript, "completed");
      console.log("✅ Interview session updated in Firebase");

      // Generate AI feedback
      toast.info("Generating feedback...");
      const feedbackData = await FeedbackService.generateFeedback(
        transcript,
        interview.questions
      );

      // Save feedback to Firebase
      await FeedbackService.saveFeedback(
        interview.id,
        userId,
        sessionId,
        transcript,
        feedbackData.feedback,
        feedbackData.rating
      );
      console.log("✅ Feedback saved to Firebase");

      toast.success("Interview completed! Redirecting to feedback...");
      
      setTimeout(() => {
        navigate(`/interview/feedback/${interviewId}`);
      }, 1500);
    } catch (error) {
      console.error("Error ending interview:", error);
      toast.error("Error saving interview feedback");
      // Still navigate even if there's an error
      setTimeout(() => {
        navigate(`/interview/feedback/${interviewId}`);
      }, 2000);
    }
  }, [endInterview, sessionId, interview, userId, transcript, interviewId, navigate]);

  // Toggle webcam
  const toggleWebcam = useCallback(() => {
    setIsWebcamEnabled((prev) => !prev);
  }, []);

  if (isLoading) {
    return <LoaderPage className="w-full h-screen" />;
  }

  if (!interview) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      {/* Main interview container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{interview.position} Interview</h1>
              <p className="text-indigo-100 mt-1">{interview.company}</p>
            </div>
            {isCallActive && (
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Video container */}
        <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
          {isWebcamEnabled ? (
            <WebCam
              ref={webcamRef}
              audio={false}
              className="w-full h-full object-cover"
              mirrored
              onUserMediaError={(error) => {
                console.error("Webcam error:", error);
                toast.error("Could not access webcam");
                setIsWebcamEnabled(false);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <VideoOff size={64} />
              <p className="mt-4 text-sm">Camera is off</p>
            </div>
          )}

          {/* Status overlay */}
          {isVAPILoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-gray-700 font-medium">Connecting to interviewer...</p>
              </div>
            </div>
          )}

          {vapiError && (
            <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
              <p className="font-medium">Error: {vapiError}</p>
              <p className="text-sm mt-1">Please check your VAPI configuration</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-50 p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Mute button */}
            <Button
              onClick={toggleMute}
              disabled={!isCallActive}
              size="lg"
              variant={isMuted ? "destructive" : "default"}
              className={`rounded-full w-16 h-16 ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>

            {/* End call / Start call button */}
            {isCallActive ? (
              <Button
                onClick={handleEndInterview}
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff size={24} />
              </Button>
            ) : (
              <Button
                onClick={handleStartInterview}
                disabled={isVAPILoading}
                size="lg"
                className="rounded-full px-8 h-16 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isVAPILoading ? (
                  <Loader className="animate-spin" size={24} />
                ) : (
                  "Start Interview"
                )}
              </Button>
            )}

            {/* Camera toggle button */}
            <Button
              onClick={toggleWebcam}
              size="lg"
              variant="secondary"
              className="rounded-full w-16 h-16"
            >
              {isWebcamEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </Button>
          </div>

          {/* Status text */}
          <div className="text-center mt-4">
            {isCallActive ? (
              <p className="text-sm text-gray-600">
                Interview in progress • Speak clearly and take your time
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Click "Start Interview" when you're ready to begin
              </p>
            )}
          </div>
        </div>

        {/* Transcript panel (optional, can be hidden) */}
        {transcript && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 max-h-48 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Conversation</h3>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">{transcript}</div>
          </div>
        )}
      </div>

      {/* Instructions panel */}
      {!isCallActive && (
        <div className="mt-6 max-w-5xl w-full bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Before You Start</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">✓</span>
              <span>Ensure you're in a quiet environment with good lighting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">✓</span>
              <span>Check that your microphone is working properly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">✓</span>
              <span>The AI interviewer will ask you {interview.questions?.length || 0} questions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">✓</span>
              <span>Speak naturally and take your time with each answer</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
