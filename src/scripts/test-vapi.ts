import { vapiService } from '../services/vapi.service';

// Test VAPI initialization and configuration
export const testVapiSetup = async () => {
  console.log('🧪 Testing VAPI Setup...');
  
  // Check if VAPI is available
  const isAvailable = vapiService.isVapiAvailable();
  console.log('📦 VAPI Available:', isAvailable);
  
  // Get current call state
  const callState = vapiService.getCallState();
  console.log('📊 Call State:', callState);
  
  // Test configuration
  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
  
  console.log('🔑 Environment Check:');
  console.log('  - Public Key:', publicKey ? '✅ Set' : '❌ Missing');
  console.log('  - Assistant ID:', assistantId ? '✅ Set' : '❌ Missing');
  
  if (!publicKey || !assistantId) {
    console.warn('⚠️ Please set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in your .env file');
    return false;
  }
  
  return true;
};

// Test interview context creation
export const createTestInterviewContext = () => {
  return {
    interviewId: 'test-interview',
    position: 'Frontend Developer',
    company: 'Tech Corp',
    experience: 3,
    questions: [
      { question: 'Tell me about yourself', answer: '' },
      { question: 'What interests you about this role?', answer: '' },
      { question: 'Describe a challenging project you worked on', answer: '' }
    ],
    currentQuestionIndex: 0
  };
};

// Run all tests
export const runVapiTests = async () => {
  console.log('🚀 Running VAPI Tests...\n');
  
  const setupOk = await testVapiSetup();
  if (!setupOk) {
    console.log('❌ Setup test failed');
    return;
  }
  
  const testContext = createTestInterviewContext();
  console.log('✅ Test context created:', testContext);
  
  console.log('\n📋 Ready to test interview flow!');
  console.log('💡 Go to your interview page and click "Start Interview" to test');
};

// Export for use in console
if (typeof window !== 'undefined') {
  (window as { testVapi?: typeof runVapiTests }).testVapi = runVapiTests;
  console.log('💡 Run testVapi() in console to test VAPI setup');
}