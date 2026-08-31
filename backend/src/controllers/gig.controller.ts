import { ApplicationStatus, GigStatus, Prisma, Role } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";

const idParam = (value: string | string[]) => Array.isArray(value) ? value[0] : value;
const text = (value: unknown, field: string, required = true) => {
  if (typeof value !== "string" || (required && !value.trim())) throw new Error(`${field} is required`);
  return typeof value === "string" ? value.trim() : "";
};
async function roleOf(userId: string) { return prisma.user.findUnique({ where: { id: userId }, select: { role: true } }); }
async function requireRole(userId: string, role: Role) { const user = await roleOf(userId); return user?.role === role; }
async function ownedGig(id: string, businessId: string) { return prisma.gig.findFirst({ where: { id, businessId } }); }
async function assignedGig(id: string, studentId: string) { return prisma.gig.findFirst({ where: { id, applications: { some: { studentId, status: ApplicationStatus.SELECTED } } } }); }
const gigInclude = { business: { select: { id: true, name: true, businessProfile: { select: { businessName: true } } } }, applications: { select: { id: true, studentId: true, status: true } }, deliverables: { orderBy: { submittedAt: "desc" as const } }, revisionRequests: { orderBy: { requestedAt: "desc" as const } } } satisfies Prisma.GigInclude;

function gigInput(body: Record<string, unknown>, partial = false) {
  const input: Prisma.GigUncheckedCreateInput = {} as Prisma.GigUncheckedCreateInput;
  for (const field of ["title", "description", "location"] as const) if (body[field] !== undefined || !partial) input[field] = text(body[field], field);
  if (body.skillsRequired !== undefined || !partial) {
    if (!Array.isArray(body.skillsRequired) || body.skillsRequired.some((skill) => typeof skill !== "string")) throw new Error("skillsRequired must be an array of strings");
    input.skillsRequired = body.skillsRequired.map((skill) => skill.trim()).filter(Boolean);
  }
  if (body.budget !== undefined || !partial) {
    const budget = Number(body.budget); if (!Number.isFinite(budget) || budget < 0) throw new Error("budget must be a non-negative number"); input.budget = new Prisma.Decimal(budget);
  }
  if (body.deadline !== undefined || !partial) {
    const deadline = new Date(String(body.deadline)); if (Number.isNaN(deadline.getTime())) throw new Error("deadline must be a valid date"); input.deadline = deadline;
  }
  return input;
}

export async function createGig(req: Request, res: Response) {
  try { if (!await requireRole(req.userId!, Role.BUSINESS)) return res.status(403).json({ message: "Business access required" }); const gig = await prisma.gig.create({ data: { ...gigInput(req.body), businessId: req.userId! }, include: gigInclude }); return res.status(201).json({ gig }); }
  catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Could not create gig" }); }
}

export async function listGigs(req: Request, res: Response) {
  const { skill, minBudget, maxBudget, sortBy } = req.query;
  const budget: Prisma.DecimalFilter = {};
  if (minBudget !== undefined) { const value = Number(minBudget); if (!Number.isFinite(value)) return res.status(400).json({ message: "minBudget must be a number" }); budget.gte = value; }
  if (maxBudget !== undefined) { const value = Number(maxBudget); if (!Number.isFinite(value)) return res.status(400).json({ message: "maxBudget must be a number" }); budget.lte = value; }
  if (sortBy && sortBy !== "newest" && sortBy !== "budget") return res.status(400).json({ message: "sortBy must be newest or budget" });
  const gigs = await prisma.gig.findMany({ where: { status: GigStatus.OPEN, ...(typeof skill === "string" && skill.trim() ? { skillsRequired: { has: skill.trim() } } : {}), ...(Object.keys(budget).length ? { budget } : {}) }, include: gigInclude, orderBy: sortBy === "budget" ? { budget: "desc" } : { createdAt: "desc" } });
  return res.json({ gigs });
}

