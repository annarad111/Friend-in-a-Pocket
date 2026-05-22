import { PERSONALITY_PROFILE_PROMPT } from './psychTestPrompts';
import type { PersonalityProfileRequest } from './insightsTypes';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-3-haiku';


function buildUserPrompt(input: PersonalityProfileRequest): string {
  const lines: string[] = [];

  if (input.profile) {
    lines.push(`User profile: ${input.profile.friendName}, ${input.profile.favoriteAnimal}, ${input.profile.favoriteColor}, ${input.profile.favoriteInstrument}`);
    lines.push('');
  }

  lines.push(`Journal entries (${input.entries.length} total, most recent first):`);
  input.entries.slice(0, 15).forEach((e, i) => {
    lines.push(`\n--- Entry ${i + 1} | ${e.sealedAt.slice(0, 10)} | mood: ${e.mood} ---`);
    lines.push(`Prompt: ${e.promptQuestion}`);
    lines.push(`Written: ${e.body.slice(0, 500)}`);
    if (e.oneWord) lines.push(`In a word: ${e.oneWord}`);
    if (e.tinyWin) lines.push(`Tiny win: ${e.tinyWin}`);
  });

  if (input.completedTests.length > 0) {
    lines.push('\n\nCompleted psychological exercises:');
    input.completedTests.forEach((t) => {
      lines.push(`\n[${t.title}]\n${t.interpretation.slice(0, 600)}`);
    });
  }

  lines.push('\n\nWrite the personality portrait now.');
  return lines.join('\n');
}

export async function generatePersonalityProfile(
  input: PersonalityProfileRequest,
): Promise<{ content: string; reflectionQuestion: string }> {
  const userPrompt = buildUserPrompt(input);

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
        { role: 'system', content: PERSONALITY_PROFILE_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`OpenRouter personality-profile error [${response.status}]:`, text);
    throw new Error(`OpenRouter ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim();
  if (!rawText) throw new Error('Empty profile response.');

  const portraitMatch = rawText.match(/PORTRAIT:\s*([\s\S]*?)(?:\n\nQUESTION:|$)/i);
  const questionMatch = rawText.match(/QUESTION:\s*([\s\S]*?)$/i);
  const content = portraitMatch?.[1]?.trim() ?? '';
  const reflectionQuestion = questionMatch?.[1]?.trim() ?? '';

  if (!content || !reflectionQuestion) {
    throw new Error('Bad profile shape — missing PORTRAIT or QUESTION section.');
  }

  return { content, reflectionQuestion };
}
