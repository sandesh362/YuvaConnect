import { Router } from "express";
import { listUserRatings } from "../controllers/rating.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const userRouter = Router();
userRouter.use(requireAuth);
userRouter.get("/:id/ratings", listUserRatings);
