import { Router } from "express";
import { createOrder, getEarnings, releasePayment, verifyPayment } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const paymentRouter = Router();
paymentRouter.use(requireAuth);
paymentRouter.post("/gigs/:id/create-order", createOrder);
paymentRouter.post("/gigs/:id/verify-payment", verifyPayment);
paymentRouter.post("/gigs/:id/release-payment", releasePayment);
paymentRouter.get("/earnings", getEarnings);
