import { Router } from "express";
import multer from "multer";
import { upload } from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth.middleware";

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadRouter = Router();
uploadRouter.post("/", requireAuth, fileUpload.single("file"), upload);
