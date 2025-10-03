import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  Video,
  VideoOff,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useVapi } from '@/hooks/useVapi';
import { InterviewContext } from '@/services/vapi.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { feedbackService } from '@/services/feedback.service';
import { useNavigate } from 'react-router-dom';

interface AgentProps {
  userName: string;
  userId?: string;
  profileImage?: string;
  type: "generate" | "interview";
  interviewContext?: InterviewContext;
  onInterviewComplete?: (transcript: string, messages: Array<{type: 'user' | 'assistant'; content: string; timestamp: Date}>) => void;
  onInterviewEnd?: () => void;
}



const Agent: React.FC<AgentProps> = ({
  userName,
  userId,

  interviewContext,
  onInterviewComplete,
  onInterviewEnd
}) => {
  console.log('🎬 Agent component rendering with props:', {
    userName,
    userId,
    interviewContext: !!interviewContext,
    interviewContextData: interviewContext
  });
  
  const navigate = useNavigate();
  
  // VAPI Hook
  const {
    isCallActive,
    isLoading,
    isListening,
    isSpeaking,
    error: vapiError,
    currentQuestion,
    progress,
    startCall,
    endCall,
    toggleMute,
    messages: vapiMessages,
    transcript,
    isVapiAvailable
  } = useVapi({
    onCallEnd: onInterviewEnd,
    onError: (error: string) => setError(error),
    onTranscript: (transcript: string) => console.log('Transcript updated:', transcript)
  });

  // Debug logging for VAPI hook values
  useEffect(() => {
    console.log('🔍 VAPI Hook Debug Info:');
    console.log('  isVapiAvailable:', isVapiAvailable);
    console.log('  isCallActive:', isCallActive);
    console.log('  isLoading:', isLoading);
    console.log('  vapiError:', vapiError);
    console.log('  startCall function:', typeof startCall);
  }, [isVapiAvailable, isCallActive, isLoading, vapiError, startCall]);

  // Component State
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Use messages from VAPI hook
  const messages = vapiMessages;
  
  // Refs
  const webcamRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize webcam
  useEffect(() => {
    if (isWebCamEnabled) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: false 
      })
      .then(stream => {
        streamRef.current = stream;
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Camera access failed:', err);
        setError('Failed to access camera');
        setIsWebCamEnabled(false);
      });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebCamEnabled]);

  // Handle errors
  useEffect(() => {
    if (vapiError) {
      setError(vapiError);
    }
  }, [vapiError]);

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(Date.now().toString());
  }, []);

  const handleStartInterview = async () => {
    console.log('🚀 handleStartInterview called');
    console.log('interviewContext:', interviewContext);
    console.log('isLoading:', isLoading);
    console.log('isCallActive:', isCallActive);
    console.log('isVapiAvailable:', isVapiAvailable);
    
    // Check VAPI availability first
    if (!isVapiAvailable) {
      const errorMsg = 'Voice AI service is not ready. Please wait and try again.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      toast.error('Service Not Ready', {
        description: errorMsg
      });
      return;
    }
    
    try {
      setError(null);
      if (interviewContext) {
        console.log('📞 Calling startCall with context...');
        await startCall(interviewContext);
        console.log('✅ startCall completed successfully');
        toast.success('Interview started successfully!');
      } else {
        console.error('❌ No interview context available');
        setError('No interview context available');
        toast.error('No Interview Context', {
          description: 'Interview data is missing. Please refresh and try again.'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Failed to start interview:', error);
      setError(`Failed to start interview: ${errorMessage}`);
      toast.error('Failed to Start Interview', {
        description: errorMessage
      });
    }
  };

  const handleEndInterview = async () => {
    try {
      await endCall();
      
      // Save interview session to Firestore
      if (userId && interviewContext && messages.length > 0) {
        try {
          await feedbackService.completeSession(
            sessionId,
            transcript || messages.map(m => `${m.type}: ${m.content}`).join('\n'),
            messages
          );
          
          toast.success('Interview completed and saved!');
        } catch (saveError) {
          console.error('Failed to save feedback:', saveError);
          toast.error('Interview completed but failed to save feedback');
        }
      }

      if (onInterviewComplete) {
        onInterviewComplete(
          messages.map(m => `${m.type}: ${m.content}`).join('\n'),
          messages
        );
      }
      
      if (onInterviewEnd) {
        onInterviewEnd();
      }
      
      toast.success('Interview ended successfully!');
    } catch (error) {
      console.error('Failed to end interview:', error);
      setError('Failed to end interview');
      toast.error('Failed to end interview');
    }
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      setError('Failed to toggle microphone');
    }
  };

  // Loading state
  if (!interviewContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  // VAPI not available state
  if (!isVapiAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">VAPI Service Initializing</h2>
          <p className="text-gray-600 mb-4">
            The voice AI service is starting up. This usually takes a few seconds.
          </p>
          {vapiError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{vapiError}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Google Meet Style Full-Screen Interface
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header Bar - Google Meet Style */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {isCallActive ? "Live Interview" : "AI Mock Interview"}
            </span>
          </div>
          {interviewContext && (
            <div className="text-sm text-gray-300">
              {interviewContext.position} at {interviewContext.company}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {progress.current > 0 && (
            <div className="text-sm text-gray-300">
              Question {progress.current} of {progress.total}
            </div>
          )}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            ← Exit
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Video Area */}
        <div className="w-full h-full bg-gray-900 relative">
          {isWebCamEnabled ? (
            <video
              ref={webcamRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <VideoOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">Camera Off</p>
                <p className="text-gray-500 text-sm mt-2">
                  Click the camera button to turn on your camera
                </p>
              </div>
            </div>
          )}

          {/* Current Question Overlay */}
          {isCallActive && currentQuestion && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 max-w-2xl">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">
                      Question {progress.current}
                    </Badge>
                    <p className="font-medium text-gray-900">
                      {currentQuestion}
                    </p>
                    {isListening && (
                      <div className="flex items-center justify-center gap-2 mt-2 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">Listening to your answer...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Speaking Indicator */}
          {isCallActive && isSpeaking && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                AI is speaking...
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls Bar - Google Meet Style */}
        <div className="absolute bottom-0 w-full bg-gray-800 p-4 flex items-center justify-center gap-4">
          {/* Start/End Call */}
          {!isCallActive ? (
            <div className="text-center">
              <Button
                onClick={() => {
                  console.log('🔘 Start Interview button clicked!');
                  console.log('Button state - isLoading:', isLoading, 'hasContext:', !!interviewContext, 'isVapiAvailable:', isVapiAvailable);
                  handleStartInterview();
                }}
                disabled={isLoading || !interviewContext || !isVapiAvailable}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                ) : (
                  <Phone className="h-6 w-6 mr-2" />
                )}
                Start Interview
              </Button>
              
              {/* Status information */}
              <div className="text-xs text-gray-300 mt-2">
                {!isVapiAvailable && <div>⏳ Initializing voice AI...</div>}
                {!interviewContext && <div>❌ No interview data</div>}
                {isLoading && <div>🔄 Loading...</div>}
                {isVapiAvailable && interviewContext && !isLoading && <div>✅ Ready to start</div>}
              </div>
            </div>
          ) : (
            <Button
              onClick={handleEndInterview}
              disabled={isLoading}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
            >
              <PhoneOff className="h-6 w-6 mr-2" />
              End Interview
            </Button>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Mute Toggle */}
            <Button
              onClick={handleToggleMute}
              disabled={!isCallActive}
              variant="ghost"
              size="lg"
              className={cn(
                "w-12 h-12 rounded-full",
                "bg-gray-600 text-white hover:bg-gray-700"
              )}
            >
              <Mic className="h-6 w-6" />
            </Button>

            {/* Camera Toggle */}
            <Button
              onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
              variant="ghost"
              size="lg"
              className={cn(
                "w-12 h-12 rounded-full",
                !isWebCamEnabled ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-600 text-white hover:bg-gray-700"
              )}
            >
              {isWebCamEnabled ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </Button>

            {/* More Options */}
            <Button
              onClick={() => setShowTranscript(!showTranscript)}
              variant="ghost"
              size="lg"
              className="w-12 h-12 rounded-full bg-gray-600 text-white hover:bg-gray-700"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Transcript Overlay */}
        {showTranscript && (
          <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-hidden z-20">
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Live Transcript</h3>
                <Button
                  onClick={() => setShowTranscript(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-3 overflow-y-auto max-h-80">
              {messages.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {messages.map((message, index) => (
                    <div key={index} className="space-y-1">
                      <div className="font-medium text-xs text-gray-500">
                        {message.type === 'user' ? userName : 'AI Interviewer'}
                      </div>
                      <div className={cn(
                        "p-2 rounded text-xs",
                        message.type === 'user' 
                          ? "bg-blue-50 text-blue-900" 
                          : "bg-gray-50 text-gray-900"
                      )}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Transcript will appear here during the interview
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agent;