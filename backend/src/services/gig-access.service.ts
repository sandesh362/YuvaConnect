import { ApplicationStatus, Gig } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../utils/http";

export interface GigParticipants {
  gig: Gig;
  /** Owner of the gig. */
  businessId: string;
  /** Student holding the SELECTED application, if anyone has been selected yet. */
  selectedStudentId: string | null;
}

export async function getGigParticipants(gigId: string): Promise<GigParticipants> {
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      applications: {
        where: { status: ApplicationStatus.SELECTED },
        select: { studentId: true },
        take: 1,
      },
    },
  });
  if (!gig) throw new HttpError(404, "Gig not found");
  const { applications, ...rest } = gig;
  return { gig: rest, businessId: gig.businessId, selectedStudentId: applications[0]?.studentId ?? null };
}

export interface GigParticipation extends GigParticipants {
  /** The other participant relative to the requester (null when nobody is selected yet). */
  counterpartId: string | null;
}

/**
 * Authorization gate for gig-scoped participant features (messages, ratings).
 * Only the business owner and the assigned (SELECTED) student may proceed;
 * everyone else — including non-selected applicants — gets a 403.
 */
export async function requireGigParticipant(gigId: string, userId: string): Promise<GigParticipation> {
  const participants = await getGigParticipants(gigId);
  if (userId === participants.businessId) {
    return { ...participants, counterpartId: participants.selectedStudentId };
  }
  if (participants.selectedStudentId !== null && userId === participants.selectedStudentId) {
    return { ...participants, counterpartId: participants.businessId };
  }
  throw new HttpError(403, "Only the assigned student and the business owner can access this");
}
