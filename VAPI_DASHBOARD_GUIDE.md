# How to Configure Your VAPI Assistant - Step by Step

## 🚀 Quick Steps Overview
1. Login to VAPI Dashboard
2. Find your existing assistant
3. Copy the JSON configuration
4. Paste and save
5. Test the assistant

---

## 📋 Detailed Instructions

### Step 1: Access VAPI Dashboard
1. Go to **[https://vapi.ai](https://vapi.ai)** in your browser
2. Click **"Login"** or **"Sign In"**
3. Enter your VAPI account credentials

### Step 2: Navigate to Your Assistant
1. Once logged in, look for **"Assistants"** in the main navigation
2. Find your assistant with ID: `a3cd1881-f8fa-430b-b356-c51de74b82f9`
   - It might be listed as "AI Mock Interviewer" or similar
   - If you can't find it, look for any assistant you created

### Step 3: Edit Assistant Configuration
1. Click on your assistant to open it
2. Look for an **"Edit"** button or **"Configure"** option
3. You'll see a configuration interface with different sections

### Step 4: Update the Configuration
You have two options here:

#### Option A: Use the Visual Interface (Recommended)
1. **Basic Settings:**
   - Name: `AI Mock Interviewer`
   - First Message: `Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.`

2. **Voice Settings:**
   - Provider: `11Labs` (or `ElevenLabs`)
   - Voice: `Sarah`
   - Stability: `0.4`
   - Similarity Boost: `0.8`
   - Speed: `0.9`
   - Style: `0.5`
   - Speaker Boost: ✅ Enabled

3. **Transcriber Settings:**
   - Provider: `Deepgram`
   - Model: `nova-2`
   - Language: `en`

4. **Model Settings:**
   - Provider: `OpenAI`
   - Model: `gpt-4`
   - System Message: Copy the entire system content from the JSON below

#### Option B: Use JSON Configuration (Advanced)
1. Look for a **"JSON"** tab or **"Raw Configuration"** option
2. Replace the entire content with this JSON:

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

### Step 5: Save Configuration
1. Click **"Save"** or **"Update Assistant"**
2. Wait for confirmation that the assistant was saved successfully

### Step 6: Test Your Assistant
1. Look for a **"Test"** or **"Playground"** button
2. Click it to open the test interface
3. Try speaking to your assistant to verify it works
4. Make sure it responds professionally like an interviewer

---

## 🔍 What to Look For

### ✅ Success Indicators:
- Assistant responds with professional interviewer tone
- Voice sounds natural (Sarah from 11Labs)
- Transcription is accurate
- Assistant asks questions one at a time
- Keeps responses concise

### ❌ Common Issues:
- **"Assistant not found"**: Create a new assistant if yours is missing
- **"Insufficient credits"**: Add credits to your VAPI account
- **"Voice not working"**: Check if 11Labs is enabled in your account
- **"Model errors"**: Ensure you have access to GPT-4

---

## 🆘 If You Can't Find Your Assistant

If you can't find assistant ID `a3cd1881-f8fa-430b-b356-c51de74b82f9`:

### Create New Assistant:
1. Click **"Create New Assistant"** or **"+ Assistant"**
2. Use the configuration above
3. Copy the new Assistant ID
4. Update your `.env` file:
   ```
   VITE_VAPI_ASSISTANT_ID=your_new_assistant_id_here
   ```

---

## 🎯 After Configuration

Once you've configured your assistant:

1. **Test in VAPI Dashboard**: Use the playground to verify it works
2. **Test in Your App**: Go back to your interview app and try "Start Interview"
3. **Check Console**: Open browser console (F12) to see detailed logs
4. **Verify Everything**: Voice, transcription, and professional behavior

Your assistant should now act as a professional interviewer with natural conversation flow!