import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Video,
  VideoOff,
  MessageSquare,
  Loader2,
  Users,
  Clock,
  AlertCircle,
  Bot,
  User
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

// Native Video Component
const VideoFeed: React.FC<{ 
  isEnabled: boolean; 
  onError: (error: string) => void; 
  className?: string;
}> = ({ isEnabled, onError, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    const startVideo = async () => {
      if (!isEnabled) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: false 
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Failed to access camera:', error);
        onError('Failed to access camera. Please check permissions.');
      }
    };

    startVideo();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isEnabled, onError, stream]);

  if (!isEnabled) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-900 text-white", className)}>
        <div className="text-center">
          <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Camera is off</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={cn("w-full h-full object-cover", className)}
    />
  );
};

// Avatar Component
const Avatar: React.FC<{ 
  src?: string; 
  name: string; 
  isAI?: boolean; 
  isActive?: boolean;
  className?: string;
}> = ({ src, name, isAI = false, isActive = false, className }) => {
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold text-xl",
        isAI ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gradient-to-r from-green-500 to-teal-600",
        isActive && "ring-4 ring-green-400 animate-pulse"
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : isAI ? (
          <Bot className="h-10 w-10" />
        ) : (
          <User className="h-10 w-10" />
        )}
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <span className="text-xs text-center block w-20 truncate">{name}</span>
      </div>
      {isActive && (
        <div className="absolute -top-1 -right-1">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default function Agent({ 
  userName, 
  userId = 'user-123', 
  profileImage, 
  type,
  interviewContext,
  onInterviewComplete, 
  onInterviewEnd 
}: AgentProps) {
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const {
    isCallActive,
    isLoading,
    isListening,
    error,
    transcript,
    messages,
    startCall,
    endCall,
    toggleMute,
    currentQuestion,
    progress,
    isVapiAvailable,
  } = useVapi({
    onCallEnd: () => {
      onInterviewComplete?.(transcript, messages);
      onInterviewEnd?.();
    },
    onError: (errorMsg) => {
      console.error('VAPI Error:', errorMsg);
      toast.error(`VAPI Error: ${errorMsg}`);
    }
  });

  // Timer for interview duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  const handleStartInterview = async () => {
    if (!interviewContext) {
      toast.error('Interview context is required');
      return;
    }

    try {
      await startCall(interviewContext);
      toast.success('Interview started successfully!');
    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.error('Failed to start interview. Please try again.');
    }
  };

  const handleEndInterview = async () => {
    try {
      await endCall();
      toast.success('Interview ended successfully!');
    } catch (error) {
      console.error('Failed to end interview:', error);
      toast.error('Failed to end interview properly.');
    }
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute();
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  if (!isVapiAvailable) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Voice AI Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              VAPI SDK is not configured or available. Please install @vapi-ai/web and configure your API keys to enable voice AI interviews.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
          {isCallActive && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          )}
          {progress.total > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span>Question {progress.current} of {progress.total}</span>
              <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Video Area - Full Screen Google Meet Style */}
      <div className="flex-1 relative bg-gray-900">
        {/* Main Video Feed */}
        <VideoFeed
          isEnabled={isWebCamEnabled}
          onError={(error) => toast.error(error)}
          className="w-full h-full"
        />
        
        {/* AI Interviewer Avatar - Bottom Right */}
        <div className="absolute bottom-20 right-4">
          <div className="relative">
            <Avatar
              name="AI Interviewer"
              isAI={true}
              isActive={isCallActive}
              className="w-32 h-32 border-4 border-gray-600"
            />
            {isCallActive && (
              <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-gray-900"></div>
              </div>
            )}
          </div>
        </div>

        {/* User Info - Bottom Left */}
        <div className="absolute bottom-20 left-4">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {userName}
          </div>
        </div>
        
        {/* Status Indicators - Top Left */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isCallActive && (
            <Badge className="bg-red-500 animate-pulse border-0">
              LIVE
            </Badge>
          )}
          {isListening && (
            <Badge className="bg-green-500 animate-pulse border-0">
              LISTENING
            </Badge>
          )}
        </div>

        {/* Current Question Display - Top Center */}
        {currentQuestion && isCallActive && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 max-w-2xl">
            <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm text-center">
              <div className="font-medium mb-1">Current Question:</div>
              <div className="text-gray-200">{currentQuestion}</div>
            </div>
          </div>
        )}

        {/* Volume Indicator - Bottom Center */}
        {isCallActive && isListening && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1 bg-black bg-opacity-50 px-3 py-2 rounded-full">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-green-400 rounded-full transition-all duration-150",
                    `h-${Math.floor(Math.random() * 6) + 2}`
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar - Google Meet Style */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        {/* Start/End Call */}
        {!isCallActive ? (
          <Button
            onClick={handleStartInterview}
            disabled={isLoading || !interviewContext}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
            ) : (
              <Phone className="h-6 w-6 mr-2" />
            )}
            Start Interview
          </Button>
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
              isMuted ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-600 text-white hover:bg-gray-700"
            )}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
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
        <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-hidden">
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
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                {/* Start/End Call */}
                {!isCallActive ? (
                  <Button
                    onClick={handleStartInterview}
                    disabled={isLoading || !interviewContext}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Phone className="h-5 w-5 mr-2" />
                    )}
                    Start Interview
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndInterview}
                    disabled={isLoading}
                    size="lg"
                    variant="destructive"
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End Interview
                  </Button>
                )}

                {/* Mute Toggle */}
                <Button
                  onClick={handleToggleMute}
                  disabled={!isCallActive}
                  variant="outline"
                  size="lg"
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>

                {/* Camera Toggle */}
                <Button
                  onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
                  variant="outline"
                  size="lg"
                >
                  {isWebCamEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>

                {/* Speaker Toggle */}
                <Button
                  variant="outline"
                  size="lg"
                  disabled={!isCallActive}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>

                {/* Transcript Toggle */}
                <Button
                  onClick={() => setShowTranscript(!showTranscript)}
                  variant="outline"
                  size="lg"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview Progress and Info */}
        <div className="space-y-4">
          {/* Progress */}
          {interviewContext && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={progressPercentage} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Question {progress.current} of {progress.total}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Question */}
          {currentQuestion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{currentQuestion}</p>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Live Transcript */}
          {showTranscript && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Live Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-2 rounded",
                          message.type === 'user' 
                            ? "bg-blue-50 text-blue-900" 
                            : "bg-gray-50 text-gray-900"
                        )}
                      >
                        <div className="font-medium text-xs mb-1">
                          {message.type === 'user' ? userName : 'AI Interviewer'}
                        </div>
                        <div>{message.content}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      Transcript will appear here during the interview
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}