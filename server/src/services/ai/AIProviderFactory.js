import { env } from '../../config/env.js';
import { GeminiProvider } from './GeminiProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { FallbackProvider } from './FallbackProvider.js';

class AIServiceManager {
  constructor() {
    this.fallbackProvider = new FallbackProvider();
    this.primaryProvider = this.resolvePrimaryProvider();
  }

  resolvePrimaryProvider() {
    const providerName = (env.AI_PROVIDER || 'fallback').toLowerCase();

    if (providerName === 'gemini' && env.AI_API_KEY) {
      console.log(`[AI] Initializing Google Gemini Provider (model: ${env.AI_MODEL})`);
      return new GeminiProvider(env.AI_API_KEY, env.AI_MODEL);
    }

    if (providerName === 'openai' && env.AI_API_KEY) {
      console.log(`[AI] Initializing OpenAI Provider (model: ${env.AI_MODEL || 'gpt-4o-mini'})`);
      return new OpenAIProvider(env.AI_API_KEY, env.AI_MODEL || 'gpt-4o-mini');
    }

    console.log('[AI] Running with Offline Curated Placement Question Bank (Fallback Mode)');
    return this.fallbackProvider;
  }

  /**
   * Resilient question generator with automatic timeout and fallback handling.
   */
  async generateQuestions(config) {
    if (this.primaryProvider && this.primaryProvider !== this.fallbackProvider) {
      try {
        console.log(`[AI] Dispatching question generation request to: ${this.primaryProvider.name}`);

        // Add 12-second timeout to prevent hanging UI
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out after 12s')), 12000)
        );

        const result = await Promise.race([
          this.primaryProvider.generateQuestions(config),
          timeoutPromise,
        ]);

        return result;
      } catch (err) {
        console.warn(`[AI WARN] Primary provider (${this.primaryProvider.name}) failed: ${err.message}. Engaging Fallback Question Bank...`);
      }
    }

    return await this.fallbackProvider.generateQuestions(config);
  }

  /**
   * Resilient answer evaluation with automatic fallback handling.
   */
  async evaluateAnswer(data) {
    if (this.primaryProvider && this.primaryProvider !== this.fallbackProvider) {
      try {
        console.log(`[AI] Dispatching answer evaluation to: ${this.primaryProvider.name}`);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI evaluation timed out after 12s')), 12000)
        );

        const result = await Promise.race([
          this.primaryProvider.evaluateAnswer(data),
          timeoutPromise,
        ]);

        return result;
      } catch (err) {
        console.warn(`[AI WARN] Primary evaluation failed: ${err.message}. Engaging heuristic fallback evaluation...`);
      }
    }

    return await this.fallbackProvider.evaluateAnswer(data);
  }

  /**
   * Resilient speech-to-text audio transcription.
   */
  async transcribeAudio(data) {
    if (this.primaryProvider && this.primaryProvider !== this.fallbackProvider && typeof this.primaryProvider.transcribeAudio === 'function') {
      try {
        console.log(`[AI] Dispatching audio transcription to: ${this.primaryProvider.name}`);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Audio transcription timed out after 20s')), 20000)
        );

        const result = await Promise.race([
          this.primaryProvider.transcribeAudio(data),
          timeoutPromise,
        ]);

        return result;
      } catch (err) {
        console.warn(`[AI WARN] Primary transcription (${this.primaryProvider.name}) failed: ${err.message}.`);
      }
    }

    return await this.fallbackProvider.transcribeAudio(data);
  }
}

export const aiService = new AIServiceManager();
