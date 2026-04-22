import { ChatMessage } from '../../types/chat';
import { StoredOnboardingProfile } from '../../types/shared';
import { buildSystemPrompt } from '../buildSystemPrompt';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MODEL = "anthropic/claude-3-haiku";

function formatMessages(
  userInput: string,
  history: ChatMessage[],
  profile: StoredOnboardingProfile | null
) {
  const systemPrompt = buildSystemPrompt(profile);

  return [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...history.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    {
      role: 'user',
      content: userInput,
    },
  ];
}

export async function generateReplyWithOpenRouter(
  userInput: string,
  history: ChatMessage[] = [],
  profile: StoredOnboardingProfile | null = null
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Friend in a Pocket',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: formatMessages(userInput, history, profile),
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('OpenRouter error:', text);
    throw new Error('OpenRouter failed');
  }

  const data = await response.json();

  return data.choices?.[0]?.message?.content || 'No response';
}