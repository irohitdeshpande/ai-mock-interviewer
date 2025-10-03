import Vapi from "@vapi-ai/web";
import { Interview } from "@/types";

export class VAPIService {
  private vapi: Vapi;
  private assistantId: string;

  constructor() {
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    this.assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

    if (!publicKey) {
      throw new Error("VAPI_PUBLIC_KEY is not configured");
    }

    if (!this.assistantId) {
      throw new Error("VAPI_ASSISTANT_ID is not configured");
    }

    this.vapi = new Vapi(publicKey);
  }

  /**
   * Start an interview call with the VAPI assistant
   */
  async startCall(interview: Interview) {
    try {
      // Build the questions list for the system prompt
      const questionsText = interview.questions
        .map((q, idx) => `${idx + 1}. ${q.question}`)
        .join("\n");

      // Create the interview context for the assistant
      const interviewContext = `
You are conducting a ${interview.position} interview for ${interview.company}.

Candidate Information:
- Position: ${interview.position}
- Company: ${interview.company}
- Experience Level: ${interview.experience} years
- Tech Stack: ${interview.techStack}
- Role Description: ${interview.description}
${interview.whyJoinUs ? `- Why Join Us: ${interview.whyJoinUs}` : ''}

Interview Questions to Ask:
${questionsText}

Interview Guidelines:
- Follow the structured question flow listed above
- Ask one question at a time and wait for the candidate's complete response
- Listen actively and acknowledge responses before moving to the next question
- Ask brief follow-up questions if a response is vague or requires more detail
- Keep the conversation flowing smoothly while maintaining control
- Be professional, yet warm and welcoming
- Use official yet friendly language
- Keep responses concise and to the point (like in a real voice interview)
- Avoid robotic phrasing—sound natural and conversational

Answer the candidate's questions professionally:
- If asked about the role, company, or expectations, provide a clear and relevant answer based on the information provided
- If unsure, redirect the candidate to HR for more details

Conclude the interview properly:
- After completing all questions, thank the candidate for their time
- Inform them that the company will reach out soon with feedback
- End the conversation on a polite and positive note
`;

      // Start the call with the assistant ID and overrides
      const call = await this.vapi.start(this.assistantId, {
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: interviewContext,
            },
          ],
        },
      });

      return call;
    } catch (error) {
      console.error("❌ Error starting VAPI call:", error);
      throw error;
    }
  }

  /**
   * Stop the current call
   */
  stop() {
    try {
      this.vapi.stop();
    } catch (error) {
      console.error("Error stopping VAPI call:", error);
      throw error;
    }
  }

  /**
   * Check if call is active
   */
  isMuted() {
    return this.vapi.isMuted();
  }

  /**
   * Toggle mute
   */
  setMuted(muted: boolean) {
    this.vapi.setMuted(muted);
  }

  /**
   * Get the VAPI instance for event listeners
   */
  getVapi() {
    return this.vapi;
  }
}

// Singleton instance
let vapiServiceInstance: VAPIService | null = null;

export const getVAPIService = () => {
  if (!vapiServiceInstance) {
    try {
      vapiServiceInstance = new VAPIService();
    } catch (error) {
      console.error("Failed to initialize VAPI service:", error);
      return null;
    }
  }
  return vapiServiceInstance;
};
