/**
 * Bottom-tab navigation map — FIXED for production QA.
 *
 * All 5 primary tabs now have real routes. No tab is a quiet no-op.
 * - Student: Home, Discover, My Gigs, Messages, Profile (+ extras: earnings, saved)
 * - Business: Home, My Gigs, Post Gig, Messages, Profile (+ extras: talent)
 *
 * Navigation uses replace to avoid stacking duplicate tab roots, but preserves
 * back navigation for detail screens (they use router.back()).
 */
import { router } from 'expo-router';

export const STUDENT_TAB_ROUTES: Record<string, string | null> = {
  home: '/(app)/home',
  discover: '/(student)/feed',
  mygigs: '/(student)/my-gigs',
  messages: '/(shared)/messages',
  profile: '/(student)/profile',
  // Extra routes reachable via profile / internal links but also usable as tabs if needed
  earnings: '/(student)/earnings',
  saved: '/(student)/saved',
  search: '/(student)/search',
};

export const BUSINESS_TAB_ROUTES: Record<string, string | null> = {
  home: '/(app)/home',
  gigs: '/(business)/my-gigs',
  post: '/(business)/post-gig',
  messages: '/(shared)/messages',
  profile: '/(business)/profile',
  // Extra
  talent: '/talent',
};

export function goStudentTab(key: string) {
  const route = STUDENT_TAB_ROUTES[key];
  if (route) {
    // Use replace for tab switches to keep stack clean
    router.replace(route as never);
  } else {
    // Fallback: log and stay, never crash
    console.warn(`[tab-nav] No route for student tab: ${key}`);
  }
}

export function goBusinessTab(key: string) {
  const route = BUSINESS_TAB_ROUTES[key];
  if (route) {
    router.replace(route as never);
  } else {
    console.warn(`[tab-nav] No route for business tab: ${key}`);
  }
}
