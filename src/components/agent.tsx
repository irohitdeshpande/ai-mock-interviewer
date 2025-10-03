import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  PhoneOff, 
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX,
  User,
  Bot,
  X
} from 'lucide-react';
import { useVapi } from '@/hooks/useVapi';
import { InterviewContext } from '@/services/vapi.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { feedbackService } from '@/services/feedback.service';


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
  
  // VAPI Hook
  const {
    isCallActive,
    isLoading,
    isListening,
    isSpeaking,
    error: vapiError,
    currentQuestion,
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

  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  
  // Use messages from VAPI hook
  const messages = vapiMessages;
  
  // Refs
  const webcamRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize webcam
  useEffect(() => {
    const initializeCamera = async () => {
      if (isWebCamEnabled) {
        try {
          console.log('🎥 Requesting camera access...');
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              facingMode: 'user'
            }, 
            audio: false 
          });
          
          console.log('✅ Camera access granted');
          streamRef.current = stream;
          
          if (webcamRef.current) {
            webcamRef.current.srcObject = stream;
            // Ensure video plays
            webcamRef.current.play().catch(console.error);
          }
        } catch (err) {
          console.error('❌ Camera access failed:', err);
          const errorMsg = err instanceof Error ? err.message : 'Failed to access camera';
          console.error('Camera error details:', errorMsg);
          setIsWebCamEnabled(false);
        }
      } else {
        // Clean up when camera is disabled
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    };

    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebCamEnabled]);

  // Periodically save interview progress
  useEffect(() => {
    if (sessionId && messages.length > 0 && (isCallActive || isInterviewActive)) {
      const saveProgress = async () => {
        try {
          await feedbackService.updateInterviewSession(
            sessionId,
            transcript || messages.map(m => `${m.type}: ${m.content}`).join('\n'),
            messages.map(m => ({
              type: m.type,
              content: m.content,
              timestamp: m.timestamp
            }))
          );
          console.log('📊 Interview progress saved');
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      };

      // Save progress every 30 seconds
      const interval = setInterval(saveProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [sessionId, messages, transcript, isCallActive, isInterviewActive]);

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

  // Update current question text when currentQuestion changes
  useEffect(() => {
    if (currentQuestion) {
      setCurrentQuestionText(currentQuestion);
    }
  }, [currentQuestion]);

  // Text-to-Speech for questions
  const handlePlayQuestion = (questionText: string) => {
    if (isPlayingQuestion && currentSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingQuestion(false);
      setCurrentSpeech(null);
    } else {
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(questionText);
        speech.rate = 0.9;
        speech.pitch = 1;
        speech.volume = 0.8;
        
        window.speechSynthesis.speak(speech);
        setIsPlayingQuestion(true);
        setCurrentSpeech(speech);

        speech.onend = () => {
          setIsPlayingQuestion(false);
          setCurrentSpeech(null);
        };
      }
    }
  };

  const handleStartInterview = async () => {
    console.log('🚀 handleStartInterview called');
    console.log('interviewContext:', interviewContext);
    console.log('isVapiAvailable:', isVapiAvailable);
    
    try {
      setError(null);
      
      if (!interviewContext) {
        console.error('❌ No interview context available');
        setError('No interview context available');
        toast.error('No Interview Context', {
          description: 'Interview data is missing. Please refresh and try again.'
        });
        return;
      }

      // Start interview session in Firebase
      if (userId) {
        try {
          const newSessionId = await feedbackService.startInterviewSession(
            interviewContext.interviewId,
            userId
          );
          setSessionId(newSessionId);
          console.log('✅ Interview session started in Firebase:', newSessionId);
        } catch (firebaseError) {
          console.error('❌ Failed to start Firebase session:', firebaseError);
          // Continue with interview even if Firebase fails
        }
      }

      // Try VAPI first
      if (isVapiAvailable) {
        console.log('📞 Attempting to start VAPI call with working assistant...');
        console.log('💼 Interview data from Firebase:');
        console.log('   - Position:', interviewContext.position);
        console.log('   - Company:', interviewContext.company);
        console.log('   - Tech Stack:', interviewContext.techStack);
        console.log('   - Questions:', interviewContext.questions?.length || 0);
        
        try {
          await startCall(interviewContext);
          console.log('✅ VAPI call started successfully with dashboard assistant');
          toast.success('AI Interview Started!', {
            description: 'Your professional interviewer is ready. Speak naturally.'
          });
          return;
        } catch (vapiError) {
          console.error('❌ VAPI call failed:', vapiError);
          console.log('🔄 Falling back to manual mode...');
          setFallbackMode(true);
        }
      } else {
        console.log('🔄 VAPI not available, using fallback mode...');
        setFallbackMode(true);
      }
      
      // Fallback mode - manual interview without VAPI
      setIsInterviewActive(true);
      setCurrentQuestionText(interviewContext.questions[0]?.question || 'Welcome to your mock interview!');
      
      toast.success('Manual Interview Started', {
        description: 'Voice AI unavailable. Use text chat or speak questions aloud.'
      });
      
      // Auto-speak the first question
      if (interviewContext.questions[0]?.question) {
        handlePlayQuestion(interviewContext.questions[0].question);
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
      console.log('🏁 Ending interview...');
      
      // End VAPI call if active
      if (isCallActive) {
        console.log('📞 Ending VAPI call...');
        await endCall();
      }
      
      // End manual interview if active
      if (isInterviewActive) {
        console.log('📝 Ending manual interview...');
        setIsInterviewActive(false);
        setFallbackMode(false);
      }
      
      // Save interview session and generate feedback in Firebase
      if (userId && interviewContext && sessionId && messages.length > 0) {
        try {
          console.log('💾 Saving interview feedback to Firebase...');
          console.log('Session ID:', sessionId);
          console.log('Messages count:', messages.length);
          console.log('Transcript length:', transcript?.length || 0);
          
          const interviewFeedbackContext = {
            interviewId: interviewContext.interviewId,
            userId: userId,
            questions: interviewContext.questions || []
          };
          
          const feedbackId = await feedbackService.completeInterviewSession(
            sessionId,
            transcript || messages.map(m => `${m.type}: ${m.content}`).join('\n'),
            messages.map(m => ({
              type: m.type,
              content: m.content,
              timestamp: m.timestamp
            })),
            interviewFeedbackContext
          );
          
          console.log('✅ Interview feedback saved:', feedbackId);
          toast.success('Interview Completed!', {
            description: 'Your feedback has been generated and saved.'
          });
        } catch (saveError) {
          console.error('❌ Failed to save feedback:', saveError);
          toast.error('Interview completed but failed to save feedback');
        }
      } else {
        console.log('⚠️ Skipping feedback save - missing required data');
        console.log('userId:', !!userId);
        console.log('interviewContext:', !!interviewContext);
        console.log('sessionId:', sessionId);
        console.log('messages:', messages.length);
      }

      // Call parent completion handler
      if (onInterviewComplete) {
        console.log('📤 Calling parent completion handler...');
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Failed to end interview:', error);
      setError(`Failed to end interview: ${errorMessage}`);
      toast.error('Failed to End Interview', {
        description: errorMessage
      });
    }
  };

  const handleToggleMute = async () => {
    try {
      if (isCallActive) {
        // VAPI mode - use the real toggle
        await toggleMute();
      } else if (isInterviewActive) {
        // Manual mode - just show visual feedback
        toast.info('Microphone toggled', {
          description: 'In manual mode, use the chat to communicate'
        });
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      setError('Failed to toggle microphone');
    }
  };

  // Loading state
  if (!interviewContext) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  // VAPI not available state
  if (!isVapiAvailable) {
    const isConfigMissing = vapiError?.includes('configuration missing') || vapiError?.includes('SDK not available');
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg text-center max-w-lg mx-auto">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">
            {isConfigMissing ? 'VAPI Configuration Required' : 'Voice AI Initializing'}
          </h2>
          <p className="text-gray-300 mb-4">
            {isConfigMissing ? (
              <>
                To enable voice AI interviews, you need to configure VAPI credentials. 
                Please add your VAPI keys to the <code className="bg-gray-700 px-2 py-1 rounded">.env</code> file:
                <br /><br />
                <code className="bg-gray-700 px-3 py-2 rounded block text-left text-sm">
                  VITE_VAPI_PUBLIC_KEY=your_key_here<br />
                  VITE_VAPI_ASSISTANT_ID=your_assistant_id
                </code>
              </>
            ) : (
              'The voice AI service is starting up. This usually takes a few seconds.'
            )}
          </p>
          {vapiError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{vapiError}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 justify-center mt-6">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Refresh Page
            </Button>
            {isConfigMissing && (
              <Button 
                onClick={() => window.open('https://vapi.ai', '_blank')} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get VAPI Keys
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-gray-900 overflow-hidden">
      {/* Main Video Grid Area */}
      <div className="absolute inset-0 flex flex-col">
        {/* Video Grid Container */}
        <div className="flex-1 relative p-4">
          {/* Primary Video Grid */}
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
            
            {/* User Video Tile */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
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
                  <div className="text-center text-white">
                    <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Camera Off</p>
                  </div>
                </div>
              )}
              
              {/* User Name Overlay */}
              <div className="absolute bottom-3 left-3">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-md">
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {userName || 'You'}
                  </p>
                </div>
              </div>

              {/* Speaking/Listening Indicator */}
              {isCallActive && (
                <div className="absolute top-3 left-3">
                  {isSpeaking ? (
                    <div className="bg-green-500 px-2 py-1 rounded-md">
                      <p className="text-white text-xs font-medium">Speaking</p>
                    </div>
                  ) : isListening ? (
                    <div className="bg-red-500 px-2 py-1 rounded-md animate-pulse">
                      <p className="text-white text-xs font-medium flex items-center gap-1">
                        <Mic className="h-3 w-3" />
                        Listening
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Mic/Camera Status Icons */}
              <div className="absolute top-3 right-3 flex gap-2">
                {!isListening && isCallActive && (
                  <div className="bg-red-500 p-1.5 rounded-full">
                    <MicOff className="h-3 w-3 text-white" />
                  </div>
                )}
                {!isWebCamEnabled && (
                  <div className="bg-red-500 p-1.5 rounded-full">
                    <VideoOff className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* AI Interviewer Video Tile */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bot className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-medium">AI Interviewer</p>
                  <p className="text-sm opacity-75">Ready to interview</p>
                </div>
              </div>
              
              {/* AI Name Overlay */}
              <div className="absolute bottom-3 left-3">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-md">
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <Bot className="h-3 w-3" />
                    AI Interviewer
                  </p>
                </div>
              </div>

              {/* AI Speaking Indicator */}
              {isCallActive && isSpeaking && (
                <div className="absolute top-3 left-3">
                  <div className="bg-green-500 px-2 py-1 rounded-md">
                    <p className="text-white text-xs font-medium">Speaking</p>
                  </div>
                </div>
              )}
            </div>

            {/* Placeholder Participants (if needed for design) */}
            <div className="relative bg-gray-700/50 rounded-lg overflow-hidden shadow-lg border-2 border-dashed border-gray-600">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Waiting for participant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Interview Start Screen */}
          {!isCallActive && !isInterviewActive && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white max-w-md mx-auto p-8">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Ready to Start Interview?</h2>
                <p className="text-gray-300 mb-6">
                  Click the button below to begin your AI-powered mock interview session.
                </p>
                
                {/* Interview Info */}
                {interviewContext && (
                  <div className="bg-black/40 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Interview Details</span>
                    </div>
                    <p className="text-sm text-gray-300">Position: {interviewContext.position}</p>
                    <p className="text-sm text-gray-300">Company: {interviewContext.company}</p>
                    <p className="text-sm text-gray-300">Questions: {interviewContext.questions.length}</p>
                  </div>
                )}

                <Button
                  onClick={handleStartInterview}
                  disabled={isLoading || !interviewContext || !isVapiAvailable}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Phone className="h-5 w-5 mr-2" />
                  )}
                  Start Interview
                </Button>

                {/* Status Messages */}
                <div className="mt-4 text-sm">
                  {!isVapiAvailable && <div className="text-amber-400">⏳ Initializing voice AI...</div>}
                  {!interviewContext && <div className="text-red-400">❌ No interview data</div>}
                  {isLoading && <div className="text-blue-400">🔄 Loading...</div>}
                  {isVapiAvailable && interviewContext && !isLoading && <div className="text-green-400">✅ Ready to start</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
          <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4">
            
            {/* Left Side - Meeting Info */}
            <div className="flex items-center gap-4">
              <div className="text-white">
                <p className="text-sm font-medium">AI Mock Interview</p>
                {fallbackMode && (
                  <p className="text-xs text-yellow-300">Manual Mode - VAPI Unavailable</p>
                )}
              </div>
              {(isCallActive || isInterviewActive) && (
                <Badge variant="default" className={isCallActive ? "bg-green-600" : "bg-blue-600"}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                  {isCallActive ? 'Live AI' : 'Manual'}
                </Badge>
              )}
            </div>

            {/* Center - Control Buttons */}
            {(isCallActive || isInterviewActive) && (
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  onClick={handleToggleMute}
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "w-12 h-12 rounded-full border-2",
                    isListening 
                      ? "bg-red-500 border-red-500 text-white hover:bg-red-600" 
                      : "bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                  )}
                >
                  {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                
                <Button
                  onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "w-12 h-12 rounded-full border-2",
                    isWebCamEnabled 
                      ? "bg-gray-600 border-gray-500 text-white hover:bg-gray-500" 
                      : "bg-red-500 border-red-500 text-white hover:bg-red-600"
                  )}
                >
                  {isWebCamEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                
                <Button
                  onClick={handleEndInterview}
                  disabled={isLoading}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-6 py-3 rounded-full"
                >
                  <PhoneOff className="h-5 w-5 md:mr-2" />
                  <span className="hidden md:inline">End Interview</span>
                </Button>
              </div>
            )}

            {/* Right Side - Additional Controls */}
            <div className="flex items-center gap-2">
              {currentQuestionText && (
                <Button
                  onClick={() => handlePlayQuestion(currentQuestionText)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700"
                >
                  {isPlayingQuestion ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-700"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel for Chat/Questions */}
        {showSidebar && (
          <div className="absolute top-0 right-0 w-full sm:w-80 h-full bg-gray-800 border-l border-gray-700 shadow-xl z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-medium">Interview Chat</h3>
              <Button
                onClick={() => setShowSidebar(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 h-full overflow-y-auto">
              {/* Current Question Display */}
              {currentQuestionText && (
                <div className="mb-4 p-3 bg-blue-900/50 rounded-lg">
                  <p className="text-xs text-blue-300 mb-1">Current Question</p>
                  <p className="text-white text-sm">{currentQuestionText}</p>
                </div>
              )}

              {/* Conversation Messages */}
              <div className="space-y-3">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2 p-3 rounded-lg text-sm",
                        message.type === 'user' 
                          ? "bg-blue-900/30 ml-4" 
                          : "bg-gray-700/50 mr-4"
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Bot className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">
                          {message.type === 'user' ? userName : 'AI Interviewer'}
                        </div>
                        <div className="text-white">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400 text-sm">
                      Conversation will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Agent;