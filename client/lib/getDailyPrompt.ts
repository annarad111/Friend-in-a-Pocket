import type { DailyPrompt } from '@/types/journal';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://friend-in-a-pocket.onrender.com';

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const LOCAL_PROMPT_POOL: Array<Omit<DailyPrompt, 'date'>> = [
  {
    title: 'The Day You Almost Said It',
    question:
      'What\u2019s something small you noticed but didn\u2019t say today \u2014 and what would the gentlest version of saying it sound like?',
  },
  {
    title: 'A Soft Inventory',
    question:
      'What did your body know before your mind caught up today? Where do you feel it now?',
  },
  {
    title: 'The Smallest Brave Thing',
    question:
      'What was the smallest brave thing you did today \u2014 the kind nobody clapped for?',
  },
  {
    title: 'A Question You\u2019re Carrying',
    question:
      'What question have you been carrying around like a pebble in your pocket? Take it out for a look.',
  },
  {
    title: 'Permission Slips',
    question:
      'What did you want to do today but quietly told yourself you couldn\u2019t? What would change if you let yourself?',
  },
  {
    title: 'The Soft Edge',
    question:
      'Where in your day did you soften \u2014 even just by a millimetre? What did that softening make possible?',
  },
  {
    title: 'A Small Honesty',
    question:
      'Tell yourself one small honest thing you\u2019ve been a little afraid to say out loud.',
  },
];

function localPromptFor(date: string): DailyPrompt {
  let hash = 0;
  for (let i = 0; i < date.length; i++) hash = (hash * 31 + date.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % LOCAL_PROMPT_POOL.length;
  return { ...LOCAL_PROMPT_POOL[idx], date };
}

export async function getDailyPrompt(opts?: {
  profile?: { friendName?: string; favoriteAnimal?: string } | null;
  date?: string;
  language?: string;
}): Promise<DailyPrompt> {
  const date = opts?.date ?? todayKey();
  const language = opts?.language ?? (typeof navigator !== 'undefined' ? navigator.language : undefined);

  try {
    const response = await fetch(`${API_BASE_URL}/api/daily-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, profile: opts?.profile ?? null, language }),
    });

    if (!response.ok) throw new Error(`status ${response.status}`);

    const data = (await response.json()) as Partial<DailyPrompt>;
    if (data && typeof data.title === 'string' && typeof data.question === 'string') {
      return { title: data.title, question: data.question, date };
    }
    throw new Error('malformed daily-prompt response');
  } catch (err) {
    console.info('[daily-prompt] using local pool:', (err as Error).message);
    return localPromptFor(date);
  }
}
