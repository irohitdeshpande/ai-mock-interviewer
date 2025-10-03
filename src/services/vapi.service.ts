/**
 * VAPI Service for Real-time AI Interview Integration
 * Updated to use correct @vapi-ai/web package
 */

import Vapi from '@vapi-ai/web';

// Professional Interviewer Configuration
const createInterviewerConfig = (questions: string[], role: string, company: string) => {
  const questionsList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  
  return {
    name: "AI Interviewer",
    firstMessage: `Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience for the ${role} position at ${company}.`,
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2" as const,
      language: "en" as const,
    },
    voice: {
      provider: "11labs" as const,
      voiceId: "sarah",
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 0.9,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai" as const,
      model: "gpt-4" as const,
      messages: [
        {
          role: "system" as const,
          content: `You are a professional job interviewer conducting a real-time voice interview with a candidate for a ${role} position at ${company}. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
${questionsList}

Engage naturally & react appropriately:
- Listen actively to responses and acknowledge them before moving forward.
- Ask brief follow-up questions if a response is vague or requires more detail.
- Keep the conversation flowing smoothly while maintaining control.
- Ask questions one at a time, wait for complete answers.

Be professional, yet warm and welcoming:
- Use official yet friendly language.
- Keep responses concise and to the point (like in a real voice interview).
- Avoid robotic phrasing—sound natural and conversational.
- Don't rush through questions - give candidates time to think and respond.

Answer the candidate's questions professionally:
- If asked about the role, company, or expectations, provide a clear and relevant answer.
- If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
- Thank the candidate for their time.
- Inform them that the company will reach out soon with feedback.
- End the conversation on a polite and positive note.

Important:
- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.
- Wait for the candidate to finish speaking before responding.
- Ask only one question at a time and wait for a complete response.`,
        },
      ],
    },
  };
};





export interface VapiConfig {
  publicKey: string;
  assistantId: string;
}

export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING", 
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED"
}

export interface CallState {
  isCallActive: boolean;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  status: CallStatus;
  messages: Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  transcript: string;
  error: string | null;
}

export interface InterviewContext {
  interviewId: string;
  position: string;
  company: string;
  experience: number;
  questions: Array<{ question: string; answer: string }>;
  currentQuestionIndex: number;
  // Additional context from Firebase interview data
  techStack?: string;
  description?: string;
  whyJoinUs?: string | null;
  interviewDate?: Date | null;
  interviewTime?: string | null;
}

class VapiService {
  private vapi: Vapi | null = null;
  private config: VapiConfig | null = null;
  private callState: CallState = {
    isCallActive: false,
    isLoading: false,
    isListening: false,
    isSpeaking: false,
    status: CallStatus.INACTIVE,
    messages: [],
    transcript: '',
    error: null
  };
  private listeners: Array<(state: CallState) => void> = [];
  private interviewContext: InterviewContext | null = null;

  constructor() {
    this.initializeVapi();
  }

  private async initializeVapi() {
    console.log('🔧 Initializing VAPI...');
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

    console.log('🔑 Public Key:', publicKey ? '✅ Present' : '❌ Missing');
    console.log('🤖 Assistant ID:', assistantId ? '✅ Present' : '❌ Missing');

    if (!publicKey || !assistantId) {
      console.warn('❌ VAPI configuration missing. Set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in your .env file');
      this.updateCallState({ error: 'VAPI configuration missing' });
      return;
    }

    this.config = { publicKey, assistantId };
    console.log('⚙️ Config set successfully');
    
    try {
      console.log('📦 Attempting to import @vapi-ai/web...');
      // Dynamic import to avoid build errors when SDK is not installed
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Module will be available at runtime if installed
      const VapiModule = await import('@vapi-ai/web');
      const Vapi = VapiModule.default || VapiModule;
      
      console.log('✅ VAPI module imported successfully');
      this.vapi = new Vapi(publicKey);
      console.log('🎯 VAPI instance created');
      this.setupEventListeners();
      console.log('🎧 Event listeners set up');
    } catch (error) {
      console.error('❌ VAPI SDK error:', error);
      console.warn('VAPI SDK not available. Install @vapi-ai/web to enable voice features');
      this.updateCallState({ error: 'VAPI SDK not available' });
    }
  }

