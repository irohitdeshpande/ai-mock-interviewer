# VAPI Voice AI Integration Setup

This guide will help you set up the VAPI voice AI interviewer for the AI Mock Interviewer application.

## Prerequisites

1. Sign up for a VAPI account at [vapi.ai](https://vapi.ai)
2. Have your Firebase and Clerk credentials ready

## Step 1: Get VAPI Credentials

### 1.1 Get Your Public Key
1. Log in to your VAPI dashboard at https://dashboard.vapi.ai
2. Navigate to **Settings** → **API Keys**
3. Copy your **Public Key** (starts with `pk_`)
4. Save this for the `.env` file

### 1.2 Create Your Assistant

1. In the VAPI dashboard, go to **Assistants**
2. Click **"Create New Assistant"**
3. Configure your assistant with these settings:

#### Basic Settings:
- **Name**: AI Mock Interviewer
- **First Message**: "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience."

#### Voice Settings:
- **Provider**: 11Labs
- **Voice**: Sarah (or your preference)
- **Stability**: 0.4
- **Similarity Boost**: 0.8
- **Speed**: 0.9
- **Style**: 0.5
- **Speaker Boost**: Enabled

#### Transcriber Settings:
- **Provider**: Deepgram
- **Model**: Nova 2
- **Language**: English (en)

#### Model Settings:
- **Provider**: OpenAI
- **Model**: GPT-4

#### System Prompt:
```
You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
- Follow the structured question flow provided in the context
- Engage naturally & react appropriately
- Listen actively to responses and acknowledge them before moving forward
- Ask brief follow-up questions if a response is vague or requires more detail
- Keep the conversation flowing smoothly while maintaining control

Be professional, yet warm and welcoming:
- Use official yet friendly language
- Keep responses concise and to the point (like in a real voice interview)
- Avoid robotic phrasing—sound natural and conversational

Answer the candidate's questions professionally:
- If asked about the role, company, or expectations, provide a clear and relevant answer
- If unsure, redirect the candidate to HR for more details

Conclude the interview properly:
- Thank the candidate for their time
- Inform them that the company will reach out soon with feedback
- End the conversation on a polite and positive note
```

4. Click **"Create"** or **"Save"**
5. Copy the **Assistant ID** (looks like `a3cd1881-...`)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your VAPI credentials:
   ```env
   # VAPI Voice AI Configuration
   VITE_VAPI_PUBLIC_KEY=pk_your_public_key_here
   VITE_VAPI_ASSISTANT_ID=your_assistant_id_here
   ```

3. Make sure all other required environment variables are set (Gemini, Clerk, Firebase)

## Step 3: Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to an interview:
   - Go to the interview dashboard
   - Create or select an interview
   - Click the "Start" button to go to the interview screen

3. Click "Start Interview" to begin the voice AI interview

4. Verify that:
   - The microphone access is requested
   - The AI interviewer starts speaking
   - Your voice is being captured
   - The conversation flows naturally

## Step 4: Test in VAPI Playground (Optional)

Before integrating, you can test your assistant in VAPI's playground:

1. Go to your assistant in the VAPI dashboard
2. Click **"Test"** or **"Playground"**
3. Start a test call
4. Verify the assistant responds professionally
5. Check that the voice quality and latency are acceptable

## Troubleshooting

### Error: "VAPI_PUBLIC_KEY is not configured"
- Ensure your `.env` file has the correct `VITE_VAPI_PUBLIC_KEY` value
- Restart the development server after changing `.env`

### Error: "VAPI_ASSISTANT_ID is not configured"
- Ensure your `.env` file has the correct `VITE_VAPI_ASSISTANT_ID` value
- Restart the development server after changing `.env`

### Assistant doesn't respond or speaks incorrectly
- Check your assistant configuration in the VAPI dashboard
- Verify the system prompt is correctly set
- Test the assistant in VAPI's playground first

### Voice quality issues
- Check your internet connection (voice AI requires stable connection)
- Try adjusting voice settings in the VAPI assistant configuration
- Test with different voice providers or models

### Microphone not working
- Ensure browser has microphone permissions
- Check browser console for errors
- Try a different browser (Chrome works best)

### Interview feedback not saving
- Check Firebase configuration
- Verify user is authenticated (Clerk)
- Check browser console for errors

## Cost Considerations

VAPI charges based on:
- Number of minutes of voice conversation
- Voice provider costs (11Labs, etc.)
- Model provider costs (OpenAI GPT-4)

Check VAPI's pricing page for current rates: https://vapi.ai/pricing

## Security Best Practices

1. **Never commit** your `.env` file to version control
2. Use environment variables for all sensitive keys
3. Rotate your API keys regularly
4. Set up proper CORS and domain restrictions in VAPI dashboard
5. Monitor your VAPI usage to detect unusual activity

## Additional Resources

- [VAPI Documentation](https://docs.vapi.ai)
- [VAPI Discord Community](https://discord.gg/vapi)
- [VAPI API Reference](https://docs.vapi.ai/api-reference)
- [11Labs Voice Library](https://elevenlabs.io/voice-library)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review VAPI documentation
3. Check browser console for errors
4. Join VAPI Discord for community support
5. Contact VAPI support for account-specific issues