export async function getGig(req: Request, res: Response) { const gig = await prisma.gig.findUnique({ where: { id: idParam(req.params.id) }, include: gigInclude }); return gig ? res.json({ gig }) : res.status(404).json({ message: "Gig not found" }); }

export async function getMyGigs(req: Request, res: Response) {
  const user = await roleOf(req.userId!); if (!user || user.role === Role.ADMIN) return res.status(403).json({ message: "Account type not supported" });
  if (user.role === Role.BUSINESS) return res.json({ gigs: await prisma.gig.findMany({ where: { businessId: req.userId }, include: gigInclude, orderBy: { createdAt: "desc" } }) });
  const applications = await prisma.application.findMany({ where: { studentId: req.userId }, include: { gig: { include: gigInclude } }, orderBy: { createdAt: "desc" } }); return res.json({ applications, gigs: applications.map((application) => application.gig) });
}

export async function updateGig(req: Request, res: Response) {
  try { if (!await requireRole(req.userId!, Role.BUSINESS)) return res.status(403).json({ message: "Business access required" }); const gig = await ownedGig(idParam(req.params.id), req.userId!); if (!gig) return res.status(404).json({ message: "Gig not found" }); if (gig.status !== GigStatus.OPEN) return res.status(409).json({ message: "Only open gigs can be edited" }); const updated = await prisma.gig.update({ where: { id: gig.id }, data: gigInput(req.body, true), include: gigInclude }); return res.json({ gig: updated }); }
  catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Could not update gig" }); }
}

export async function applyToGig(req: Request, res: Response) {
  try { if (!await requireRole(req.userId!, Role.STUDENT)) return res.status(403).json({ message: "Student access required" }); const gig = await prisma.gig.findUnique({ where: { id: idParam(req.params.id) } }); if (!gig) return res.status(404).json({ message: "Gig not found" }); if (gig.status !== GigStatus.OPEN) return res.status(409).json({ message: "Applications are closed for this gig" }); const body = req.body as Record<string, unknown>; const application = await prisma.application.create({ data: { gigId: gig.id, studentId: req.userId!, proposal: text(body.proposal, "proposal"), relevantExperience: text(body.relevantExperience, "relevantExperience"), availability: text(body.availability, "availability") } }); return res.status(201).json({ application }); }
  catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return res.status(409).json({ message: "You have already applied to this gig" }); return res.status(400).json({ message: error instanceof Error ? error.message : "Could not apply" }); }
}

export async function listApplicants(req: Request, res: Response) {
  if (!await requireRole(req.userId!, Role.BUSINESS)) return res.status(403).json({ message: "Business access required" }); const gig = await ownedGig(idParam(req.params.id), req.userId!); if (!gig) return res.status(404).json({ message: "Gig not found" });
  const applicants = await prisma.application.findMany({ where: { gigId: gig.id }, include: { student: { select: { id: true, name: true, email: true, studentProfile: { select: { college: true, skills: true, bio: true, profileImageUrl: true } } } } }, orderBy: { createdAt: "asc" } }); return res.json({ applicants: applicants.map((application) => ({ ...application, rating: null, pastGigCount: 0 })) });
}

export async function selectApplicant(req: Request, res: Response) {
  if (!await requireRole(req.userId!, Role.BUSINESS)) return res.status(403).json({ message: "Business access required" }); const application = await prisma.application.findUnique({ where: { id: idParam(req.params.id) } }); if (!application) return res.status(404).json({ message: "Application not found" }); const gig = await ownedGig(application.gigId, req.userId!); if (!gig) return res.status(403).json({ message: "You do not own this gig" }); if (gig.status !== GigStatus.OPEN) return res.status(409).json({ message: "An applicant can only be selected for an open gig" }); if (application.status === ApplicationStatus.REJECTED) return res.status(409).json({ message: "A rejected applicant cannot be selected" });
  await prisma.$transaction([prisma.application.updateMany({ where: { gigId: gig.id, id: { not: application.id } }, data: { status: ApplicationStatus.REJECTED } }), prisma.application.update({ where: { id: application.id }, data: { status: ApplicationStatus.SELECTED } }), prisma.gig.update({ where: { id: gig.id }, data: { status: GigStatus.ASSIGNED } })]); return res.json({ application: await prisma.application.findUnique({ where: { id: application.id } }) });
}