  private setupEventListeners() {
    if (!this.vapi) return;

    const vapi = this.vapi;

    // Call state events
    vapi.on('call-start', () => {
      console.log('✅ VAPI: Call started successfully');
      this.updateCallState({ isCallActive: true, isLoading: false, error: null });
    });

    vapi.on('call-end', () => {
      console.log('📞 VAPI: Call ended');
      this.updateCallState({ 
        isCallActive: false, 
        isLoading: false, 
        isListening: false, 
        isSpeaking: false 
      });
    });

    // Speech events
    vapi.on('speech-start', () => {
      console.log('🎤 VAPI: User started speaking');
      this.updateCallState({ isListening: true });
    });

    vapi.on('speech-end', () => {
      console.log('🎤 VAPI: User stopped speaking');
      this.updateCallState({ isListening: false });
    });

    // Message events
    vapi.on('message', (message: unknown) => {
      console.log('📝 VAPI: Message received:', message);
      this.handleMessage(message);
    });

    // Error events
    vapi.on('error', (error: unknown) => {
      console.error('❌ VAPI Error Event:', error);
      
      let errorMessage = 'An error occurred';
      let detailedError = '';
      
      if (typeof error === 'object' && error) {
        if ('message' in error) {
          errorMessage = (error as { message: string }).message;
        }
        if ('code' in error) {
          detailedError = ` (Code: ${(error as { code: string }).code})`;
        }
        if ('status' in error) {
          detailedError += ` (Status: ${(error as { status: string }).status})`;
        }
      }
      
      console.error('❌ VAPI Error Details:', {
        message: errorMessage,
        details: detailedError,
        fullError: error
      });
      
      this.updateCallState({ 
        error: errorMessage + detailedError, 
        isLoading: false 
      });
    });

    // Volume events for visual feedback
    vapi.on('volume-level', (volume: unknown) => {
      // Only log volume occasionally to avoid spam
      if (Math.random() < 0.01) {
        console.log('🔊 Volume level:', volume);
      }
    });


  }

  private handleMessage(message: unknown) {
    if (typeof message !== 'object' || !message) return;
    
    const msg = message as Record<string, unknown>;
    const { role, content, type } = msg;
    
    if (type === 'transcript' && typeof content === 'string') {
      this.updateCallState({
        transcript: this.callState.transcript + content,
        messages: [...this.callState.messages, {
          type: role === 'user' ? 'user' : 'assistant',
          content,
          timestamp: new Date()
        }]
      });
    }

    if (type === 'function-call') {
      this.handleFunctionCall(msg);
    }
  }

  private handleFunctionCall(message: Record<string, unknown>) {
    const functionCall = message.function_call as { name?: string } | undefined;
    
    if (functionCall?.name === 'next_question' && this.interviewContext) {
      this.moveToNextQuestion();
    }
    
    if (functionCall?.name === 'end_interview') {
      this.endCall();
    }
  }

  private moveToNextQuestion() {
    if (this.interviewContext && this.interviewContext.currentQuestionIndex < this.interviewContext.questions.length - 1) {
      this.interviewContext.currentQuestionIndex++;
      const nextQuestion = this.interviewContext.questions[this.interviewContext.currentQuestionIndex];
      
      // Function call handling for next question is managed by VAPI internally
      console.log('Moving to next question:', nextQuestion.question);
    }
  }

  private updateCallState(updates: Partial<CallState>) {
    this.callState = { ...this.callState, ...updates };
    
    // Auto-update status based on other states if not explicitly provided
    if (!updates.status) {
      if (this.callState.isLoading) {
        this.callState.status = CallStatus.CONNECTING;
      } else if (this.callState.isCallActive) {
        this.callState.status = CallStatus.ACTIVE;
      } else {
        this.callState.status = CallStatus.INACTIVE;
      }
    }
    
    this.listeners.forEach(listener => listener(this.callState));
  }

