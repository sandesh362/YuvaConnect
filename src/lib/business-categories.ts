/**
 * Business category taxonomy — the single source of truth.
 *
 * A business picks its category during verification and again when posting a
 * gig. Both screens must offer the same list, otherwise a business can verify
 * as "Logistics & Delivery" and then be unable to post a gig in its own
 * category. The two copies had already drifted (verification had Logistics and
 * Other; posting had Photography), so the list lives here and both screens
 * import it.
 *
 * `category` is a free string on BusinessProfile, so profile values written
 * before this list existed (or by an admin) may not be in it — always check
 * with `isKnownBusinessCategory()` before pre-filling a picker with one.
 */
export const BUSINESS_CATEGORIES = [
  'Photography',
  'Food & Restaurant',
  'Retail & Shop',
  'Digital Services',
  'Education & Coaching',
  'Events & Media',
  'Salon & Wellness',
  'Logistics & Delivery',
  'Other',
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

/** True when a stored value is one of the picker's options (case/space tolerant). */
export function isKnownBusinessCategory(value: string | null | undefined): value is BusinessCategory {
  if (!value) return false;
  const needle = value.trim().toLowerCase();
  return BUSINESS_CATEGORIES.some((item) => item.toLowerCase() === needle);
}
