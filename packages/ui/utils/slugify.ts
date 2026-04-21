/**
 * Convert heading text into a URL-safe anchor id.
 * Strips common inline markdown so `**Install** \`bun\`` → `install-bun`.
 * Preserves unicode letters (e.g. "Café" → "café").
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}
