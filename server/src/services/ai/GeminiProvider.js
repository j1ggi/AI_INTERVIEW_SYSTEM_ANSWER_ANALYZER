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
You are an expert technical interviewer evaluating a student's answer in a technical interview.

INTERVIEW QUESTION:
"${questionText}"

TOPIC: "${topic}"

EXPECTED CORE CONCEPTS:
${JSON.stringify(referenceConcepts)}

EVALUATION CRITERIA:
${JSON.stringify(evaluationCriteria)}

STUDENT'S SUBMITTED TRANSCRIPT:
"${candidateAnswer}"

CRITICAL EVALUATION RULES:
1. Base your evaluation strictly on the ACTUAL QUESTION asked.
2. Evaluate semantic understanding: If the student explains the concept correctly using their own words or acceptable alternative phrasing, award high marks. Do NOT penalize for not using exact keyword matches.
   Example: If asked "What is inheritance in OOP?" and student says "Inheritance allows a child class to acquire properties and methods from a parent class", this is correct and should receive a high score (~8-9/10).
3. If the answer is completely irrelevant, nonsensical, evasive ("I don't know", random gibberish), assign low scores (0-2/10).
4. Evaluate these dimensions on a 0 to 10 scale:
   - Relevance (0-10): Does the answer actually answer the question?
   - Correctness (0-10): Are the statements factually and technically correct?
   - Completeness (0-10): Did the student cover the important concepts?
   - Technical Accuracy (0-10): Correct computer science terminology and mechanics.
   - Quality (0-10): Is the explanation logical and understandable?

OUTPUT FORMAT:
Respond ONLY with valid JSON.
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
  "correctPoints": [
    "What the student explained correctly"
  ],
  "missingPoints": [
    "Important concepts that were not mentioned"
  ],
  "incorrectPoints": [
    "Any technically incorrect statements (or empty if none)"
  ],
  "improvement": "Constructive advice on how the student could improve their answer",
  "feedback": "Concise summary critique of the answer",
  "improvedAnswer": "Gold-standard model answer for this specific question"
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

    const scoreOutOf10 = typeof parsed.scoreOutOf10 === 'number'
      ? Math.max(0, Math.min(10, Math.round(parsed.scoreOutOf10)))
      : Math.round((parsed.overallScore || 70) / 10);

    const overallScore = typeof parsed.overallScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.overallScore)))
      : scoreOutOf10 * 10;

    const correctPoints = Array.isArray(parsed.correctPoints) && parsed.correctPoints.length > 0
      ? parsed.correctPoints
      : (Array.isArray(parsed.correctConcepts) ? parsed.correctConcepts : ['Demonstrated foundational understanding of the concept']);

    const missingPoints = Array.isArray(parsed.missingPoints)
      ? parsed.missingPoints
      : (Array.isArray(parsed.missingConcepts) ? parsed.missingConcepts : []);

    const incorrectPoints = Array.isArray(parsed.incorrectPoints)
      ? parsed.incorrectPoints
      : (Array.isArray(parsed.mistakes) ? parsed.mistakes : []);

    const criteriaScores = {
      relevance: parsed.criteriaScores?.relevance ?? scoreOutOf10,
      correctness: parsed.criteriaScores?.correctness ?? scoreOutOf10,
      completeness: parsed.criteriaScores?.completeness ?? Math.max(1, scoreOutOf10 - 1),
      technicalAccuracy: parsed.criteriaScores?.technicalAccuracy ?? scoreOutOf10,
      quality: parsed.criteriaScores?.quality ?? scoreOutOf10,
      technicalCorrectness: parsed.criteriaScores?.technicalCorrectness ?? Math.round(scoreOutOf10 * 4),
      clarity: parsed.criteriaScores?.clarity ?? Math.round(scoreOutOf10 * 2),
    };

    return {
      ...parsed,
      scoreOutOf10,
      overallScore,
      criteriaScores,
      correctPoints,
      missingPoints,
      incorrectPoints,
      correctConcepts: correctPoints,
      missingConcepts: missingPoints,
      mistakes: incorrectPoints,
      improvement: parsed.improvement || 'Elaborate on edge cases and provide code examples.',
      feedback: parsed.feedback || parsed.explanation || 'Good effort on the explanation.',
      improvedAnswer: parsed.improvedAnswer || '',
      isFallback: false,
      provider: 'gemini',
    };
  }

  async transcribeAudio(data) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured.');
    }
    const { audioBase64, mimeType = 'audio/webm' } = data;
    if (!audioBase64) {
      throw new Error('No audio data provided for transcription.');
    }

    const base64Data = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.+_-]+;base64,/, '');
    const cleanMime = mimeType.split(';')[0] || 'audio/webm';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: cleanMime,
                  data: base64Data,
                },
              },
              {
                text: "You are an expert speech-to-text transcription engine. Transcribe the candidate's speech accurately word-for-word. Capture Indian English pronunciation and technical terms accurately (e.g. JavaScript, React, Node.js, Express, MongoDB, SQL, OOP, inheritance, polymorphism, encapsulation, abstraction, API, REST, async/await, recursion, Big O). Do not skip words or sentences during pauses. Return ONLY the verbatim transcribed text without any timestamps or explanations.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini transcription error [${response.status}]: ${errBody.slice(0, 200)}`);
    }

    const resData = await response.json();
    const transcript = resData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return {
      transcript,
      provider: 'gemini',
      isFallback: false,
    };
  }
}
