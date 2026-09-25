import { AIProvider } from './AIProvider.js';
import { FALLBACK_QUESTION_BANK } from './FallbackQuestionBank.js';

export class FallbackProvider extends AIProvider {
  constructor() {
    super('fallback');
  }

  async generateQuestions(config) {
    const { topics = [], difficulty = 'Medium', questionCount = 5, interviewType = 'Technical' } = config;

    // 1. Filter questions by matching topic & difficulty
    let matched = FALLBACK_QUESTION_BANK.filter((q) => {
      const topicMatches = topics.length === 0 || topics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(q.topic.toLowerCase()));
      const diffMatches = q.difficulty.toLowerCase() === difficulty.toLowerCase();
      return topicMatches && diffMatches;
    });

    // 2. If insufficient, match by topic across all difficulties
    if (matched.length < questionCount) {
      const topicFallbacks = FALLBACK_QUESTION_BANK.filter(
        (q) => !matched.includes(q) && (topics.length === 0 || topics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase())))
      );
      matched = [...matched, ...topicFallbacks];
    }

    // 3. If still insufficient, fill with general technical/behavioral pool
    if (matched.length < questionCount) {
      const remainingPool = FALLBACK_QUESTION_BANK.filter((q) => !matched.includes(q));
      matched = [...matched, ...remainingPool];
    }

    // 4. Shuffle selection
    const shuffled = [...matched].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);

    const questions = selected.map((q, idx) => ({
      orderIndex: idx,
      questionText: q.questionText,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type || interviewType,
      referenceConcepts: q.referenceConcepts,
      evaluationCriteria: q.evaluationCriteria,
    }));

    return {
      questions,
      provider: 'fallback',
      isFallback: true,
      message: 'Generated via Curated Technical Placement Question Bank (Offline Fallback)',
    };
  }

  async evaluateAnswer(data) {
    const { questionText, referenceConcepts = [], candidateAnswer = '' } = data;
    const answer = (candidateAnswer || '').trim();

    if (!answer || answer.length < 15) {
      return {
        overallScore: 20,
        criteriaScores: {
          technicalCorrectness: 5,
          relevance: 5,
          completeness: 5,
          clarity: 5,
        },
        correctConcepts: [],
        missingConcepts: referenceConcepts,
        mistakes: ['The submitted response was either blank or too brief to evaluate technical proficiency.'],
        explanation: 'A comprehensive technical answer requires explaining core concepts, trade-offs, and examples.',
        feedback: 'Provide a structured explanation stating definitions, implementation mechanics, and edge cases.',
        improvedAnswer: `A strong answer should touch upon: ${referenceConcepts.join(', ')}.`,
        recommendedTopics: [data.topic || 'Core CS'],
        isFallback: true,
      };
    }

    // Heuristic conceptual overlap
    const lowerAnswer = answer.toLowerCase();
    const identified = [];
    const missing = [];

    referenceConcepts.forEach((concept) => {
      const keywords = concept.toLowerCase().split(/[\s,()\/]+/).filter((k) => k.length > 2);
      const matches = keywords.some((kw) => lowerAnswer.includes(kw));
      if (matches) {
        identified.push(concept);
      } else {
        missing.push(concept);
      }
    });

    const coverageRatio = referenceConcepts.length > 0 ? identified.length / referenceConcepts.length : 0.7;
    const lengthBonus = Math.min(answer.split(/\s+/).length / 50, 1.0); // Reward answers of 50+ words

    // 4-Tier Rubric Scoring: Technical 40%, Relevance 20%, Completeness 20%, Clarity 20%
    const techScore = Math.round(Math.min(40, coverageRatio * 32 + lengthBonus * 8));
    const relScore = Math.round(Math.min(20, coverageRatio > 0.3 ? 18 : 10));
    const compScore = Math.round(Math.min(20, coverageRatio * 16 + lengthBonus * 4));
    const clarScore = Math.round(Math.min(20, answer.length > 80 ? 18 : 12));
    const overallScore = Math.min(100, Math.max(25, techScore + relScore + compScore + clarScore));

    return {
      overallScore,
      criteriaScores: {
        technicalCorrectness: techScore,
        relevance: relScore,
        completeness: compScore,
        clarity: clarScore,
      },
      correctConcepts: identified.length > 0 ? identified : ['Demonstrated basic familiarity with question context'],
      missingConcepts: missing.length > 0 ? missing : ['Further exploration of distributed trade-offs'],
      mistakes: missing.length > 0 ? [`Did not explicitly detail: ${missing.slice(0, 2).join('; ')}`] : [],
      explanation: `Your answer achieved ${overallScore}/100. It addressed ${identified.length} of ${referenceConcepts.length} expected core concepts.`,
      feedback: missing.length > 0 
        ? `To strengthen your answer in real placement rounds, explicitly discuss ${missing.join(', ')}.`
        : 'Good technical clarity and solid conceptual grasp.',
      improvedAnswer: `Exemplar Response: When asked this question, structure your response as: 1) Core Definition: Define the mechanism. 2) Key Concepts: Incorporate ${referenceConcepts.join(', ')}. 3) Trade-offs & Complexity: Discuss time/space implications.`,
      recommendedTopics: missing.length > 0 ? [data.topic || 'System Design'] : [],
      isFallback: true,
    };
  }
}
