/**
 * The single Gig -> GigCardData mapper — FIXED with realistic distance.
 * Every screen that renders a GigCard goes through this, so the card stays
 * pixel-identical everywhere. Now includes deterministic mock distance (0.5-15km)
 * based on gig id hash, so location/radius filtering behaves logically.
 */
import type { GigCardData } from '@/components/ui/GigCard';
import type { Gig } from '@/types/api';
import { mockDistanceKm, formatDistanceShort } from '@/lib/location';

/** Pluralise a count: `1 week`, `2 weeks`. Never `1 weeks`. */
function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function deriveDuration(deadline: string): string {
  const time = new Date(deadline).getTime();
  if (!Number.isFinite(time)) return 'No deadline';
  const days = Math.ceil((time - Date.now()) / 86400000);
  if (days <= 0) return 'Due today';
  if (days === 1) return '1 day left';
  if (days < 7) return `${plural(days, 'day')} left`;
  if (days < 30) return `${plural(Math.round(days / 7), 'week')} left`;
  return `${plural(Math.round(days / 30), 'month')} left`;
}

export const toGigCardData = (gig: Gig): GigCardData => {
  const distanceKm = mockDistanceKm(gig.id);
  const isRemote = /remote|work from home|anywhere/i.test(gig.location);
  return {
    id: gig.id,
    title: gig.title,
    businessName: gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Local business',
    skills: gig.skillsRequired,
    budget: Number(gig.budget),
    location: gig.location,
    deadline: new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    distance: isRemote ? 'Remote' : formatDistanceShort(distanceKm),
    duration: deriveDuration(gig.deadline),
    applicantCount: gig.applications?.length,
    workType: isRemote ? 'remote' : 'on-site',
  };
};

export function getGigDistanceKm(gigId: string): number {
  return mockDistanceKm(gigId);
}

