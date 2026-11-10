export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || 'anthropic/claude-haiku-4.5';

export class OpenRouterError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export async function fetchOpenRouter(url: string, init: RequestInit): Promise<Response> {
  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    throw new OpenRouterError(503, 'The AI service is not configured. Please contact the app owner.');
  }
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(60000) });
  if (!response.ok) {
    // Keep provider status in logs without logging prompts, secrets or responses.
    console.error(`[OpenRouter] request failed: HTTP ${response.status}; model=${OPENROUTER_MODEL}`);
    const messages: Record<number, string> = {
      401: 'The AI service credentials are invalid. Please contact the app owner.',
      402: 'The AI service has run out of credits. Please contact the app owner.',
      403: 'The AI service could not authorize this request. Please contact the app owner.',
      404: 'The configured AI model is unavailable. Please contact the app owner.',
      429: 'The AI service is busy. Please try again in a moment.',
    };
    throw new OpenRouterError(response.status, messages[response.status] ||
      'The AI service is temporarily unavailable. Please try again shortly.');
  }
  return response;
}

export function aiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof OpenRouterError ? error.message : fallback;
}
