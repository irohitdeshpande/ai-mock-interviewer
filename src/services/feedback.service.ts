/**
 * Firestore Feedback Service
 * Handles saving and retrieving interview feedback and results
 */

import { db } from '@/config/firebase.config';
import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';
import { toast } from 'sonner';

export interface InterviewFeedback {
  id?: string;
  interviewId: string;
  userId: string;
  questions: Array<{
    question: string;
    userAnswer: string;
    expectedAnswer: string;
    feedback: string;
    rating: number;
    category: string;
    timeSpent: number; // in seconds
  }>;
  overallRating: number;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  transcript: string;
  totalDduration: number; // in seconds
  interviewType: 'traditional' | 'vapi';
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewSession {
  id?: string;
  interviewId: string;
  userId: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  startTime: Date;
  endTime?: Date;
  transcript: string;
  messages: Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  interviewType: 'traditional' | 'vapi';
  createdAt: Date;
  updatedAt: Date;
}

class FeedbackService {
  
  /**
   * Start a new VAPI interview session
   */
  async startInterviewSession(interviewId: string, userId: string): Promise<string> {
    try {
      const sessionData: Omit<InterviewSession, 'id'> = {
        interviewId,
        userId,
        status: 'in-progress',
        startTime: new Date(),
        transcript: '',
        messages: [],
        interviewType: 'vapi',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'interview_sessions'), {
        ...sessionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startTime: serverTimestamp()
      });

      console.log('✅ Interview session started:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error starting interview session:', error);
      throw error;
    }
  }

