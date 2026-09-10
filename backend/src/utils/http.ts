import { NextFunction, Request, Response } from "express";

/** Error with an HTTP status, handled by the centralized error middleware. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/** Wraps async route handlers so rejections reach the centralized error middleware. */
export function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
}

/** Reads :id-style route params (string | string[] under Express 5 typings). */
export function idParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Reads a single query param as a string (first value wins for repeated params). */
export function queryParam(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first: unknown = value[0];
    return typeof first === "string" ? first : "";
  }
  return "";
}

/**
 * Identity always comes from the verified JWT (requireAuth), never from
 * client-sent fields. Throws 401 if the middleware chain did not authenticate.
 */
export function requireUserId(req: Request): string {
  if (!req.userId) throw new HttpError(401, "Authentication required");
  return req.userId;
}

export interface TextOptions {
  required?: boolean;
  maxLength?: number;
}

/** Validates a string field: trims, enforces presence and max length. */
export function text(value: unknown, field: string, options: TextOptions = {}): string {
  const { required = true, maxLength } = options;
  if (typeof value !== "string") {
    if (!required && value === undefined) return "";
    throw new HttpError(400, `${field} must be a string`);
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw new HttpError(400, `${field} is required`);
  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new HttpError(400, `${field} must be at most ${maxLength} characters`);
  }
  return trimmed;
}

/**
 * Optional string field: missing/blank becomes undefined (stored as NULL),
 * otherwise validated like text().
 */
export function optionalText(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  const result = text(value, field, { required: false, maxLength });
  return result === "" ? undefined : result;
}

/** Validates an integer within [min, max] (used for 1-5 rating scores). */
export function intInRange(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new HttpError(400, `${field} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

/** Offset pagination with clamped bounds; page is 1-based. */
export function pageParams(query: Request["query"], defaultLimit = 20, maxLimit = 50): PageParams {
  const parsedPage = Number.parseInt(queryParam(query.page) || "1", 10);
  const parsedLimit = Number.parseInt(queryParam(query.limit) || String(defaultLimit), 10);
  const page = Math.max(1, Number.isFinite(parsedPage) ? parsedPage : 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Cursor-page size guard for message history. */
export function cursorLimit(query: Request["query"], defaultLimit = 50, maxLimit = 100): number {
  const parsed = Number.parseInt(queryParam(query.limit) || String(defaultLimit), 10);
  if (!Number.isFinite(parsed)) return defaultLimit;
  return Math.min(maxLimit, Math.max(1, parsed));
}
