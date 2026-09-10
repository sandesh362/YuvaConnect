import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";

const SALT_ROUNDS = 12;

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

function toPublicUser(user: PublicUser): PublicUser {
  return user;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const { password: _password, ...userInput } = input;
  const user = await prisma.user.create({
    data: { ...userInput, email: input.email.toLowerCase(), passwordHash },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true,
    },
  });
  return toPublicUser(user);
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return toPublicUser(user);
}

export function createAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "1h" });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
}
