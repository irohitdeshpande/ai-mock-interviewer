# VAPI Assistant Setup Guide

## Current Assistant Configuration

Your VAPI assistant should be configured as a professional interviewer. Here's the exact configuration you should use in your VAPI dashboard:

## Assistant Configuration (Copy this to VAPI Dashboard)

```json
{
  "name": "AI Mock Interviewer",
  "firstMessage": "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2",
    "language": "en"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "sarah",
    "stability": 0.4,
    "similarityBoost": 0.8,
    "speed": 0.9,
    "style": 0.5,
    "useSpeakerBoost": true
  },
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.\n\nInterview Guidelines:\n\nEngage naturally & react appropriately:\n- Listen actively to responses and acknowledge them before moving forward.\n- Ask brief follow-up questions if a response is vague or requires more detail.\n- Keep the conversation flowing smoothly while maintaining control.\n- Ask questions one at a time, wait for complete answers.\n\nBe professional, yet warm and welcoming:\n- Use official yet friendly language.\n- Keep responses concise and to the point (like in a real voice interview).\n- Avoid robotic phrasing—sound natural and conversational.\n- Don't rush through questions - give candidates time to think and respond.\n\nAnswer the candidate's questions professionally:\n- If asked about the role, company, or expectations, provide a clear and relevant answer.\n- If unsure, redirect the candidate to HR for more details.\n\nConclude the interview properly:\n- Thank the candidate for their time.\n- Inform them that the company will reach out soon with feedback.\n- End the conversation on a polite and positive note.\n\nImportant:\n- Be sure to be professional and polite.\n- Keep all your responses short and simple. Use official language, but be kind and welcoming.\n- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.\n- Wait for the candidate to finish speaking before responding.\n- Ask only one question at a time and wait for a complete response."
      }
    ]
  }
}
```

## Setup Steps

1. **Login to VAPI Dashboard**: Go to [vapi.ai](https://vapi.ai) and login
2. **Create/Edit Assistant**: Find your assistant with ID `a3cd1881-f8fa-430b-b356-c51de74b82f9`
3. **Copy Configuration**: Use the exact configuration above
4. **Test in Playground**: Test the assistant in VAPI's playground first
5. **Verify Credits**: Make sure you have sufficient credits

## Your Current Credentials

- **Public Key**: `bf1deada-f254-41fb-b2c7-46a831aaab52`
- **Assistant ID**: `a3cd1881-f8fa-430b-b356-c51de74b82f9`

## Troubleshooting

If you still get errors after configuring the assistant:

1. **Check Assistant Status**: Make sure it's "Active" in the dashboard
2. **Verify Credits**: Ensure you have sufficient credits
3. **Test Separately**: Try the assistant in VAPI playground first
4. **Check Console**: Look for detailed error messages in browser console

## Alternative: Create New Assistant

If the current assistant continues to have issues:

1. Create a new assistant in VAPI dashboard
2. Use the configuration above
3. Update the `VITE_VAPI_ASSISTANT_ID` in your `.env` file

The system will now try to use your pre-configured assistant first, and fall back to creating a dynamic configuration if needed.