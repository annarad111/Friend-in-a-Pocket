import { BIRTH_CHART_INTERPRETATION_PROMPT } from './birthChartPrompt';
import { calculatePlacements } from './natalCalculator';
import type { BirthChartRequest, BirthChartResult } from './insightsTypes';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-3-haiku';

function buildInterpretationPrompt(opts: {
  sunSign: string;
  moonSign: string | null;
  ascendant: string | null;
  location: string | null;
}): string {
  const lines: string[] = [];
  lines.push(`Sun sign: ${opts.sunSign}`);
  if (opts.moonSign) lines.push(`Moon sign: ${opts.moonSign}`);
  if (opts.ascendant) lines.push(`Ascendant (Rising): ${opts.ascendant}`);
  if (opts.location) lines.push(`Birth location: ${opts.location}`);
  lines.push('\nWrite the interpretation now.');
  return lines.join('\n');
}

async function getInterpretation(prompt: string): Promise<string> {
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
        { role: 'system', content: BIRTH_CHART_INTERPRETATION_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.72,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`OpenRouter birth-chart error [${response.status}]:`, text);
    throw new Error(`OpenRouter ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty interpretation response.');
  return text;
}

export async function generateBirthChart(
  input: BirthChartRequest,
): Promise<BirthChartResult> {
  // Step 1: Real astronomical calculations from DE421 ephemeris
  const placements = await calculatePlacements({
    date: input.date,
    time: input.time,
    location: input.location,
  });

  console.log('[birth-chart] placements:', placements);

  // Step 2: Claude writes only the interpretation prose
  const userPrompt = buildInterpretationPrompt({
    sunSign: placements.sunSign,
    moonSign: placements.moonSign,
    ascendant: placements.ascendant,
    location: placements.location?.displayName ?? null,
  });

  const interpretation = await getInterpretation(userPrompt);

  return {
    sunSign: placements.sunSign,
    moonSign: placements.moonSign ?? undefined,
    ascendant: placements.ascendant ?? undefined,
    interpretation,
  };
}
