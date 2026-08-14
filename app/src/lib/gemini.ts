import { GoogleGenAI } from '@google/genai';

/**
 * Lazily initialize or retrieve GoogleGenAI instance with current environment variables
 */
export function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  return new GoogleGenAI(apiKey ? { apiKey } : {});
}

/**
 * Proxy wrapper so `ai.models.generateContent` and `ai.models.generateContentStream` 
 * always resolve dynamically with the latest API key.
 */
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    const instance = getGenAI();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});
