/**
 * Bottom-tab navigation map.
 *
 * The wireframes' tab bar is rendered INSIDE each screen (no `(tabs)/` group,
 * so no existing URL changes). Keys with no route yet map to `null`: the tab
 * stays visible exactly as the wireframe shows it, and the tap is a quiet
 * no-op until that screen ships — never a crash, never a fake destination.
 */
import { router } from 'expo-router';

export const STUDENT_TAB_ROUTES: Record<string, string | null> = {
  home: '/(app)/home',
  discover: '/(student)/feed',
  mygigs: '/(student)/my-gigs',
  /** Thread list arrives with screen 5 (Messages & Trust Center). */
  messages: null,
  profile: '/(student)/profile',
};

export const BUSINESS_TAB_ROUTES: Record<string, string | null> = {
  home: '/(app)/home',
  gigs: '/(business)/my-gigs',
  post: '/(business)/post-gig',
  /** Saved Talent (screen 37) — no backend yet, decision owed. */
  talent: null,
  profile: '/(business)/profile',
};

export function goStudentTab(key: string) {
  const route = STUDENT_TAB_ROUTES[key];
  if (route) router.replace(route as never);
}

export function goBusinessTab(key: string) {
  const route = BUSINESS_TAB_ROUTES[key];
  if (route) router.replace(route as never);
}