export async function rejectApplicant(req: Request, res: Response) {
  if (!await requireRole(req.userId!, Role.BUSINESS)) return res.status(403).json({ message: "Business access required" }); const application = await prisma.application.findUnique({ where: { id: idParam(req.params.id) }, include: { gig: true } }); if (!application) return res.status(404).json({ message: "Application not found" }); if (application.gig.businessId !== req.userId) return res.status(403).json({ message: "You do not own this gig" }); if (application.gig.status !== GigStatus.OPEN) return res.status(409).json({ message: "Applicants can only be rejected while a gig is open" }); return res.json({ application: await prisma.application.update({ where: { id: application.id }, data: { status: ApplicationStatus.REJECTED } }) });
}

export async function startGig(req: Request, res: Response) { if (!await requireRole(req.userId!, Role.STUDENT)) return res.status(403).json({ message: "Student access required" }); const gig = await assignedGig(idParam(req.params.id), req.userId!); if (!gig) return res.status(403).json({ message: "You are not assigned to this gig" }); if (gig.status !== GigStatus.ASSIGNED) return res.status(409).json({ message: "Only assigned gigs can be started" }); return res.json({ gig: await prisma.gig.update({ where: { id: gig.id }, data: { status: GigStatus.IN_PROGRESS }, include: gigInclude }) }); }

export async function submitDeliverable(req: Request, res: Response) { try { if (!await requireRole(req.userId!, Role.STUDENT)) return res.status(403).json({ message: "Student access required" }); const gig = await assignedGig(idParam(req.params.id), req.userId!); if (!gig) return res.status(403).json({ message: "You are not assigned to this gig" }); if (gig.status !== GigStatus.IN_PROGRESS && gig.status !== GigStatus.REVISION_REQUESTED) return res.status(409).json({ message: "This gig is not ready for a deliverable" }); const body = req.body as Record<string, unknown>; const fileUrl = text(body.fileUrl, "fileUrl"); const note = text(body.note, "note", false); const [, updated] = await prisma.$transaction([prisma.deliverable.create({ data: { gigId: gig.id, fileUrl, note } }), prisma.gig.update({ where: { id: gig.id }, data: { status: GigStatus.SUBMITTED }, include: gigInclude })]); return res.status(201).json({ gig: updated }); } catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Could not submit deliverable" }); } }

export async function requestRevision(req: Request, res: Response) { try { if (!await requireRole(req.userId!, Role.BUSINESS)) return res.status(403).json({ message: "Business access required" }); const gig = await ownedGig(idParam(req.params.id), req.userId!); if (!gig) return res.status(404).json({ message: "Gig not found" }); if (gig.status !== GigStatus.SUBMITTED) return res.status(409).json({ message: "Only submitted gigs can be sent for revision" }); const feedback = text((req.body as Record<string, unknown>).feedback, "feedback"); const [, updated] = await prisma.$transaction([prisma.revisionRequest.create({ data: { gigId: gig.id, feedback } }), prisma.gig.update({ where: { id: gig.id }, data: { status: GigStatus.REVISION_REQUESTED }, include: gigInclude })]); return res.status(201).json({ gig: updated }); } catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Could not request revision" }); } }

export async function approveGig(req: Request, res: Response) { if (!await requireRole(req.userId!, Role.BUSINESS)) return res.status(403).json({ message: "Business access required" }); const gig = await ownedGig(idParam(req.params.id), req.userId!); if (!gig) return res.status(404).json({ message: "Gig not found" }); if (gig.status !== GigStatus.SUBMITTED) return res.status(409).json({ message: "Only submitted gigs can be approved" }); return res.json({ gig: await prisma.gig.update({ where: { id: gig.id }, data: { status: GigStatus.APPROVED }, include: gigInclude }) }); }
