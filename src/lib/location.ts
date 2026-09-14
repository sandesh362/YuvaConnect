/**
 * Location & Distance — Production mock for pilot without real geo backend.
 *
 * Provides:
 * - Deterministic distance per gig (hash of id -> 0.5-15 km)
 * - Radius filtering
 * - Location persistence (AsyncStorage)
 * - Realistic Indian locality handling
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOC_KEY = 'yuvaconnect:location-availability';
const RADIUS_KEY = 'yuvaconnect:work-radius';

export type StoredLocation = {
  location: string;
  radiusKm: number;
  preference: 'on-site' | 'remote' | 'both';
  days?: string[];
};

const DEFAULTS: StoredLocation = {
  location: 'Powai, Mumbai',
  radiusKm: 10,
  preference: 'both',
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};

// Simple hash to get deterministic distance for a gig id
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministic distance 0.5km to 15km based on gig id.
 * Ensures same gig always shows same distance across screens.
 */
export function mockDistanceKm(gigId: string): number {
  const h = hashString(gigId);
  // 0.5 to 15 km, with one decimal
  const km = 0.5 + (h % 145) / 10; // 0.5 to 15.0
  return Math.round(km * 10) / 10;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
}

export function formatDistanceShort(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Filter gigs by radius: if gig distance <= radius, keep it.
 * Remote gigs always pass radius filter (they are location independent).
 */
export function filterByRadius<T extends { id: string; location: string }>(gigs: T[], radiusKm: number): T[] {
  return gigs.filter((gig) => {
    const isRemote = /remote|work from home|anywhere/i.test(gig.location);
    if (isRemote) return true;
    const dist = mockDistanceKm(gig.id);
    return dist <= radiusKm;
  });
}

export async function getStoredLocation(): Promise<StoredLocation> {
  try {
    const raw = await AsyncStorage.getItem(LOC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredLocation>;
      return { ...DEFAULTS, ...parsed };
    }
  } catch {}
  return DEFAULTS;
}

export async function setStoredLocation(data: Partial<StoredLocation>): Promise<StoredLocation> {
  const current = await getStoredLocation();
  const next = { ...current, ...data };
  try {
    await AsyncStorage.setItem(LOC_KEY, JSON.stringify(next));
    await AsyncStorage.setItem(RADIUS_KEY, String(next.radiusKm));
  } catch {}
  return next;
}

export async function getRadius(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(RADIUS_KEY);
    if (raw) return Number(raw) || DEFAULTS.radiusKm;
    const loc = await getStoredLocation();
    return loc.radiusKm;
  } catch {
    return DEFAULTS.radiusKm;
  }
}

// Indian localities for realistic mock data
export const MUMBAI_LOCALITIES = [
  'Powai, Mumbai',
  'Andheri East, Mumbai',
  'Andheri West, Mumbai',
  'Bandra, Mumbai',
  'Vile Parle, Mumbai',
  'Dadar, Mumbai',
  'Lower Parel, Mumbai',
  'Koramangala, Bengaluru',
  'Indiranagar, Bengaluru',
  'Connaught Place, Delhi',
  'Hauz Khas, Delhi',
  'Salt Lake, Kolkata',
  'Banjara Hills, Hyderabad',
];

export function isWithinRadius(gigId: string, radiusKm: number, locationStr: string): boolean {
  const isRemote = /remote|work from home|anywhere/i.test(locationStr);
  if (isRemote) return true;
  return mockDistanceKm(gigId) <= radiusKm;
}
