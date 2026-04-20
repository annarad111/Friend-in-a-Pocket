export type ReflectionCategory =
  | 'attachment'
  | 'childhood-wounds'
  | 'boundaries'
  | 'self-worth'
  | 'relationships'
  | 'general';

export function detectCategory(input: string): ReflectionCategory {
  const normalized = input.toLowerCase();

  if (
    normalized.includes('attachment') ||
    normalized.includes('abandon') ||
    normalized.includes('leave me') ||
    normalized.includes('anxious') ||
    normalized.includes('avoidant')
  ) {
    return 'attachment';
  }

  if (
    normalized.includes('childhood') ||
    normalized.includes('inner child') ||
    normalized.includes('mother') ||
    normalized.includes('father') ||
    normalized.includes('parents')
  ) {
    return 'childhood-wounds';
  }

  if (
    normalized.includes('boundary') ||
    normalized.includes('boundaries') ||
    normalized.includes('say no') ||
    normalized.includes('people pleasing')
  ) {
    return 'boundaries';
  }

  if (
    normalized.includes('worthy') ||
    normalized.includes('not enough') ||
    normalized.includes('self-worth') ||
    normalized.includes('self esteem')
  ) {
    return 'self-worth';
  }

  if (
    normalized.includes('relationship') ||
    normalized.includes('partner') ||
    normalized.includes('love') ||
    normalized.includes('dating')
  ) {
    return 'relationships';
  }

  return 'general';
}