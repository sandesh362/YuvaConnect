/**
 * Text helpers shared by every screen.
 *
 * These exist because the naive versions of both helpers produce visibly wrong
 * copy with real data:
 *   • `name.split(' ')[0]` on "The Sunrise Café & Bakery" returns "The", which
 *     rendered a button label reading "Message The".
 *   • `initialsOf('Café')` on a one-word name must not crash on the second letter.
 */

/** Leading articles that carry no identity — dropped when shortening a name. */
const LEADING_ARTICLES = /^(the|a|an|shri|sri|m\/s|ms|mr|mrs)\s+/i;

/**
 * A short, human label for a business or person, safe for buttons and rows.
 *
 * "@The Sunrise Café & Bakery" → "Sunrise Café & Bakery" (then truncated)
 * "Sharma Kirana Store"        → "Sharma Kirana Store"
 */
export function shortBusinessName(name: string | null | undefined, maxLength = 22): string {
  const clean = (name ?? '').trim().replace(/\s+/g, ' ');
  if (!clean) return 'this business';
  const withoutArticle = clean.replace(LEADING_ARTICLES, '') || clean;
  return withoutArticle.length > maxLength ? `${withoutArticle.slice(0, maxLength - 1).trimEnd()}…` : withoutArticle;
}

/** First name only, for greetings. Never returns an empty string. */
export function firstNameOf(name: string | null | undefined, fallback = 'there'): string {
  const clean = (name ?? '').trim();
  if (!clean) return fallback;
  return clean.split(' ')[0] || clean;
}

/** Up to two initials. Safe for single-word names and emoji-only names. */
export function initialsOf(name: string | null | undefined): string {
  const clean = (name ?? '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

/** `1 week` / `2 weeks` — never `1 weeks`. */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** "3 days" · "2 weeks" · "1 month" — a compact duration from a day count. */
export function durationFromDays(days: number): string {
  if (!Number.isFinite(days)) return '—';
  if (days <= 0) return 'Due today';
  if (days === 1) return '1 day';
  if (days < 7) return plural(days, 'day');
  if (days < 30) return plural(Math.round(days / 7), 'week');
  return plural(Math.round(days / 30), 'month');
}

/** Indian short date, e.g. "4 Oct". */
export function shortDate(value: string | number | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
