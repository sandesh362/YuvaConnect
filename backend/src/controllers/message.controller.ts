import { NotificationType } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireGigParticipant } from "../services/gig-access.service";
import { notifySafely } from "../services/notification.service";
import { HttpError, asyncHandler, cursorLimit, idParam, queryParam, requireUserId, text } from "../utils/http";

/** Max chat message length — enforced here; the DB column is unbounded TEXT. */
export const MAX_MESSAGE_LENGTH = 2000;

const senderSelect = { id: true, name: true } as const;

interface PostMessageBody {
  content?: unknown;
}

/**
 * GET /api/gigs/:id/messages — participant-only, newest last.
 * Cursor pagination: pass ?before=<messageId> to load older history.
 * Response: { messages, nextCursor } where nextCursor is null when exhausted.
 */
export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const gigId = idParam(req.params.id);
  await requireGigParticipant(gigId, userId);

  const limit = cursorLimit(req.query);
  const before = queryParam(req.query.before);

  // Cursor page: messages strictly older than the cursor. The (createdAt, id)
  // tiebreak keeps pagination exact when two messages share a timestamp.
  // Queried newest-first, then reversed so clients always receive newest-last.
  let cursorCreatedAt: Date | null = null;
  if (before) {
    const cursor = await prisma.message.findFirst({
      where: { id: before, gigId },
      select: { createdAt: true },
    });
    if (!cursor) throw new HttpError(400, "Invalid cursor");
    cursorCreatedAt = cursor.createdAt;
  }

  const rows = await prisma.message.findMany({
    where: {
      gigId,
      ...(cursorCreatedAt
        ? { OR: [{ createdAt: { lt: cursorCreatedAt } }, { createdAt: cursorCreatedAt, id: { lt: before } }] }
        : {}),
    },
    include: { sender: { select: senderSelect } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });
  const messages = [...rows].reverse();
  res.json({ messages, nextCursor: rows.length === limit && messages.length > 0 ? messages[0].id : null });
});

/** POST /api/gigs/:id/messages — participant-only; notifies the other participant. */
export const postMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const gigId = idParam(req.params.id);
  const { gig, counterpartId } = await requireGigParticipant(gigId, userId);

  const body = req.body as PostMessageBody;
  const content = text(body.content, "content", { maxLength: MAX_MESSAGE_LENGTH });

  const message = await prisma.message.create({
    data: { gigId, senderId: userId, content },
    include: { sender: { select: senderSelect } },
  });

  if (counterpartId) {
    notifySafely({
      userId: counterpartId,
      type: NotificationType.NEW_MESSAGE,
      message: `New message about "${gig.title}"`,
      relatedGigId: gigId,
    });
  }
  res.status(201).json({ message });
});
