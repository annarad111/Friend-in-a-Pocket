export function sanitizeInput(input: string) {
  return input.replace(/\s+/g, ' ').trim().slice(0, 3000);
}