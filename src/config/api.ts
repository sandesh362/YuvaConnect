import Constants from 'expo-constants';
import axios from 'axios';

const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

export const API_BASE_URL = configuredUrl ?? 'http://10.0.2.2:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.message ?? 'Something went wrong. Please try again.';
  return 'Something went wrong. Please try again.';
}
