import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { HttpError, asyncHandler, idParam, pageParams, requireUserId } from "../utils/http";

/**
 * GET /api/notifications — current user's notifications, newest first, with
 * an unreadCount for badges. Clients poll this endpoint (no push in Phase 5).
 */
export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { page, limit, skip } = pageParams(req.query);
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      include: { relatedGig: { select: { id: true, title: true, status: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  res.json({ notifications, unreadCount, page, limit, total });
});

/** PATCH /api/notifications/:id/read — owners can only mark their own notifications. */
export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const id = idParam(req.params.id);
  // updateMany scoped to the owner: a user can never flip someone else's read state.
  const result = await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  if (result.count === 0) throw new HttpError(404, "Notification not found");
  const notification = await prisma.notification.findUnique({ where: { id } });
  res.json({ notification });
});

/** PATCH /api/notifications/read-all — marks all of the current user's unread notifications. */
export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ updated: result.count });
});
