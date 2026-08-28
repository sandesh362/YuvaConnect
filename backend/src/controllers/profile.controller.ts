import { Availability, Role } from "@prisma/client";
import { Request, Response } from "express";
import { addPortfolioItem, getProfile, removePortfolioItem, saveBusinessProfile, saveStudentProfile, verifyProfile } from "../services/profile.service";
import { prisma } from "../config/prisma";

function optionalString(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  return value.trim();
}

async function currentUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
}

export async function getCurrentProfile(req: Request, res: Response) {
  const user = await currentUser(req.userId!);
  if (!user || user.role === Role.ADMIN) return res.status(404).json({ message: "Profile not found" });
  const profile = await getProfile(req.userId!, user.role);
  return res.json({ role: user.role, profile });
}

export async function updateCurrentProfile(req: Request, res: Response) {
  try {
    const user = await currentUser(req.userId!);
    if (!user || user.role === Role.ADMIN) return res.status(403).json({ message: "This user cannot have a profile" });
    const body = req.body as Record<string, unknown>;
    if (user.role === Role.STUDENT) {
      let skills: string[] | undefined;
      if (body.skills !== undefined) {
        if (!Array.isArray(body.skills) || body.skills.some((skill) => typeof skill !== "string")) throw new Error("Skills must be an array of strings");
        skills = body.skills.map((skill) => skill.trim()).filter(Boolean);
      }
      const availability = body.availability;
      if (availability !== undefined && !Object.values(Availability).includes(availability as Availability)) {
        throw new Error("Invalid availability");
      }
      const profile = await saveStudentProfile(req.userId!, {
        college: optionalString(body.college, "College") ?? undefined,
        skills,
        bio: optionalString(body.bio, "Bio") ?? undefined,
        availability: availability as Availability | undefined,
        profileImageUrl: optionalString(body.profileImageUrl, "Profile image URL"),
      });
      return res.json({ profile });
    }
    const profile = await saveBusinessProfile(req.userId!, {
      businessName: optionalString(body.businessName, "Business name") ?? undefined,
      category: optionalString(body.category, "Category") ?? undefined,
      registrationNumber: optionalString(body.registrationNumber, "Registration number") ?? undefined,
      address: optionalString(body.address, "Address") ?? undefined,
      shopImageUrl: optionalString(body.shopImageUrl, "Shop image URL"),
    });
    return res.json({ profile });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Could not update profile" });
  }
}

export async function createPortfolioItem(req: Request, res: Response) {
  const user = await currentUser(req.userId!);
  if (user?.role !== Role.STUDENT) return res.status(403).json({ message: "Student access required" });
  try {
    const { title, description, imageUrl } = req.body as Record<string, unknown>;
    if (typeof title !== "string" || !title.trim()) throw new Error("Title is required");
    const item = await addPortfolioItem(req.userId!, {
      title: title.trim(), description: optionalString(description, "Description") ?? undefined,
      imageUrl: optionalString(imageUrl, "Image URL"),
    });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Could not add portfolio item" });
  }
}

export async function deletePortfolioItem(req: Request, res: Response) {
  const user = await currentUser(req.userId!);
  if (user?.role !== Role.STUDENT) return res.status(403).json({ message: "Student access required" });
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await removePortfolioItem(req.userId!, id);
  if (!result.count) return res.status(404).json({ message: "Portfolio item not found" });
  return res.status(204).send();
}

export async function verifyUserProfile(req: Request, res: Response) {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const profile = await verifyProfile(userId);
  if (!profile) return res.status(404).json({ message: "User not found" });
  if (profile === "unsupported") return res.status(400).json({ message: "Administrators do not have profiles" });
  return res.json({ profile });
}
