import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!payload.sub || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { role: true },
  });
  if (user?.role !== Role.ADMIN) {
    return res.status(403).json({ message: "Administrator access required" });
  }
  next();
}
