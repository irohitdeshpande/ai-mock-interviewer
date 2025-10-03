import { InterviewContext } from '@/services/vapi.service';
import { generateAIText } from '@/lib/ai';

export interface ConversationAnalysis {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  technicalAccuracy: number;
  communicationSkills: number;
  responseTime: number;
  confidence: number;
  questionSpecificFeedback: Array<{
    question: string;
    userResponse: string;
    score: number;
    feedback: string;
  }>;
}

export interface RealTimeFeedback {
  currentQuestionScore: number;
  liveInsights: string[];
  suggestedImprovements: string[];
  confidenceLevel: number;
}

class FeedbackAnalyzer {
  private conversationHistory: Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    questionIndex?: number;
  }> = [];

  private interviewContext: InterviewContext | null = null;

  public initialize(context: InterviewContext) {
    this.interviewContext = context;
    this.conversationHistory = [];
  }

  public addMessage(message: {
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    questionIndex?: number;
  }) {
    this.conversationHistory.push(message);
  }

  public async generateRealTimeFeedback(): Promise<RealTimeFeedback> {
    if (!this.interviewContext || this.conversationHistory.length === 0) {
      return {
        currentQuestionScore: 0,
        liveInsights: [],
        suggestedImprovements: [],
        confidenceLevel: 0
      };
    }

    const recentUserMessages = this.conversationHistory
      .filter(msg => msg.type === 'user')
      .slice(-3); // Last 3 user responses

    if (recentUserMessages.length === 0) {
      return {
        currentQuestionScore: 0,
        liveInsights: [],
        suggestedImprovements: [],
        confidenceLevel: 0
      };
    }

    const currentQuestion = this.interviewContext.questions[this.interviewContext.currentQuestionIndex];
    const latestResponse = recentUserMessages[recentUserMessages.length - 1];

    const prompt = `
      Analyze this interview response in real-time:
      
      Position: ${this.interviewContext.position}
      Company: ${this.interviewContext.company}
      Question: "${currentQuestion?.question}"
      User Response: "${latestResponse.content}"
      
      Provide brief, actionable feedback in JSON format with:
      {
        "currentQuestionScore": (1-10 score),
        "liveInsights": ["insight1", "insight2"],
        "suggestedImprovements": ["improvement1", "improvement2"],
        "confidenceLevel": (1-10 confidence in response)
      }
      
      Keep insights and improvements concise (max 10 words each).
    `;

    try {
      const response = await generateAIText(prompt);
      const feedback = JSON.parse(response);
      
      return {
        currentQuestionScore: feedback.currentQuestionScore || 0,
        liveInsights: feedback.liveInsights || [],
        suggestedImprovements: feedback.suggestedImprovements || [],
        confidenceLevel: feedback.confidenceLevel || 0
      };
    } catch (error) {
      console.error('Error generating real-time feedback:', error);
      return {
        currentQuestionScore: 0,
        liveInsights: ['Analysis in progress...'],
        suggestedImprovements: ['Keep speaking naturally'],
        confidenceLevel: 5
      };
    }
  }

  public async generateFinalAnalysis(): Promise<ConversationAnalysis> {
    if (!this.interviewContext || this.conversationHistory.length === 0) {
      return this.getEmptyAnalysis();
    }

    const userResponses = this.conversationHistory.filter(msg => msg.type === 'user');
    const questionsAnswered = this.interviewContext.questions.slice(0, this.interviewContext.currentQuestionIndex + 1);

    const prompt = `
      Analyze this complete interview conversation:
      
      Position: ${this.interviewContext.position}
      Company: ${this.interviewContext.company}
      Experience Level: ${this.interviewContext.experience} years
      
      Questions and Responses:
      ${questionsAnswered.map((q, i) => {
        const userResponse = userResponses.find(r => r.questionIndex === i);
        return `Q${i + 1}: ${q.question}\nA${i + 1}: ${userResponse?.content || 'No response'}\nExpected: ${q.answer}`;
      }).join('\n\n')}
      
      Provide comprehensive analysis in JSON format:
      {
        "overallScore": (1-10),
        "strengths": ["strength1", "strength2", "strength3"],
        "improvements": ["improvement1", "improvement2", "improvement3"],
        "technicalAccuracy": (1-10),
        "communicationSkills": (1-10),
        "responseTime": (1-10),
        "confidence": (1-10),
        "questionSpecificFeedback": [
          {
            "question": "question text",
            "userResponse": "user response",
            "score": (1-10),
            "feedback": "specific feedback"
          }
        ]
      }
    `;

    try {
      const response = await generateAIText(prompt);
      const analysis = JSON.parse(response);
      
      return {
        overallScore: analysis.overallScore || 0,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        technicalAccuracy: analysis.technicalAccuracy || 0,
        communicationSkills: analysis.communicationSkills || 0,
        responseTime: analysis.responseTime || 0,
        confidence: analysis.confidence || 0,
        questionSpecificFeedback: analysis.questionSpecificFeedback || []
      };
    } catch (error) {
      console.error('Error generating final analysis:', error);
      return this.getEmptyAnalysis();
    }
  }

  private getEmptyAnalysis(): ConversationAnalysis {
    return {
      overallScore: 0,
      strengths: [],
      improvements: [],
      technicalAccuracy: 0,
      communicationSkills: 0,
      responseTime: 0,
      confidence: 0,
      questionSpecificFeedback: []
    };
  }

  public getConversationHistory() {
    return [...this.conversationHistory];
  }

  public getConversationStats() {
    const userMessages = this.conversationHistory.filter(msg => msg.type === 'user');
    const assistantMessages = this.conversationHistory.filter(msg => msg.type === 'assistant');
    
    const totalDuration = this.conversationHistory.length > 0 
      ? this.conversationHistory[this.conversationHistory.length - 1].timestamp.getTime() - 
        this.conversationHistory[0].timestamp.getTime()
      : 0;

    return {
      totalMessages: this.conversationHistory.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      totalDurationMs: totalDuration,
      averageResponseLength: userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / Math.max(userMessages.length, 1)
    };
  }

  public clear() {
    this.conversationHistory = [];
    this.interviewContext = null;
  }
}

// Singleton instance
export const feedbackAnalyzer = new FeedbackAnalyzer();