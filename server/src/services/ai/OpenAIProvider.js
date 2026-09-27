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

    const { questionText, referenceConcepts = [], evaluationCriteria = [], candidateAnswer = '', topic = '' } = data;

    const prompt = `
You are an expert technical interviewer evaluating a student's answer in a technical interview.

QUESTION: "${questionText}"
TOPIC: "${topic}"
EXPECTED CORE CONCEPTS: ${JSON.stringify(referenceConcepts)}
CRITERIA: ${JSON.stringify(evaluationCriteria)}

STUDENT'S SUBMITTED TRANSCRIPT:
"${candidateAnswer}"

EVALUATION RULES:
1. Base your evaluation strictly on the ACTUAL QUESTION asked.
2. Evaluate semantic meaning: If the student explains the concept correctly using their own words or acceptable alternative phrasing, award high marks. Do not penalize for not using exact keyword matches.
3. If the answer is completely irrelevant, nonsensical, or evasive ("I don't know"), assign low scores (0-2/10).
4. Score dimensions on a 0 to 10 scale:
   - Relevance (0-10)
   - Correctness (0-10)
   - Completeness (0-10)
   - Technical Accuracy (0-10)
   - Quality (0-10)

Respond ONLY with valid JSON:
{
  "scoreOutOf10": 8,
  "overallScore": 80,
  "criteriaScores": {
    "relevance": 9,
    "correctness": 8,
    "completeness": 7,
    "technicalAccuracy": 8,
    "quality": 8,
    "technicalCorrectness": 32,
    "clarity": 16
  },
  "correctPoints": ["What was explained correctly"],
  "missingPoints": ["Important concepts not mentioned"],
  "incorrectPoints": ["Any technically incorrect statements"],
  "improvement": "How the student could improve the answer",
  "feedback": "Concise summary critique",
  "improvedAnswer": "Model exemplar answer"
}
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
          { role: 'system', content: 'You are a professional technical interviewer. Output valid JSON only.' },
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

    const scoreOutOf10 = typeof parsed.scoreOutOf10 === 'number'
      ? Math.max(0, Math.min(10, Math.round(parsed.scoreOutOf10)))
      : Math.round((parsed.overallScore || 70) / 10);

    const overallScore = typeof parsed.overallScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.overallScore)))
      : scoreOutOf10 * 10;

    const correctPoints = Array.isArray(parsed.correctPoints) && parsed.correctPoints.length > 0
      ? parsed.correctPoints
      : (Array.isArray(parsed.correctConcepts) ? parsed.correctConcepts : ['Demonstrated relevant knowledge']);

    const missingPoints = Array.isArray(parsed.missingPoints)
      ? parsed.missingPoints
      : (Array.isArray(parsed.missingConcepts) ? parsed.missingConcepts : []);

    const incorrectPoints = Array.isArray(parsed.incorrectPoints)
      ? parsed.incorrectPoints
      : (Array.isArray(parsed.mistakes) ? parsed.mistakes : []);

    return {
      ...parsed,
      scoreOutOf10,
      overallScore,
      criteriaScores: {
        relevance: parsed.criteriaScores?.relevance ?? scoreOutOf10,
        correctness: parsed.criteriaScores?.correctness ?? scoreOutOf10,
        completeness: parsed.criteriaScores?.completeness ?? Math.max(1, scoreOutOf10 - 1),
        technicalAccuracy: parsed.criteriaScores?.technicalAccuracy ?? scoreOutOf10,
        quality: parsed.criteriaScores?.quality ?? scoreOutOf10,
        technicalCorrectness: parsed.criteriaScores?.technicalCorrectness ?? Math.round(scoreOutOf10 * 4),
        clarity: parsed.criteriaScores?.clarity ?? Math.round(scoreOutOf10 * 2),
      },
      correctPoints,
      missingPoints,
      incorrectPoints,
      correctConcepts: correctPoints,
      missingConcepts: missingPoints,
      mistakes: incorrectPoints,
      improvement: parsed.improvement || 'Incorporate real-world examples and trade-offs.',
      feedback: parsed.feedback || parsed.explanation || 'Solid response.',
      improvedAnswer: parsed.improvedAnswer || '',
      isFallback: false,
      provider: 'openai',
    };
  }

  async transcribeAudio(data) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }
    const { audioBase64 } = data;
    if (!audioBase64) {
      throw new Error('No audio data provided.');
    }

    const base64Data = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.+_-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI transcription error: ${err.slice(0, 200)}`);
    }

    const dataRes = await response.json();
    return {
      transcript: dataRes.text?.trim() || '',
      provider: 'openai',
      isFallback: false,
    };
  }
}
