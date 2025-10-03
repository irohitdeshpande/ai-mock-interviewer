import { useEffect, useState, useCallback, useRef } from 'react';
import { vapiService, CallState, InterviewContext } from '@/services/vapi.service';
import { feedbackAnalyzer, RealTimeFeedback, ConversationAnalysis } from '@/services/feedback-analyzer.service';
import { toast } from 'sonner';

export interface UseVapiOptions {
  autoStart?: boolean;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
  onTranscript?: (transcript: string) => void;
}

export interface UseVapiReturn {
  // Call state
  callState: CallState;
  isCallActive: boolean;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  
  // Transcript and messages
  transcript: string;
  messages: CallState['messages'];
  
  // Call controls
  startCall: (context: InterviewContext) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  
  // Interview progress
  currentQuestion: string | null;
  progress: { current: number; total: number };
  
  // Feedback and analysis
  realTimeFeedback: RealTimeFeedback | null;
  isAnalyzing: boolean;
  generateFinalAnalysis: () => Promise<ConversationAnalysis>;
  
  // Utility
  isVapiAvailable: boolean;
  clearError: () => void;
}

/**
 * Custom hook for managing VAPI voice AI integration
 * 
 * This hook provides a React-friendly interface to the VAPI service,
 * handling state management, lifecycle events, and error handling.
 */
export function useVapi(options: UseVapiOptions = {}): UseVapiReturn {
  const { autoStart, onCallEnd, onError, onTranscript } = options;
  
  const [callState, setCallState] = useState<CallState>(vapiService.getCallState());
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [realTimeFeedback, setRealTimeFeedback] = useState<RealTimeFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const previousTranscript = useRef<string>('');
  const interviewContextRef = useRef<InterviewContext | null>(null);

  // Generate real-time feedback asynchronously
  const generateRealTimeFeedbackAsync = useCallback(async () => {
    if (!interviewContextRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const feedback = await feedbackAnalyzer.generateRealTimeFeedback();
      setRealTimeFeedback(feedback);
    } catch (error) {
      console.error('Error generating real-time feedback:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Subscribe to VAPI service state changes
  useEffect(() => {
    const unsubscribe = vapiService.subscribe((newState: CallState) => {
      setCallState(newState);
      
      // Update current question and progress
      setCurrentQuestion(vapiService.getCurrentQuestion());
      setProgress(vapiService.getInterviewProgress());
      
      // Handle new messages for feedback analysis
      if (newState.messages.length > callState.messages.length) {
        const newMessages = newState.messages.slice(callState.messages.length);
        newMessages.forEach(message => {
          feedbackAnalyzer.addMessage({
            ...message,
            questionIndex: vapiService.getInterviewProgress().current - 1
          });
        });
        
        // Generate real-time feedback for user messages
        if (newMessages.some(msg => msg.type === 'user')) {
          generateRealTimeFeedbackAsync();
        }
      }
      
      // Handle transcript changes
      if (newState.transcript !== previousTranscript.current) {
        onTranscript?.(newState.transcript);
        previousTranscript.current = newState.transcript;
      }
      
      // Handle call end
      if (!newState.isCallActive && previousTranscript.current && !newState.isLoading) {
        onCallEnd?.();
      }
      
      // Handle errors
      if (newState.error) {
        onError?.(newState.error);
        toast.error('Voice AI Error', {
          description: newState.error
        });
      }
    });
    
    unsubscribeRef.current = unsubscribe;
    
    return () => {
      unsubscribe();
    };
  }, [onCallEnd, onError, onTranscript, callState.messages, generateRealTimeFeedbackAsync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Start call function
  const startCall = useCallback(async (context: InterviewContext) => {
    try {
      interviewContextRef.current = context;
      feedbackAnalyzer.initialize(context);
      await vapiService.startCall(context);
      toast.success('Interview Started', {
        description: 'Voice AI interviewer is now active'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview';
      toast.error('Failed to Start Interview', {
        description: errorMessage
      });
      throw error;
    }
  }, []);

  // End call function
  const endCall = useCallback(async () => {
    try {
      await vapiService.endCall();
      toast.info('Interview Ended', {
        description: 'Voice AI interview session has ended'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end interview';
      toast.error('Failed to End Interview', {
        description: errorMessage
      });
      throw error;
    }
  }, []);

  // Toggle mute function
  const toggleMute = useCallback(async () => {
    try {
      await vapiService.toggleMute();
      toast.info(
        callState.isListening ? 'Microphone Muted' : 'Microphone Unmuted',
        {
          description: callState.isListening 
            ? 'Your microphone has been muted' 
            : 'Your microphone is now active'
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle mute';
      toast.error('Audio Control Error', {
        description: errorMessage
      });
      throw error;
    }
  }, [callState.isListening]);



  // Clear error function
  const clearError = useCallback(() => {
    // This would need to be implemented in the service
    // For now, we'll just show a toast
    toast.info('Error cleared');
  }, []);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && !callState.isCallActive && !callState.isLoading) {
      // Auto-start would need interview context
      console.log('Auto-start enabled but no context provided');
    }
  }, [autoStart, callState.isCallActive, callState.isLoading]);

  // Generate final analysis
  const generateFinalAnalysis = useCallback(async (): Promise<ConversationAnalysis> => {
    setIsAnalyzing(true);
    try {
      const analysis = await feedbackAnalyzer.generateFinalAnalysis();
      return analysis;
    } catch (error) {
      console.error('Error generating final analysis:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    // Call state
    callState,
    isCallActive: callState.isCallActive,
    isLoading: callState.isLoading,
    isListening: callState.isListening,
    isSpeaking: callState.isSpeaking,
    error: callState.error,
    
    // Transcript and messages
    transcript: callState.transcript,
    messages: callState.messages,
    
    // Call controls
    startCall,
    endCall,
    toggleMute,
    
    // Interview progress
    currentQuestion,
    progress,
    
    // Feedback and analysis
    realTimeFeedback,
    isAnalyzing,
    generateFinalAnalysis,
    
    // Utility
    isVapiAvailable: vapiService.isVapiAvailable(),
    clearError
  };
}