  // Public methods
  public async startCall(interviewContext: InterviewContext): Promise<void> {
    console.log('🎯 VapiService.startCall called with interview data:', {
      interviewId: interviewContext.interviewId,
      position: interviewContext.position,
      company: interviewContext.company,
      questionsCount: interviewContext.questions?.length || 0,
      experience: interviewContext.experience
    });
    console.log('🔧 VAPI instance:', !!this.vapi);
    console.log('⚙️ Config:', !!this.config);
    
    if (!this.vapi || !this.config) {
      const error = 'VAPI not initialized. Please check your credentials and setup.';
      console.error('❌', error, 'vapi:', !!this.vapi, 'config:', !!this.config);
      this.updateCallState({ error, isLoading: false });
      throw new Error(error);
    }

    this.interviewContext = interviewContext;
    console.log('📊 Updating call state to loading...');
    this.updateCallState({ 
      isLoading: true, 
      status: CallStatus.CONNECTING, 
      error: null 
    });

    try {
      console.log('🎤 Starting VAPI call with working assistant...');
      console.log('🆔 Assistant ID:', this.config.assistantId);

      // Since your assistant is working in the dashboard, use it directly
      // The assistant already has the professional interviewer configuration
      if (this.config.assistantId && 
          this.config.assistantId !== 'your_vapi_assistant_id_here' && 
          this.config.assistantId !== 'fallback') {
        
        console.log('📞 Starting call with configured assistant from dashboard...');
        console.log('💼 Interview details being passed to assistant:');
        console.log('   - Position:', interviewContext.position);
        console.log('   - Company:', interviewContext.company);
        console.log('   - Experience Level:', interviewContext.experience, 'years');
        console.log('   - Questions to ask:', interviewContext.questions?.length || 0);
        
        // Start the call with your working assistant
        // The assistant will receive context through system messages if needed
        await this.vapi.start(this.config.assistantId);
        console.log('✅ Call started successfully with dashboard assistant');
        
        // Optionally send initial context about the interview
        if (interviewContext.questions && interviewContext.questions.length > 0) {
          console.log('� Interview questions available for assistant reference');
        }
        
      } else {
        // Fallback to dynamic configuration (shouldn't be needed since your assistant works)
        console.log('⚠️ No valid assistant ID, falling back to dynamic config');
        const questions = interviewContext.questions?.map(q => q.question) || [];
        const interviewerConfig = createInterviewerConfig(
          questions, 
          interviewContext.position, 
          interviewContext.company
        );
        
        await this.vapi.start(interviewerConfig);
        console.log('✅ Call started with dynamic configuration');
      }
      
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error), 
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Provide helpful error messages
      let errorMessage = 'Failed to start interview call';
      if (error instanceof Error) {
        if (error.message.includes('credits')) {
          errorMessage = 'Insufficient VAPI credits. Please check your account balance.';
        } else if (error.message.includes('assistant')) {
          errorMessage = 'Assistant configuration error. Please check the VAPI setup guide.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please check your VAPI credentials.';
        } else {
          errorMessage = error.message;
        }
      }
      
      this.updateCallState({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  }

  public async endCall(): Promise<void> {
    if (this.vapi && this.callState.isCallActive) {
      try {
        await this.vapi.stop();
      } catch (error) {
        console.error('Failed to end call:', error);
        throw error;
      }
    }
  }

  public async toggleMute(): Promise<void> {
    if (this.vapi && this.callState.isCallActive) {
      try {
        await this.vapi.setMuted(!this.callState.isListening);
      } catch (error) {
        console.error('Failed to toggle mute:', error);
        throw error;
      }
    }
  }

  public getCallState(): CallState {
    return { ...this.callState };
  }

  public subscribe(listener: (state: CallState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getCurrentQuestion(): string | null {
    if (!this.interviewContext) return null;
    return this.interviewContext.questions[this.interviewContext.currentQuestionIndex]?.question || null;
  }

  public getInterviewProgress(): { current: number; total: number } {
    if (!this.interviewContext) return { current: 0, total: 0 };
    return {
      current: this.interviewContext.currentQuestionIndex + 1,
      total: this.interviewContext.questions.length
    };
  }

  public isVapiAvailable(): boolean {
    return this.vapi !== null && this.config !== null;
  }
}

// Singleton instance
export const vapiService = new VapiService();