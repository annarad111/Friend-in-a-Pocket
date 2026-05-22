import {
  DESERT_CUBE_INTERPRETATION_PROMPT,
} from './psychTestPrompts';
import type { InterpretTestRequest, TestResponse } from './insightsTypes';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-3-haiku';

function buildUserPrompt(responses: TestResponse[]): string {
  return responses
    .map((r) => `**${r.question}**\n${r.answer}`)
    .join('\n\n');
}

function getSystemPrompt(testType: string): string {
  if (testType === 'desert-cube') return DESERT_CUBE_INTERPRETATION_PROMPT;
  throw new Error(`Unknown test type: ${testType}`);
}

export async function interpretPsychTest(
  input: InterpretTestRequest,
): Promise<{ interpretation: string }> {
  const systemPrompt = getSystemPrompt(input.testType);
  const userPrompt = buildUserPrompt(input.responses);

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
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`OpenRouter interpret-test error [${response.status}]:`, text);
    throw new Error(`OpenRouter ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim();
  if (!rawText) throw new Error('Empty interpretation response.');

  return { interpretation: rawText };
}
