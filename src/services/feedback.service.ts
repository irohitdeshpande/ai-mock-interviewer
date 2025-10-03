import { db } from "@/config/firebase.config";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

export interface InterviewSession {
  interviewId: string;
  userId: string;
  startedAt: ReturnType<typeof serverTimestamp>;
  endedAt?: ReturnType<typeof serverTimestamp>;
  transcript?: string;
  status: "in_progress" | "completed" | "cancelled";
}

export interface InterviewFeedback {
  interviewId: string;
  userId: string;
  sessionId: string;
  transcript: string;
  feedback: string;
  rating: number;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export class FeedbackService {
  /**
   * Create a new interview session
   */
  static async createSession(
    interviewId: string,
    userId: string
  ): Promise<string> {
    try {
      const sessionData: Partial<InterviewSession> = {
        interviewId,
        userId,
        startedAt: serverTimestamp(),
        status: "in_progress",
      };

      const docRef = await addDoc(
        collection(db, "interview_sessions"),
        sessionData
      );
      console.log("✅ Interview session created:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating interview session:", error);
      throw error;
    }
  }

  /**
   * Update interview session with transcript and end time
   */
  static async updateSession(
    sessionId: string,
    transcript: string,
    status: "completed" | "cancelled" = "completed"
  ): Promise<void> {
    try {
      const sessionRef = doc(db, "interview_sessions", sessionId);
      await updateDoc(sessionRef, {
        transcript,
        endedAt: serverTimestamp(),
        status,
      });
      console.log("✅ Interview session updated:", sessionId);
    } catch (error) {
      console.error("Error updating interview session:", error);
      throw error;
    }
  }

  /**
   * Save interview feedback
   */
  static async saveFeedback(
    interviewId: string,
    userId: string,
    sessionId: string,
    transcript: string,
    feedback: string,
    rating: number
  ): Promise<string> {
    try {
      const feedbackData: Partial<InterviewFeedback> = {
        interviewId,
        userId,
        sessionId,
        transcript,
        feedback,
        rating,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "interview_feedback"),
        feedbackData
      );
      console.log("✅ Interview feedback saved:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving interview feedback:", error);
      throw error;
    }
  }

  /**
   * Get interview feedback by interview ID
   */
  static async getFeedback(): Promise<null> {
    try {
      // This would typically use a query to find feedback by interviewId and userId
      // For now, returning null as we'd need to implement the query
      return null;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  }

  /**
   * Generate AI feedback from transcript
   * This uses the existing Gemini AI to analyze the transcript
   */
  static async generateFeedback(
    transcript: string,
    questions: { question: string; answer: string }[]
  ): Promise<{ feedback: string; rating: number }> {
    try {
      // Import the chat session
      const { chatSession } = await import("@/scripts");

      const prompt = `
You are an expert interview evaluator. Analyze the following interview transcript and provide detailed feedback.

Interview Questions and Expected Answers:
${questions.map((q, i) => `
Question ${i + 1}: ${q.question}
Expected Answer: ${q.answer}
`).join("\n")}

Interview Transcript:
${transcript}

Please provide:
1. An overall assessment of the candidate's performance
2. Specific feedback on their answers to each question
3. Strengths demonstrated during the interview
4. Areas for improvement
5. An overall rating out of 10

Format your response as JSON:
{
  "overallAssessment": "...",
  "questionFeedback": [
    {
      "question": "...",
      "feedback": "...",
      "rating": 0-10
    }
  ],
  "strengths": ["..."],
  "improvements": ["..."],
  "overallRating": 0-10
}
`;

      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();

      // Parse the JSON response
      let feedbackData;
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/```\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : responseText;
        feedbackData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Fallback to basic feedback
        feedbackData = {
          overallAssessment: responseText,
          overallRating: 7,
        };
      }

      return {
        feedback: JSON.stringify(feedbackData, null, 2),
        rating: feedbackData.overallRating || 7,
      };
    } catch (error) {
      console.error("Error generating feedback:", error);
      throw error;
    }
  }
}
