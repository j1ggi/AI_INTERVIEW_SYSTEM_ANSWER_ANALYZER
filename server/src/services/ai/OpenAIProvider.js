import { AIProvider } from './AIProvider.js';
import { buildQuestionGenerationPrompt } from './prompts/questionPrompts.js';
import { cleanAndParseJSON, validateQuestionsSchema } from './jsonParser.js';

export class OpenAIProvider extends AIProvider {
  constructor(apiKey, model = 'gpt-4o-mini') {
    super('openai');
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateQuestions(config) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    const prompt = buildQuestionGenerationPrompt(config);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert technical interviewer. Output valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    const parsed = cleanAndParseJSON(rawText);
    const questions = validateQuestionsSchema(parsed);

    return {
      questions,
      provider: 'openai',
      isFallback: false,
      model: this.model,
    };
  }

  async evaluateAnswer(data) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    const prompt = `
Evaluate the candidate answer for question: "${data.questionText}".
Reference concepts: ${JSON.stringify(data.referenceConcepts)}.
Candidate answer: "${data.candidateAnswer}".
Return valid JSON with overallScore (0-100), criteriaScores { technicalCorrectness, relevance, completeness, clarity }, correctConcepts, missingConcepts, mistakes, explanation, feedback, improvedAnswer.
`.trim();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a technical bar raiser. Respond with valid JSON matching the requested evaluation rubric.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI evaluation error: ${err.slice(0, 200)}`);
    }

    const dataRes = await response.json();
    const parsed = cleanAndParseJSON(dataRes?.choices?.[0]?.message?.content);

    return {
      ...parsed,
      isFallback: false,
      provider: 'openai',
    };
  }
}
