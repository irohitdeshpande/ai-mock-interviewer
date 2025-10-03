import { useState, useEffect, useCallback } from "react";
import { getVAPIService } from "@/services/vapi.service";
import { Interview } from "@/types";
import { toast } from "sonner";

export interface VAPIState {
  isCallActive: boolean;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  transcript: string;
}

export const useVAPI = (interview: Interview | null) => {
  const [state, setState] = useState<VAPIState>({
    isCallActive: false,
    isMuted: false,
    isLoading: false,
    error: null,
    transcript: "",
  });

  const [vapiService] = useState(() => getVAPIService());

  useEffect(() => {
    if (!vapiService) {
      setState((prev) => ({
        ...prev,
        error: "VAPI service not initialized. Please check your environment variables.",
      }));
      return;
    }

    const vapi = vapiService.getVapi();

    // Call started
    const handleCallStart = () => {
      console.log("✅ VAPI call started");
      setState((prev) => ({ ...prev, isCallActive: true, isLoading: false, error: null }));
      toast.success("Interview started - Voice AI interviewer is now active");
    };

    // Call ended
    const handleCallEnd = () => {
      console.log("✅ VAPI call ended");
      setState((prev) => ({ ...prev, isCallActive: false, isLoading: false }));
    };

    // Speech started (assistant or user)
    const handleSpeechStart = () => {
      console.log("🎤 Speech started");
    };

    // Speech ended
    const handleSpeechEnd = () => {
      console.log("🔇 Speech ended");
    };

    // Volume level (for visual feedback)
    const handleVolumeLevel = () => {
      // This can be used to show visual feedback like audio bars
      // console.log("🔊 Volume level:", volume);
    };

    // Message received (transcription)
    const handleMessage = (message: unknown) => {
      console.log("📝 Message received:", message);
      
      if (message && typeof message === 'object' && 'type' in message && message.type === "transcript" && 'transcriptType' in message && message.transcriptType === "final") {
        const text = ('transcript' in message && typeof message.transcript === 'string') ? message.transcript : "";
        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + "\n" + text,
        }));
      }
    };

    // Error handling
    const handleError = (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "An error occurred with the voice AI";
      console.error("❌ VAPI Error:", error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isCallActive: false,
      }));
      toast.error("Voice AI Error - " + errorMessage);
    };

    // Register event listeners
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("volume-level", handleVolumeLevel);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    // Cleanup
    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("volume-level", handleVolumeLevel);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, [vapiService]);

  const startInterview = useCallback(async () => {
    if (!vapiService || !interview) {
      toast.error("Cannot start interview - missing configuration");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log("🚀 Starting VAPI interview...");
      await vapiService.startCall(interview);
      console.log("✅ Interview call initiated");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start interview";
      console.error("Failed to start interview:", error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      toast.error("Failed to start interview: " + errorMessage);
    }
  }, [vapiService, interview]);

  const endInterview = useCallback(() => {
    if (!vapiService) return;

    try {
      console.log("🛑 Ending VAPI interview...");
      vapiService.stop();
      setState((prev) => ({ ...prev, isCallActive: false, isLoading: false }));
      toast.success("Interview ended");
    } catch (error: unknown) {
      console.error("Error ending interview:", error);
      toast.error("Error ending interview");
    }
  }, [vapiService]);

  const toggleMute = useCallback(() => {
    if (!vapiService) return;

    try {
      const newMuteState = !state.isMuted;
      vapiService.setMuted(newMuteState);
      setState((prev) => ({ ...prev, isMuted: newMuteState }));
      toast.info(newMuteState ? "Microphone muted" : "Microphone unmuted");
    } catch (error: unknown) {
      console.error("Error toggling mute:", error);
      toast.error("Error toggling mute");
    }
  }, [vapiService, state.isMuted]);

  return {
    ...state,
    startInterview,
    endInterview,
    toggleMute,
  };
};
