/**
 * The single Gig -> GigCardData mapper. Every screen that renders a GigCard
 * goes through this, so the card stays pixel-identical everywhere (a standing
 * project requirement). Fields the API does not carry (duration, distance,
 * isBusinessVerified) stay undefined and the card omits them — flagged, not
 * faked.
 */
import type { GigCardData } from '@/components/ui/GigCard';
import type { Gig } from '@/types/api';

export const toGigCardData = (gig: Gig): GigCardData => ({
  id: gig.id,
  title: gig.title,
  businessName: gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Local business',
  skills: gig.skillsRequired,
  budget: Number(gig.budget),
  location: gig.location,
  deadline: gig.deadline,
});
