/**
 * Client Service for Enhanced AI Question Generation
 * Connects to the new API route for better VAPI integration
 */

import { GenerateQuestionsRequest, GenerateQuestionsResponse, InterviewQuestion } from '../../api/generate-questions';

interface FormData {
  position: string;
  company: string;
  description: string;
  experience?: number | null | undefined;
  techStack: string;
  whyJoinUs: string;
}

// Convert form data to API request format
const formatRequestData = (formData: FormData): GenerateQuestionsRequest => {
  return {
    position: formData.position,
    company: formData.company,
    description: formData.description,
    experience: formData.experience ?? 0,
    techStack: formData.techStack,
    whyJoinUs: formData.whyJoinUs,
  };
};

// Convert API response to legacy format for backward compatibility
const convertToLegacyFormat = (response: GenerateQuestionsResponse): Array<{ question: string; answer: string }> => {
  return response.questions.map((q: InterviewQuestion) => ({
    question: q.question,
    answer: q.answer,
  }));
};

class QuestionGenerationService {
  private baseUrl: string;

  constructor() {
    // Use relative path for API route - works with both development and production
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5174' 
      : '';
  }

  async generateQuestions(formData: FormData): Promise<Array<{ question: string; answer: string }>> {
    try {
      const requestData = formatRequestData(formData);
      
      const response = await fetch(`${this.baseUrl}/api/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GenerateQuestionsResponse = await response.json();
      
      // Convert to legacy format for backward compatibility
      return convertToLegacyFormat(data);
      
    } catch (error) {
      console.error('Failed to generate questions via API:', error);
      
      // Fallback to legacy generation if API fails
      console.log('Falling back to legacy question generation...');
      return this.fallbackGeneration(formData);
    }
  }

  // Fallback to the original generation method if API fails
  private async fallbackGeneration(data: FormData): Promise<Array<{ question: string; answer: string }>> {
    try {
      // Dynamic import to avoid issues if @google/generative-ai is not available
      const { chatSession } = await import('@/scripts');
      
      const prompt = `
As an experienced technical interviewer at ${data?.company}, create a JSON array containing 8 comprehensive interview questions with detailed answers tailored for this specific position. Start with asking the interviewee to introduce themselves and about their background. Include 4 technical questions that assess depth of knowledge in the specified tech stack, 2 behavioral/soft skills questions relevant to the role and team dynamics, and 1 company-specific question that evaluates cultural fit and industry knowledge.
Format the output strictly as a JSON array without any explanations or additional text:
[
  { "question": "<Question text>", "answer": "<Answer text>" },
  ...
]
Job Information:
- Position: ${data?.position}
- Company: ${data?.company}
- Description: ${data?.description}
- Experience Required: ${data?.experience} 
- Tech Stack: ${data?.techStack}
- Why Join Us: ${data?.whyJoinUs}
For technical questions:
- Create problems that directly apply ${data?.techStack} to solve challenges specific to ${data?.company}'s industry
- Include a system design question relevant to the company's scale and technical challenges
- Address performance optimization scenarios that would impact ${data?.company}'s product/service
- Include at least one debugging/troubleshooting question based on realistic situations
- Focus on demonstrating practical experience with the required technologies
For behavioral/soft skill questions:
- Assess collaboration skills in the context of ${data?.company}'s team structure
- Evaluate ability to handle priorities based on typical challenges in the role
For the company-specific question:
- Assess the candidate's understanding of ${data?.company}'s industry position, challenges, or technical direction
- Include elements from the Why Join Us section to gauge alignment with company values
Ensure all answers are detailed enough to assess both the candidate's knowledge depth and communication skills.
`;
      
      const aiResult = await chatSession.sendMessage(prompt);
      const responseText = aiResult.response.text();
      
      return this.cleanResponse(responseText);
      
    } catch (error) {
      console.error('Fallback generation also failed:', error);
      throw new Error('Failed to generate interview questions. Please try again.');
    }
  }

  private cleanResponse(responseText: string): Array<{ question: string; answer: string }> {
    try {
      let cleanText = responseText.trim();
      
      // First try to find a JSON array in the response
      const arrayMatch = cleanText.match(/\[\s*\{.*\}\s*\]/s);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
      
      // If that fails, try removing code blocks and parsing
      cleanText = cleanText.replace(/```json|```|`/g, "").trim();
      
      // If it's still not valid JSON, try to find array syntax within the text
      const bracketMatch = cleanText.match(/\[([\s\S]*)\]/);
      if (bracketMatch) {
        return JSON.parse(`[${bracketMatch[1]}]`);
      }
      
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("Error parsing response:", error, responseText);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  // Method to get enhanced questions with full metadata (for future use)
  async generateEnhancedQuestions(formData: FormData): Promise<GenerateQuestionsResponse> {
    const requestData = formatRequestData(formData);
    
    const response = await fetch(`${this.baseUrl}/api/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const questionGenerationService = new QuestionGenerationService();

// Export types for use in components
export type { InterviewQuestion, GenerateQuestionsResponse };