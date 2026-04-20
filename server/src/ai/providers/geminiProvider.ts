import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '../systemPrompt';
import { sanitizeInput } from '../../utils/sanitizeInput';
import { AIProvider } from '../types';
import { ChatMessage } from '../../types/chat';
import { formatConversation } from '../formatConversation';
import { detectCategory } from '../detectCategory';
import { retryWithBackoff } from '../retrywithBackoff';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite';

function buildPrompt(userInput: string, history: ChatMessage[]) {
  const cleanedInput = sanitizeInput(userInput);
  const category = detectCategory(cleanedInput);
  const conversation = formatConversation(history);

  return `
Category: ${category}

Conversation so far:
${conversation}

Latest user message:
${cleanedInput}

Please respond as Friend in a Pocket.
Use the preferred response structure and keep the answer emotionally intelligent, psychologically informed, non-diagnostic, and clear.
`;
}

async function generateWithModel(model: string, prompt: string) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 700,
    },
  });

  return response.text?.trim() || 'I’m sorry, I could not generate a response right now.';
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }

  return undefined;
}

export const geminiProvider: AIProvider = {
  async generateReply(userInput: string, history: ChatMessage[] = []) {
    const cleanedInput = sanitizeInput(userInput);

    if (!cleanedInput) {
      return 'I did not receive a valid message. Please try again with a little more detail.';
    }

    const prompt = buildPrompt(cleanedInput, history);

    try {
      return await retryWithBackoff(
        () => generateWithModel(PRIMARY_MODEL, prompt),
        {
          maxAttempts: 4,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
        }
      );
    } catch (primaryError) {
      const status = getErrorStatus(primaryError);

      if (status === 429 || status === 500 || status === 503) {
        console.warn(
          `Primary model ${PRIMARY_MODEL} failed with ${status}. Trying fallback model ${FALLBACK_MODEL}.`
        );

        return await retryWithBackoff(
          () => generateWithModel(FALLBACK_MODEL, prompt),
          {
            maxAttempts: 3,
            initialDelayMs: 1200,
            maxDelayMs: 10000,
          }
        );
      }

      throw primaryError;
    }
  },
};