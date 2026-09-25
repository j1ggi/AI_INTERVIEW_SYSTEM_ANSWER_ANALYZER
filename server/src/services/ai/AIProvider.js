/**
 * Abstract Base Class for AI Providers in MockVue
 * Follows the Strategy Pattern to decouple LLM APIs from business logic.
 */
export class AIProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Generates a structured list of interview questions.
   * @param {Object} config
   * @param {string} config.targetRole
   * @param {string[]} config.topics
   * @param {string} config.difficulty - Easy | Medium | Hard
   * @param {string} config.interviewType - Technical | HR | Behavioral | Mixed
   * @param {string} config.experienceLevel - Entry-Level | Junior | Mid-Level | Senior
   * @param {number} config.questionCount - Total questions to generate
   * @returns {Promise<{ questions: Array, provider: string, isFallback: boolean }>}
   */
  async generateQuestions(config) {
    throw new Error('generateQuestions() must be implemented by concrete AI provider');
  }

  /**
   * Evaluates a candidate's answer against reference criteria.
   * @param {Object} data
   * @param {string} data.questionText
   * @param {string[]} data.referenceConcepts
   * @param {string[]} data.evaluationCriteria
   * @param {string} data.candidateAnswer
   * @returns {Promise<{ overallScore: number, criteriaScores: Object, feedback: string, improvedAnswer: string, isFallback: boolean }>}
   */
  async evaluateAnswer(data) {
    throw new Error('evaluateAnswer() must be implemented by concrete AI provider');
  }
}