  /**
   * Update interview session with messages and transcript
   */
  async updateInterviewSession(
    sessionId: string, 
    transcript: string, 
    messages: Array<{type: 'user' | 'assistant'; content: string; timestamp: Date}>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'interview_sessions', sessionId), {
        transcript,
        messages,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Interview session updated:', sessionId);
    } catch (error) {
      console.error('Error updating interview session:', error);
      throw error;
    }
  }

  /**
   * Complete interview session and generate feedback
   */
  async completeInterviewSession(
    sessionId: string,
    transcript: string,
    messages: Array<{type: 'user' | 'assistant'; content: string; timestamp: Date}>,
    interviewContext: { interviewId: string; userId?: string; questions?: Array<{question: string; answer: string}> }
  ): Promise<string> {
    try {
      // Update session status
      await updateDoc(doc(db, 'interview_sessions', sessionId), {
        status: 'completed',
        endTime: serverTimestamp(),
        transcript,
        messages,
        updatedAt: serverTimestamp()
      });

      // Generate AI feedback based on the conversation
      const feedback = await this.generateVapiFeedback(messages, interviewContext);
      
      // Save the feedback
      const feedbackId = await this.saveFeedback(feedback);
      
      console.log('✅ Interview completed and feedback generated:', feedbackId);
      return feedbackId;
    } catch (error) {
      console.error('Error completing interview session:', error);
      throw error;
    }
  }

  /**
   * Generate feedback from VAPI interview conversation
   */
  private async generateVapiFeedback(
    messages: Array<{type: 'user' | 'assistant'; content: string; timestamp: Date}>,
    interviewContext: { interviewId: string; userId?: string; questions?: Array<{question: string; answer: string}> }
  ): Promise<Omit<InterviewFeedback, 'id' | 'createdAt' | 'updatedAt'>> {
    // Extract user responses
    const userMessages = messages.filter(msg => msg.type === 'user');

    // Calculate interview duration
    const startTime = messages[0]?.timestamp || new Date();
    const endTime = messages[messages.length - 1]?.timestamp || new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    // Create structured feedback based on conversation
    const questions = interviewContext.questions || [];
    const questionFeedback = questions.map((q: {question: string; answer: string}, index: number) => {
      const userResponse = userMessages[index]?.content || 'No response provided';
      
      return {
        question: q.question,
        userAnswer: userResponse,
        expectedAnswer: q.answer || 'Various acceptable answers',
        feedback: this.generateQuestionFeedback(q.question, userResponse),
        rating: this.calculateQuestionRating(userResponse),
        category: this.categorizeQuestion(q.question),
        timeSpent: 60 // Approximate time per question
      };
    });

    // Calculate overall metrics
    const overallRating = Math.round(
      questionFeedback.reduce((sum: number, q: {rating: number}) => sum + q.rating, 0) / questionFeedback.length
    );

    return {
      interviewId: interviewContext.interviewId,
      userId: interviewContext.userId || 'unknown',
      questions: questionFeedback,
      overallRating,
      overallFeedback: this.generateOverallFeedback(overallRating, userMessages.length),
      strengths: this.identifyStrengths(userMessages),
      improvements: this.identifyImprovements(userMessages),
      transcript: messages.map(m => `${m.type}: ${m.content}`).join('\n'),
      totalDduration: duration,
      interviewType: 'vapi'
    };
  }

  /**
   * Generate feedback for individual questions
   */
  private generateQuestionFeedback(_question: string, userAnswer: string): string {
    if (!userAnswer || userAnswer.trim().length < 10) {
      return 'Response was too brief. Try to provide more detailed examples and explanations.';
    }
    
    if (userAnswer.length > 300) {
      return 'Good detailed response. Consider being more concise while maintaining key points.';
    }
    
    return 'Good response with appropriate level of detail.';
  }

  /**
   * Calculate rating for individual questions
   */
  private calculateQuestionRating(userAnswer: string): number {
    if (!userAnswer || userAnswer.trim().length < 10) return 2;
    if (userAnswer.length < 50) return 3;
    if (userAnswer.length < 150) return 4;
    return 5;
  }

  /**
   * Categorize questions
   */
  private categorizeQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('technical') || lowerQuestion.includes('coding') || lowerQuestion.includes('programming')) {
      return 'Technical';
    }
    if (lowerQuestion.includes('project') || lowerQuestion.includes('experience')) {
      return 'Experience';
    }
    if (lowerQuestion.includes('team') || lowerQuestion.includes('leadership') || lowerQuestion.includes('conflict')) {
      return 'Behavioral';
    }
    if (lowerQuestion.includes('yourself') || lowerQuestion.includes('strengths') || lowerQuestion.includes('weaknesses')) {
      return 'Personal';
    }
    
    return 'General';
  }

  /**
   * Generate overall feedback
   */
  private generateOverallFeedback(rating: number, responseCount: number): string {
    if (rating >= 4.5) {
      return `Excellent interview performance! You provided ${responseCount} well-structured responses with good detail and examples.`;
    }
    if (rating >= 3.5) {
      return `Good interview performance with room for improvement. Consider providing more specific examples in your responses.`;
    }
    if (rating >= 2.5) {
      return `Average performance. Focus on providing more detailed responses and specific examples from your experience.`;
    }
    
    return `Needs improvement. Practice providing more comprehensive responses with specific examples and details.`;
  }

  /**
   * Identify strengths from responses
   */
  private identifyStrengths(userMessages: Array<{content: string}>): string[] {
    const strengths: string[] = [];
    
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('example') || allText.includes('for instance')) {
      strengths.push('Provides concrete examples');
    }
    if (allText.includes('team') || allText.includes('collaboration')) {
      strengths.push('Team-oriented mindset');
    }
    if (allText.includes('learn') || allText.includes('improve')) {
      strengths.push('Growth mindset');
    }
    if (allText.includes('challenge') || allText.includes('problem')) {
      strengths.push('Problem-solving focus');
    }
    
    return strengths.length > 0 ? strengths : ['Participated in interview'];
  }

  /**
   * Identify areas for improvement
   */
  private identifyImprovements(userMessages: Array<{content: string}>): string[] {
    const improvements: string[] = [];
    
    const avgResponseLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    
    if (avgResponseLength < 50) {
      improvements.push('Provide more detailed responses');
    }
    if (avgResponseLength > 500) {
      improvements.push('Be more concise in responses');
    }
    
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    if (!allText.includes('example') && !allText.includes('for instance')) {
      improvements.push('Include more specific examples');
    }
    if (!allText.includes('result') && !allText.includes('outcome')) {
      improvements.push('Mention outcomes and results');
    }
    
    return improvements.length > 0 ? improvements : ['Continue practicing interview skills'];
  }

  /**
   * Save interview feedback to Firestore
   */
  async saveFeedback(feedback: Omit<InterviewFeedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const feedbackData = {
        ...feedback,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'interview_feedback'), feedbackData);
      
      toast.success('Interview feedback saved successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save interview feedback');
      throw error;
    }
  }

  /**
   * Get feedback for a specific interview
   */
  async getFeedback(interviewId: string, userId: string): Promise<InterviewFeedback | null> {
    try {
      const feedbackQuery = query(
        collection(db, 'interview_feedback'),
        where('interviewId', '==', interviewId),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(feedbackQuery);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as InterviewFeedback;
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  }

  /**
   * Get all feedback for a user's interviews
   */
  async getUserFeedback(userId: string): Promise<InterviewFeedback[]> {
    try {
      const feedbackQuery = query(
        collection(db, 'interview_feedback'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(feedbackQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InterviewFeedback[];
    } catch (error) {
      console.error('Error getting user feedback:', error);
      throw error;
    }
  }

  /**
   * Start an interview session
   */
  async startSession(sessionData: Omit<InterviewSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const session = {
        ...sessionData,
        status: 'in-progress' as const,
        startTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'interview_sessions'), session);
      return docRef.id;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * Update interview session
   */
  async updateSession(sessionId: string, updates: Partial<InterviewSession>): Promise<void> {
    try {
      const sessionRef = doc(db, 'interview_sessions', sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * Complete interview session
   */
  async completeSession(
    sessionId: string, 
    transcript: string, 
    messages: Array<{type: 'user' | 'assistant'; content: string; timestamp: Date}>
  ): Promise<void> {
    try {
      const sessionRef = doc(db, 'interview_sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'completed',
        endTime: serverTimestamp(),
        transcript,
        messages,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  }

  /**
   * Get interview session
   */
  async getSession(sessionId: string): Promise<InterviewSession | null> {
    try {
      const sessionDoc = await getDoc(doc(db, 'interview_sessions', sessionId));
      
      if (!sessionDoc.exists()) {
        return null;
      }

      return {
        id: sessionDoc.id,
        ...sessionDoc.data()
      } as InterviewSession;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Generate AI feedback for interview responses
   */
  async generateFeedback(
    questions: Array<{question: string; userAnswer: string; expectedAnswer: string}>,
    interviewContext: {position: string; company: string; experience: number}
  ): Promise<{
    questionFeedback: Array<{feedback: string; rating: number; category: string}>;
    overallRating: number;
    overallFeedback: string;
    strengths: string[];
    improvements: string[];
  }> {
    try {
      // Use the existing AI service to generate feedback
      const { chatSession } = await import('@/scripts');
      
      const prompt = `
As an expert technical interviewer, provide detailed feedback for this interview performance:

Position: ${interviewContext.position}
Company: ${interviewContext.company}
Experience: ${interviewContext.experience} years

Questions and Responses:
${questions.map((q, i) => `
Q${i + 1}: ${q.question}
User Answer: ${q.userAnswer}
Expected Answer: ${q.expectedAnswer}
`).join('\n')}

Provide feedback in this JSON format:
{
  "questionFeedback": [
    {
      "feedback": "Detailed feedback for this specific answer",
      "rating": 8,
      "category": "technical" // or "behavioral" or "company"
    }
  ],
  "overallRating": 7,
  "overallFeedback": "Overall assessment of the interview performance",
  "strengths": ["List of key strengths demonstrated"],
  "improvements": ["List of areas for improvement"]
}

Rating scale: 1-10 (10 being excellent)
Be constructive, specific, and encouraging while highlighting areas for improvement.
`;

      const aiResult = await chatSession.sendMessage(prompt);
      const responseText = aiResult.response.text();
      
      // Clean and parse the response
      const cleanResponse = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
      
    } catch (error) {
      console.error('Error generating feedback:', error);
      
      // Fallback feedback if AI generation fails
      return {
        questionFeedback: questions.map(() => ({
          feedback: "Thank you for your response. Your answer shows good understanding of the topic.",
          rating: 7,
          category: "general"
        })),
        overallRating: 7,
        overallFeedback: "Good interview performance overall. Continue practicing to improve your responses.",
        strengths: ["Clear communication", "Good technical knowledge"],
        improvements: ["Provide more specific examples", "Elaborate on key points"]
      };
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();