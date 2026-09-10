import { Router } from "express";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const notificationRouter = Router();
notificationRouter.use(requireAuth);
notificationRouter.get("/", listNotifications);
// /read-all must precede /:id/read so "read-all" is not captured as an id.
notificationRouter.patch("/read-all", markAllNotificationsRead);
notificationRouter.patch("/:id/read", markNotificationRead);
