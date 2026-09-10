import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { HttpError, asyncHandler, requireUserId, text } from "../utils/http";

/** Max report reason length — enforced here; the DB column is unbounded TEXT. */
export const MAX_REPORT_REASON_LENGTH = 2000;

interface CreateReportBody {
  gigId?: unknown;
  reason?: unknown;
}

/**
 * POST /api/reports — any signed-in user may file a report, optionally tied
 * to a gig. (Admin triage/resolution endpoints are Phase 6 scope.)
 */
export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const reporterId = requireUserId(req);
  const body = req.body as CreateReportBody;
  const reason = text(body.reason, "reason", { maxLength: MAX_REPORT_REASON_LENGTH });

  let gigId: string | null = null;
  if (body.gigId !== undefined && body.gigId !== null) {
    if (typeof body.gigId !== "string" || !body.gigId.trim()) {
      throw new HttpError(400, "gigId must be a string");
    }
    const gig = await prisma.gig.findUnique({ where: { id: body.gigId.trim() }, select: { id: true } });
    if (!gig) throw new HttpError(404, "Gig not found");
    gigId = gig.id;
  }

  const report = await prisma.report.create({ data: { reporterId, gigId, reason } });
  res.status(201).json({ report });
});
