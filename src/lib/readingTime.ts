/**
 * Estimates reading time from an HTML string.
 * Strips tags, counts words, assumes 200 words/minute.
 */
export function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} menit baca`;
}
