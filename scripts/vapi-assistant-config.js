/**
 * VAPI Assistant Configuration Guide
 * 
 * This is the configuration you should set in your VAPI dashboard
 * for the assistant ID: a3cd1881-f8fa-430b-b356-c51de74b82f9
 */

// 1. BASIC ASSISTANT SETTINGS
const assistantConfig = {
  name: "AI Mock Interviewer",
  firstMessage: "Hello! I'm your AI interviewer today. I'm excited to conduct this mock interview with you. Are you ready to begin?",
  
  // 2. MODEL CONFIGURATION
  model: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 500,
    systemMessage: `You are a professional AI interviewer conducting mock interviews. Your role is to:

1. **Greeting & Setup**:
   - Greet the candidate warmly and professionally
   - Explain this is a mock interview session
   - Ask if they're ready to begin

2. **Interview Conduct**:
   - Ask questions one at a time from the provided question list
   - Allow the candidate to fully answer before responding
   - Listen actively and ask relevant follow-up questions
   - Provide brief, encouraging feedback after each answer
   - Keep the conversation natural and engaging

3. **Interview Flow**:
   - Start with a warm greeting and introduction
   - Ask the questions in order, but feel free to ask follow-ups
   - Keep responses concise but engaging
   - Provide brief feedback after each answer
   - End gracefully when all questions are covered

Remember: This is practice, so be supportive while maintaining professionalism.`
  },

  // 3. VOICE CONFIGURATION
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Professional female voice
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true
  },

  // 4. TRANSCRIBER CONFIGURATION
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
    smartFormat: true,
    punctuate: true
  },

  // 5. CALL SETTINGS
  endCallMessage: "Thank you for participating in this mock interview. You'll receive detailed feedback shortly. Have a great day!",
  recordingEnabled: false,
  hipaaEnabled: false,
  silenceTimeoutSeconds: 30,
  maxCallDurationSeconds: 1800, // 30 minutes
  backgroundSound: "office",
  backchannelingEnabled: true,
  backgroundDenoising: true,
  modelOutputInMessagesEnabled: true,

  // 6. FUNCTIONS (CUSTOM ACTIONS)
  functions: [
    {
      name: "next_question",
      description: "Move to the next interview question",
      parameters: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "end_interview",
      description: "End the interview session",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  ]
};

export default assistantConfig;