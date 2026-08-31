import { Router } from "express";
import { applyToGig, approveGig, createGig, getGig, getMyGigs, listApplicants, listGigs, rejectApplicant, requestRevision, selectApplicant, startGig, submitDeliverable, updateGig } from "../controllers/gig.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const gigRouter = Router();
gigRouter.use(requireAuth);
gigRouter.post("/", createGig);
gigRouter.get("/", listGigs);
gigRouter.get("/mine", getMyGigs);
gigRouter.post("/:id/apply", applyToGig);
gigRouter.get("/:id/applicants", listApplicants);
gigRouter.patch("/:id/start", startGig);
gigRouter.post("/:id/submit", submitDeliverable);
gigRouter.post("/:id/request-revision", requestRevision);
gigRouter.patch("/:id/approve", approveGig);
gigRouter.get("/:id", getGig);
gigRouter.patch("/:id", updateGig);
gigRouter.patch("/applications/:id/select", selectApplicant);
gigRouter.patch("/applications/:id/reject", rejectApplicant);
