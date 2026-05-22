const JOURNAL_PATTERNS = [
  /\bjournal\b/i,
  /\bjurnal\b/i,
  /\b(new|noua?|alta?)\s+(entry|intrare|pagina?)\b/i,
  /\b(write|scriu|adaug)\b.*\b(entry|chapter|capitol)\b/i,
  /\b(today'?s?\s+)?(chapter|capitol)\b/i,
  /\bseal\b.*\bchapter\b/i,
];

export function detectJournalIntent(message: string): boolean {
  return JOURNAL_PATTERNS.some((re) => re.test(message));
}