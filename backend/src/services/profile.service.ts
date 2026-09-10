import { Availability, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";

const studentInclude = { portfolioItems: { orderBy: { createdAt: "desc" } } } satisfies Prisma.StudentProfileInclude;

export async function getProfile(userId: string, role: Role) {
  if (role === Role.STUDENT) return prisma.studentProfile.findUnique({ where: { userId }, include: studentInclude });
  if (role === Role.BUSINESS) return prisma.businessProfile.findUnique({ where: { userId } });
  return null;
}

export async function saveStudentProfile(userId: string, input: {
  college?: string; skills?: string[]; bio?: string; availability?: Availability; profileImageUrl?: string | null;
}) {
  return prisma.studentProfile.upsert({
    where: { userId }, create: { userId, ...input }, update: input, include: studentInclude,
  });
}

export async function saveBusinessProfile(userId: string, input: {
  businessName?: string; category?: string; registrationNumber?: string; address?: string; shopImageUrl?: string | null;
}) {
  return prisma.businessProfile.upsert({ where: { userId }, create: { userId, ...input }, update: input });
}

export async function addPortfolioItem(userId: string, input: { title: string; description?: string; imageUrl?: string | null }) {
  await prisma.studentProfile.upsert({ where: { userId }, create: { userId }, update: {} });
  return prisma.portfolioItem.create({ data: { studentProfileId: userId, ...input } });
}

export async function removePortfolioItem(userId: string, id: string) {
  return prisma.portfolioItem.deleteMany({ where: { id, studentProfileId: userId } });
}

export async function verifyProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return null;
  if (user.role === Role.STUDENT) return prisma.studentProfile.upsert({
    where: { userId }, create: { userId, isVerified: true }, update: { isVerified: true }, include: studentInclude,
  });
  if (user.role === Role.BUSINESS) return prisma.businessProfile.upsert({
    where: { userId }, create: { userId, isVerified: true }, update: { isVerified: true },
  });
  return "unsupported";
}
