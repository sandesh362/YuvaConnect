import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http";

/** 404 for unmatched routes — mounted after all routers. Keeps the { message } error shape. */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: "Not found" });
}

/**
 * Centralized error handler for routes wrapped in asyncHandler.
 * Only HttpError statuses are trusted; anything else becomes a generic 500
 * so internal details never leak to clients.
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  console.error("Unhandled API error:", error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
}
