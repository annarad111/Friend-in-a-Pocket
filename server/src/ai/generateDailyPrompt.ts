// → server/src/ai/generateDailyPrompt.ts
//
// Calls OpenRouter (Claude Haiku) with the daily-prompt system message and
// returns a typed { title, question } object. Mirrors the structure of
// generateOnboardingProfile.ts so the endpoint stays consistent.

import { DAILY_PROMPT_SYSTEM } from './dailyPromptPrompt';
import { fixJsonControlChars } from './fixJson';
import type {
  DailyPromptRequest,
  GeneratedDailyPrompt,
} from '../types/journal';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MODEL = 'anthropic/claude-3-haiku';

function extractJson(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No valid JSON object found in model response.');
  }

  return fixJsonControlChars(text.slice(start, end + 1));
}

function buildUserPrompt(input: DailyPromptRequest): string {
  const date = input.date ?? new Date().toISOString().slice(0, 10);
  // Day-of-week + season hint help the model avoid sameness across days.
  const d = new Date(`${date}T00:00:00`);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });

  const lines: string[] = [
    `Today's date: ${date} (${weekday}, ${month}).`,
  ];

  if (input.profile) {
    if (input.profile.friendName)
      lines.push(`The user calls me: ${input.profile.friendName}.`);
    if (input.profile.favoriteAnimal)
      lines.push(`Their favorite animal is: ${input.profile.favoriteAnimal}.`);
    if (input.profile.favoriteColor)
      lines.push(`Their favorite color is: ${input.profile.favoriteColor}.`);
    if (input.profile.favoriteInstrument)
      lines.push(`Their favorite instrument is: ${input.profile.favoriteInstrument}.`);
  } else {
    lines.push('(No profile available — write a universal prompt.)');
  }

  if (input.language) {
    lines.push(`User's language: ${input.language}. Write the title and question in that language.`);
  }

  lines.push('');
  lines.push("Write today's chapter title + question. Return JSON only.");

  return lines.join('\n');
}

export async function generateDailyPrompt(
  input: DailyPromptRequest,
): Promise<GeneratedDailyPrompt> {
  const userPrompt = buildUserPrompt(input);

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
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
          { role: 'system', content: DAILY_PROMPT_SYSTEM },
          { role: 'user', content: userPrompt },
        ],
        // A bit warmer than onboarding — we want range across days.
        temperature: 0.95,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('OpenRouter daily-prompt error:', text);
    throw new Error('Daily prompt generation failed');
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim();
  if (!rawText) {
    throw new Error('Empty daily prompt response.');
  }

  const jsonText = extractJson(rawText);
  const parsed = JSON.parse(jsonText) as Partial<GeneratedDailyPrompt>;

  if (
    typeof parsed.title !== 'string' ||
    typeof parsed.question !== 'string' ||
    !parsed.title.trim() ||
    !parsed.question.trim()
  ) {
    throw new Error('Daily prompt response missing title or question.');
  }

  return {
    title: parsed.title.trim(),
    question: parsed.question.trim(),
  };
}
