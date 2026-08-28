import { Router } from "express";
import { createPortfolioItem, deletePortfolioItem, getCurrentProfile, updateCurrentProfile, verifyUserProfile } from "../controllers/profile.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, getCurrentProfile);
profileRouter.put("/", requireAuth, updateCurrentProfile);
profileRouter.post("/portfolio", requireAuth, createPortfolioItem);
profileRouter.delete("/portfolio/:id", requireAuth, deletePortfolioItem);
profileRouter.patch("/:userId/verify", requireAuth, requireAdmin, verifyUserProfile);
