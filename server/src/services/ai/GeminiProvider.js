import { AIProvider } from './AIProvider.js';
import { buildQuestionGenerationPrompt } from './prompts/questionPrompts.js';
import { cleanAndParseJSON, validateQuestionsSchema } from './jsonParser.js';

export class GeminiProvider extends AIProvider {
  constructor(apiKey, model = 'gemini-1.5-flash') {
    super('gemini');
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateQuestions(config) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const prompt = buildQuestionGenerationPrompt(config);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsed = cleanAndParseJSON(rawText);
    const questions = validateQuestionsSchema(parsed);

    return {
      questions,
      provider: 'gemini',
      isFallback: false,
      model: this.model,
    };
  }

  async evaluateAnswer(data) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const { questionText, referenceConcepts = [], evaluationCriteria = [], candidateAnswer = '', topic = '' } = data;

    const prompt = `
You are an expert technical interviewer evaluating a placement candidate's response.

INTERVIEW QUESTION:
"${questionText}"

TOPIC: "${topic}"

EXPECTED REFERENCE CONCEPTS:
${JSON.stringify(referenceConcepts)}

EVALUATION CRITERIA:
${JSON.stringify(evaluationCriteria)}

CANDIDATE'S SUBMITTED RESPONSE:
"${candidateAnswer}"

EVALUATION RUBRIC (Strict 0 to 100 Scale):
1. Technical Correctness (Max 40 points): Accuracy of algorithmic explanation and conceptual integrity.
2. Relevance (Max 20 points): Directly answers what was asked without dodging or filler.
3. Completeness (Max 20 points): Covers expected reference concepts, complexity, and edge cases.
4. Clarity & Structure (Max 20 points): Professional communication, terminology, and logical organization.

OUTPUT FORMAT:
Respond ONLY with valid JSON. Schema:
{
  "overallScore": 85,
  "criteriaScores": {
    "technicalCorrectness": 35,
    "relevance": 18,
    "completeness": 16,
    "clarity": 16
  },
  "correctConcepts": ["Concept A", "Concept B"],
  "missingConcepts": ["Concept C"],
  "mistakes": ["Identified misconception if any"],
  "explanation": "Concise summary of candidate performance",
  "feedback": "Actionable feedback for real interview rounds",
  "improvedAnswer": "An exemplary, gold-standard response for this question",
  "recommendedTopics": ["Topic to study"]
}
`.trim();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini evaluation error [${response.status}]: ${errBody.slice(0, 200)}`);
    }

    const resData = await response.json();
    const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = cleanAndParseJSON(rawText);

    return {
      ...parsed,
      isFallback: false,
      provider: 'gemini',
    };
  }
}
