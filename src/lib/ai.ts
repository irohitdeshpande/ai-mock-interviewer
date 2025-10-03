import { google } from '@ai-sdk/google';
import { generateText, streamText, generateObject } from 'ai';
import { z } from 'zod';

// Initialize the Google AI provider
// The API key will be read from GOOGLE_GENERATIVE_AI_API_KEY environment variable automatically
// Make sure GOOGLE_GENERATIVE_AI_API_KEY is set in your environment
export const model = google('models/gemini-1.5-flash');

// Basic text generation
export async function generateAIText(prompt: string) {
  try {
    const { text } = await generateText({
      model,
      prompt,
    });
    return text;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

// Streaming text generation (useful for real-time responses)
export async function streamAIText(prompt: string) {
  try {
    const { textStream } = await streamText({
      model,
      prompt,
    });
    return textStream;
  } catch (error) {
    console.error('Error streaming text:', error);
    throw error;
  }
}

// Generate structured data with Zod schema
export async function generateStructuredData<T>(
  prompt: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const { object } = await generateObject({
      model,
      prompt,
      schema,
    });
    return object;
  } catch (error) {
    console.error('Error generating structured data:', error);
    throw error;
  }
}

// Example: Generate interview questions
export async function generateInterviewQuestions(
  jobTitle: string,
  experience: string,
  skills: string[]
) {
  const prompt = `Generate 5 technical interview questions for a ${jobTitle} position with ${experience} years of experience. Focus on skills: ${skills.join(', ')}. Make questions challenging but fair.`;
  
  return await generateAIText(prompt);
}