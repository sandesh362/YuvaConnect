import { Router } from "express";
import { createReport } from "../controllers/report.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const reportRouter = Router();
reportRouter.use(requireAuth);
reportRouter.post("/", createReport);
