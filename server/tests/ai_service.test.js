import { aiService } from '../src/services/ai/AIProviderFactory.js';

export const runAITests = async () => {
  console.log('[TEST] Executing AI Generation Test...');
  const genResult = await aiService.generateQuestions({
    targetRole: 'Software Development Engineer',
    topics: ['Data Structures & Algorithms', 'Database Management Systems'],
    difficulty: 'Medium',
    interviewType: 'Technical',
    experienceLevel: 'Entry-Level',
    questionCount: 3,
  });

  if (!genResult.questions || genResult.questions.length !== 3) {
    throw new Error('AI Generation failed to generate 3 questions');
  }

  console.log('[TEST] Executing AI Evaluation Test...');
  const sampleQ = genResult.questions[0];
  const evalResult = await aiService.evaluateAnswer({
    questionText: sampleQ.questionText,
    referenceConcepts: sampleQ.referenceConcepts,
    evaluationCriteria: sampleQ.evaluationCriteria,
    candidateAnswer: 'Separate chaining resolves collisions, converting to Red-Black trees at 8 nodes.',
    topic: sampleQ.topic,
  });

  if (typeof evalResult.overallScore !== 'number') {
    throw new Error('AI Evaluation did not return a numeric overallScore');
  }

  console.log('[TEST] All AI service integration tests passed successfully.');
};

runAITests().catch((err) => {
  console.error('[TEST FAIL]', err);
  process.exit(1);
});
