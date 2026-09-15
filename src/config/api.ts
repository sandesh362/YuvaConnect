import Constants from 'expo-constants';
import { create, isAxiosError } from 'axios';

const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

export const API_BASE_URL = configuredUrl ?? 'http://10.0.2.2:4000';

export const api = create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * User-facing copy for a failed request.
 *
 * Rules:
 *  - A request that never reached the server is a connectivity problem, not a
 *    server message ("Network Error" means nothing to a user).
 *  - 5xx responses are our fault and their bodies ("Internal server error",
 *    stack traces, HTML) are not actionable, so they get generic copy.
 *  - 4xx responses are the only ones whose message we trust: the API writes
 *    those for humans ("Invalid credentials", "You have already applied").
 */
export function apiErrorMessage(error: unknown) {
  if (!isAxiosError(error)) return GENERIC_ERROR;

  if (!error.response) {
    return 'Could not reach YuvaConnect. Check your connection and try again.';
  }

  const status = error.response.status;
  if (status >= 500) return 'Something went wrong on our side. Please try again.';

  const message = (error.response.data as { message?: unknown } | undefined)?.message;
  if (typeof message === 'string') {
    const trimmed = message.trim();
    // Guard against HTML/stack bodies being surfaced as copy.
    if (trimmed.length > 0 && trimmed.length <= 140 && !/[<>{}\n]/.test(trimmed)) return trimmed;
  }

  if (status === 401 || status === 403) return 'Your session has expired. Please log in again.';
  if (status === 404) return 'We could not find what you were looking for.';
  return GENERIC_ERROR;
}
