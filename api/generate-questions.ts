/**
 * API Route for Enhanced AI Mock Interview Question Generation
 * Optimized for VAPI Voice Assistant Integration
 */

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Types for request/response
export interface GenerateQuestionsRequest {
  position: string;
  company: string;
  description: string;
  experience: number;
  techStack: string;
  whyJoinUs: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  category: 'introduction' | 'technical' | 'behavioral' | 'company' | 'closing';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedDuration: number; // in seconds
  followUpHints: string[];
}

export interface GenerateQuestionsResponse {
  questions: InterviewQuestion[];
  totalEstimatedTime: number;
  interviewStructure: {
    introduction: number;
    technical: number;
    behavioral: number;
    company: number;
    closing: number;
  };
}

// Zod schema for validation
const QuestionSchema = z.object({
  question: z.string().min(10),
  answer: z.string().min(50),
  category: z.enum(['introduction', 'technical', 'behavioral', 'company', 'closing']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  expectedDuration: z.number().min(30).max(300),
  followUpHints: z.array(z.string()).max(3)
});

const ResponseSchema = z.object({
  questions: z.array(QuestionSchema).length(8),
  totalEstimatedTime: z.number(),
  interviewStructure: z.object({
    introduction: z.number(),
    technical: z.number(),
    behavioral: z.number(),
    company: z.number(),
    closing: z.number()
  })
});

// Enhanced prompt for VAPI voice assistant integration
const createEnhancedPrompt = (data: GenerateQuestionsRequest): string => {
  return `You are an expert technical interviewer creating a comprehensive 8-question mock interview for a VAPI voice assistant. This will be a real-time conversational interview where the AI interviewer will speak these questions aloud and listen to voice responses.

**CRITICAL REQUIREMENTS FOR VOICE INTERACTION:**
- Questions must be conversational and natural when spoken aloud
- Avoid complex punctuation or formatting that doesn't translate to speech
- Keep questions clear and not too long (max 2-3 sentences)
- Include natural transitions and conversational flow
- Design for voice-to-voice interaction, not text-based

**Job Context:**
- Position: ${data.position}
- Company: ${data.company}
- Job Description: ${data.description}
- Experience Level: ${data.experience} years
- Tech Stack: ${data.techStack}
- Why Join: ${data.whyJoinUs}

**Interview Structure (8 questions total):**

1. **Introduction (1 question):** Warm greeting + "Tell me about yourself" style opener
2. **Technical Questions (4 questions):** 
   - Focus on ${data.techStack} technologies
   - Include practical problem-solving scenarios
   - One system design question appropriate for ${data.experience} years experience
   - Real-world debugging/troubleshooting scenario
3. **Behavioral Questions (2 questions):**
   - Situational leadership/teamwork scenarios
   - Handling challenges or conflicts
4. **Company-Specific (1 question):**
   - Why ${data.company}? Cultural fit assessment based on: ${data.whyJoinUs}

**Voice Assistant Optimization:**
- Start questions with natural conversation starters: "Great, so...", "Now I'd like to ask...", "Let's talk about..."
- End with clear invitation for response: "Take your time to walk me through...", "I'd love to hear your thoughts on..."
- Avoid numbered lists, bullet points, or complex formatting in questions
- Keep language natural and conversational, as if speaking to someone in person

**Answer Guidelines:**
- Provide comprehensive model answers (100-200 words each)
- Include key points an interviewer would look for
- Mention specific technical concepts, methodologies, or examples
- Structure answers to show progression from basic to advanced thinking

**Expected Duration:**
- Introduction: 60-90 seconds
- Technical: 120-180 seconds each
- Behavioral: 90-120 seconds each  
- Company: 60-90 seconds

Generate exactly 8 questions that create a natural, conversational interview flow optimized for voice interaction.`;
};

// Metrics are calculated automatically by the AI model in the structured response

// Main API handler - compatible with Vercel and other platforms
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: Request | any, res?: any) {
  // Handle both Request object and Vercel req/res format
  const method = req.method;
  
  // Handle CORS for client-side requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (method === 'OPTIONS') {
    if (res) {
      return res.status(200).json({});
    }
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (method !== 'POST') {
    const error = { error: 'Method not allowed' };
    if (res) {
      return res.status(405).json(error);
    }
    return new Response(JSON.stringify(error), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Parse request body based on format
    const requestBody = req instanceof Request ? await req.json() : req.body;
    const body = requestBody as GenerateQuestionsRequest;
    
    // Validate required fields
    if (!body.position || !body.company || !body.description || 
        body.experience === undefined || !body.techStack || !body.whyJoinUs) {
      const error = { error: 'Missing required fields' };
      if (res) {
        return res.status(400).json(error);
      }
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialize Google AI model
    const model = google('gemini-2.0-flash-exp');

    // Generate structured questions using AI SDK
    const result = await generateObject({
      model,
      schema: ResponseSchema,
      prompt: createEnhancedPrompt(body),
      maxRetries: 2,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Return response based on format
    if (res) {
      return res.status(200).json(result.object);
    }

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate interview questions';
    const errorResponse = { 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    };
    
    if (res) {
      return res.status(500).json(errorResponse);
    }
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Export the handler for different deployment platforms
export { handler as GET, handler as POST };