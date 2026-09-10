import { Prisma, Role } from "@prisma/client";
import { Request, Response } from "express";
import { authenticateUser, createAccessToken, createUser, getUserById } from "../services/auth.service";

function signupInput(body: unknown) {
  const { email, password, name, role } = body as Record<string, unknown>;
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Provide a valid email address");
  if (typeof password !== "string" || password.length < 8) throw new Error("Password must be at least 8 characters");
  if (typeof name !== "string" || !name.trim()) throw new Error("Name is required");
  if (role !== Role.STUDENT && role !== Role.BUSINESS) throw new Error("Role must be STUDENT or BUSINESS");
  return { email: email.trim(), password, name: name.trim(), role };
}

export async function signup(req: Request, res: Response) {
  try {
    const user = await createUser(signupInput(req.body));
    return res.status(201).json({ user, accessToken: createAccessToken(user.id) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    return res.status(400).json({ message: error instanceof Error ? error.message : "Could not create account" });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await authenticateUser(email.trim(), password);
  if (!user) return res.status(401).json({ message: "Invalid email or password" });
  return res.json({ user, accessToken: createAccessToken(user.id) });
}

export async function me(req: Request, res: Response) {
  const user = await getUserById(req.userId!);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
}
