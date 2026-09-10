import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { authRouter } from "./routes/auth.routes";
import { profileRouter } from "./routes/profile.routes";
import { uploadRouter } from "./routes/upload.routes";
import { gigRouter } from "./routes/gig.routes";
import { paymentRouter } from "./routes/payment.routes";
import { userRouter } from "./routes/user.routes";
import { reportRouter } from "./routes/report.routes";
import { notificationRouter } from "./routes/notification.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/gigs", gigRouter);
app.use("/api", paymentRouter);
app.use("/api/users", userRouter);
app.use("/api/reports", reportRouter);
app.use("/api/notifications", notificationRouter);
app.use(notFound);
app.use(errorHandler);
