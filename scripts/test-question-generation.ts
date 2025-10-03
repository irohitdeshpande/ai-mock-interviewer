/**
 * Test script for the enhanced question generation service
 */

import { questionGenerationService } from '../src/services/question-generation.service';

// Test data
const testFormData = {
  position: "Senior Software Engineer",
  company: "Tech Innovations Inc",
  description: "We are looking for a senior software engineer to join our team and work on cutting-edge web applications.",
  experience: 5,
  techStack: "React, TypeScript, Node.js, PostgreSQL, AWS",
  whyJoinUs: "We offer competitive salary, remote work flexibility, and opportunities to work on innovative projects that impact millions of users."
};

async function testQuestionGeneration() {
  console.log('🚀 Testing Enhanced Question Generation Service...\n');
  console.log('Test Data:', JSON.stringify(testFormData, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    console.log('📋 Generating questions...');
    const startTime = Date.now();
    
    const questions = await questionGenerationService.generateQuestions(testFormData);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Questions generated successfully in ${duration}ms\n`);
    console.log(`📊 Generated ${questions.length} questions:\n`);
    
    questions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.question}`);
      console.log(`   Answer Preview: ${q.answer.substring(0, 100)}...`);
      console.log('');
    });

    // Test enhanced format
    console.log('\n' + '='.repeat(50));
    console.log('🔍 Testing Enhanced Question Format...\n');
    
    const enhancedQuestions = await questionGenerationService.generateEnhancedQuestions(testFormData);
    
    console.log('✅ Enhanced format test successful!');
    console.log(`📊 Total Interview Time: ${enhancedQuestions.totalEstimatedTime} seconds`);
    console.log('📋 Interview Structure:', enhancedQuestions.interviewStructure);
    
    console.log('\n🎯 Sample Enhanced Question:');
    const sampleQuestion = enhancedQuestions.questions[0];
    console.log(`Category: ${sampleQuestion.category}`);
    console.log(`Difficulty: ${sampleQuestion.difficulty}`);
    console.log(`Duration: ${sampleQuestion.expectedDuration}s`);
    console.log(`Question: ${sampleQuestion.question}`);
    console.log(`Follow-up Hints: ${sampleQuestion.followUpHints.join(', ')}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Test fallback functionality
    console.log('\n🔄 Testing fallback mechanism...');
    try {
      // This should trigger fallback since API might not be available
      const fallbackQuestions = await questionGenerationService.generateQuestions({
        ...testFormData,
        position: "fallback-test"
      });
      
      console.log(`✅ Fallback worked! Generated ${fallbackQuestions.length} questions`);
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
}

// Run the test
testQuestionGeneration().then(() => {
  console.log('\n✨ Testing completed!');
}).catch(error => {
  console.error('💥 Test runner failed:', error);
});