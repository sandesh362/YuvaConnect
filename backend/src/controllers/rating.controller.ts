import { GigStatus, Prisma, Role } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireGigParticipant } from "../services/gig-access.service";
import {
  HttpError,
  asyncHandler,
  idParam,
  intInRange,
  optionalText,
  pageParams,
  requireUserId,
} from "../utils/http";

/** Max rating comment length — enforced here; the DB column is unbounded TEXT. */
export const MAX_RATING_COMMENT_LENGTH = 1000;

/** A gig can only be rated once work is fully done (approved/paid/closed). */
const RATABLE_STATUSES: GigStatus[] = [GigStatus.APPROVED, GigStatus.PAID, GigStatus.CLOSED];

interface RateGigBody {
  score?: unknown;
  comment?: unknown;
}

/**
 * POST /api/gigs/:id/rate — participant-only, completed gigs only.
 * The ratee (toUserId) is derived server-side from the gig's participants,
 * never accepted from the client. One rating per user per gig.
 */
export const rateGig = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const gigId = idParam(req.params.id);
  const { gig, counterpartId } = await requireGigParticipant(gigId, userId);

  if (!RATABLE_STATUSES.includes(gig.status)) {
    throw new HttpError(409, "Ratings are only allowed once the gig is completed");
  }
  if (!counterpartId) {
    throw new HttpError(409, "There is nobody to rate on this gig yet");
  }

  const body = req.body as RateGigBody;
  const score = intInRange(body.score, "score", 1, 5);
  const comment = optionalText(body.comment, "comment", MAX_RATING_COMMENT_LENGTH);

  try {
    const rating = await prisma.$transaction(async (tx) => {
      const existing = await tx.rating.findUnique({
        where: { gigId_fromUserId: { gigId, fromUserId: userId } },
        select: { id: true },
      });
      if (existing) throw new HttpError(409, "You have already rated this gig");

      const created = await tx.rating.create({
        data: { gigId, fromUserId: userId, toUserId: counterpartId, score, comment },
      });

      // Incremental mean: newAvg = (oldAvg * oldTotal + score) / (oldTotal + 1).
      // Runs inside the same transaction as the insert so the denormalized
      // avgRating/totalRatings columns can never drift from the ratings table.
      const recipient = await tx.user.findUnique({ where: { id: counterpartId }, select: { role: true } });
      if (recipient?.role === Role.STUDENT) {
        const profile = await tx.studentProfile.upsert({
          where: { userId: counterpartId },
          create: { userId: counterpartId },
          update: {},
          select: { avgRating: true, totalRatings: true },
        });
        const totalRatings = profile.totalRatings + 1;
        await tx.studentProfile.update({
          where: { userId: counterpartId },
          data: { totalRatings, avgRating: (profile.avgRating * profile.totalRatings + score) / totalRatings },
        });
      } else if (recipient?.role === Role.BUSINESS) {
        const profile = await tx.businessProfile.upsert({
          where: { userId: counterpartId },
          create: { userId: counterpartId },
          update: {},
          select: { avgRating: true, totalRatings: true },
        });
        const totalRatings = profile.totalRatings + 1;
        await tx.businessProfile.update({
          where: { userId: counterpartId },
          data: { totalRatings, avgRating: (profile.avgRating * profile.totalRatings + score) / totalRatings },
        });
      }
      return created;
    });
    res.status(201).json({ rating });
  } catch (error) {
    // Race safety net: the @@unique([gigId, fromUserId]) constraint is the
    // final arbiter if two requests slip past the pre-check simultaneously.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "You have already rated this gig");
    }
    throw error;
  }
});

/**
 * GET /api/gigs/:id/my-rating — participant-only.
 * Lets the client decide whether to show the post-completion rating prompt.
 */
export const getMyRating = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const gigId = idParam(req.params.id);
  await requireGigParticipant(gigId, userId);
  const rating = await prisma.rating.findUnique({
    where: { gigId_fromUserId: { gigId, fromUserId: userId } },
  });
  res.json({ rating });
});

/**
 * GET /api/users/:id/ratings — any signed-in user may view the public summary
 * plus paginated recent ratings received, newest first.
 */
export const listUserRatings = asyncHandler(async (req: Request, res: Response) => {
  requireUserId(req);
  const userId = idParam(req.params.id);
  const { page, limit, skip } = pageParams(req.query);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      studentProfile: { select: { avgRating: true, totalRatings: true } },
      businessProfile: { select: { avgRating: true, totalRatings: true } },
    },
  });
  if (!user) throw new HttpError(404, "User not found");
  const profile = user.role === Role.STUDENT ? user.studentProfile : user.businessProfile;

  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: { select: { id: true, name: true } },
        gig: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.rating.count({ where: { toUserId: userId } }),
  ]);
  res.json({
    summary: { avgRating: profile?.avgRating ?? 0, totalRatings: profile?.totalRatings ?? 0 },
    ratings,
    page,
    limit,
    total,
  });
});
