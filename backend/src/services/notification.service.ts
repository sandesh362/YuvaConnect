import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  relatedGigId?: string | null;
  /** Optional interactive-transaction client when the caller needs atomicity. */
  tx?: Prisma.TransactionClient;
}

/**
 * Single choke point for notification writes — every trigger site calls this
 * instead of touching the Notification model directly.
 *
 * NOTE: delivery is polling-based (clients call GET /api/notifications).
 * Expo Push token registration + push delivery is a deliberate future
 * enhancement, not in scope for Phase 5.
 */
export async function createNotification(input: CreateNotificationInput) {
  const client: Prisma.TransactionClient | typeof prisma = input.tx ?? prisma;
  return client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      relatedGigId: input.relatedGigId ?? null,
    },
  });
}

/**
 * Best-effort notify for use after a primary transaction has committed.
 * A notification failure must never fail (or roll back) the user's action,
 * so rejections are logged, not thrown.
 */
export function notifySafely(input: Omit<CreateNotificationInput, "tx">): void {
  void createNotification(input).catch((error: unknown) => {
    console.error("Failed to create notification:", error);
  });
}
