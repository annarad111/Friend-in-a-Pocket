/**
 * Escapes unescaped control characters (newlines, tabs, carriage returns)
 * inside JSON string values so JSON.parse doesn't choke on them.
 * LLMs frequently emit literal newlines inside JSON strings.
 */
export function fixJsonControlChars(jsonStr: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      if (char === '\n') { result += '\\n'; continue; }
      if (char === '\r') { result += '\\r'; continue; }
      if (char === '\t') { result += '\\t'; continue; }
    }

    result += char;
  }

  return result;
}
