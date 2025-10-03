# Quick Start Guide - VAPI Voice AI Interview

This guide will help you get started with the voice AI interviewer feature in just 5 minutes!

## Prerequisites

- Node.js installed (v16 or higher)
- A VAPI account ([sign up here](https://vapi.ai))
- Gemini API key
- Clerk account for authentication
- Firebase project for database

## 5-Minute Setup

### Step 1: Clone and Install (1 minute)

```bash
git clone https://github.com/irohitdeshpande/ai-mock-interviewer.git
cd ai-mock-interviewer
npm install
```

### Step 2: Configure Environment (2 minutes)

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Add your credentials to `.env`:
```env
# Required for AI features
VITE_GEMINI_API_KEY=your_gemini_key_here

# Required for authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here

# Required for database
VITE_FIREBASE_API_KEY=your_firebase_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Required for Voice AI (get from vapi.ai dashboard)
VITE_VAPI_PUBLIC_KEY=pk_your_public_key_here
VITE_VAPI_ASSISTANT_ID=your_assistant_id_here
```

### Step 3: Configure VAPI Assistant (2 minutes)

**Quick Configuration:**

1. Go to [vapi.ai/dashboard](https://dashboard.vapi.ai)
2. Click **"Create Assistant"**
3. Set these values:
   - **Name**: AI Mock Interviewer
   - **Voice Provider**: 11Labs
   - **Voice**: Sarah
   - **Model**: GPT-4
   - **First Message**: "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience."

4. Copy the **Assistant ID** (looks like `a3cd1881-...`)
5. Go to **Settings** → **API Keys** and copy your **Public Key** (starts with `pk_`)
6. Add both to your `.env` file

**Detailed Configuration:** See [VAPI_SETUP.md](VAPI_SETUP.md) for advanced settings.

### Step 4: Start the Application

```bash
npm run dev
```

Visit http://localhost:5173

## Using the Voice AI Interviewer

### Create Your First Interview

1. **Sign Up/Login** using Clerk authentication
2. **Create Interview** by clicking "New Interview"
3. Fill in the form:
   - Position (e.g., "Frontend Developer")
   - Company (e.g., "Google")
   - Description of role
   - Years of experience
   - Tech stack (e.g., "React, TypeScript, Node.js")
   - Why you want to join the company

4. Click **"Generate Interview"**

### Start Voice Interview

1. Navigate to your interview from the dashboard
2. Read the guidelines
3. Click the **"Start"** button (with sparkle icon)
4. You'll be redirected to the full-screen interview interface
5. Click **"Start Interview"** when ready
6. Grant microphone permission when prompted
7. The AI interviewer will greet you and begin asking questions

### During the Interview

- **Speak naturally** - the AI understands natural conversation
- **Take your time** - no rush, think before answering
- **Use controls**:
  - 🎤 Mute/Unmute microphone
  - 📹 Toggle webcam on/off
  - 📞 End interview when done

### After the Interview

1. The system will automatically:
   - Save the transcript
   - Generate AI feedback
   - Calculate ratings
   - Store everything in Firebase

2. You'll be redirected to the **Feedback Page** where you can see:
   - Overall performance rating
   - Detailed feedback per question
   - Strengths and areas for improvement
   - Comparison with expected answers

## Troubleshooting

### "VAPI service not initialized"
- Check that `VITE_VAPI_PUBLIC_KEY` is set in `.env`
- Restart the dev server after changing `.env`

### "Failed to start interview"
- Verify your VAPI assistant ID is correct
- Check VAPI dashboard for any account issues
- Ensure you have credits in your VAPI account

### Microphone not working
- Grant browser permission for microphone
- Check browser console for errors
- Try a different browser (Chrome recommended)

### No feedback generated
- Check that Gemini API key is valid
- Verify Firebase credentials are correct
- Check browser console for errors

## Tips for Best Results

### Interview Preparation
- Use a quiet environment
- Good internet connection (voice AI requires stable connection)
- Test your microphone before starting
- Review the questions beforehand

### During Interview
- Speak clearly and at normal pace
- Structure your answers (problem → solution → result)
- Give specific examples from your experience
- Don't worry about perfect grammar - be natural

### System Prompt Customization
The AI interviewer is configured with:
- Your job details (position, company, tech stack)
- All interview questions
- Professional interviewer guidelines
- Company-specific context

You can customize the interviewer's behavior by modifying the system prompt in `src/services/vapi.service.ts`.

## Cost Management

### VAPI Pricing
Voice AI interviews have costs:
- Per-minute conversation time
- Voice provider (11Labs)
- AI model (GPT-4)

**Estimated Cost:** ~$0.10-0.30 per interview (10-15 minutes)

### Free Alternatives for Testing
- Use GPT-3.5 instead of GPT-4 (cheaper)
- Use basic voice models (faster, cheaper)
- Test in VAPI playground first (free credits)

## Next Steps

### Learn More
- [VAPI_SETUP.md](VAPI_SETUP.md) - Detailed configuration guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details
- [README.md](README.md) - Full project documentation

### Get Help
- Check VAPI documentation: https://docs.vapi.ai
- Join VAPI Discord: https://discord.gg/vapi
- Report issues on GitHub

### Contribute
Have ideas to improve the voice AI interviewer? We'd love your contributions!
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Success! 🎉

You're now ready to conduct realistic voice AI interviews. Practice as much as you need, review your feedback, and improve your interview skills!

**Happy Interviewing!** 🚀
