import { api, authHeaders } from '@/config/api';
import { Role, User } from '@/types/api';

type AuthResponse = { user: User; accessToken: string };

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>('/api/auth/login', input);
  return data;
}

export async function signup(input: { email: string; password: string; name: string; role: Exclude<Role, 'ADMIN'> }) {
  const { data } = await api.post<AuthResponse>('/api/auth/signup', input);
  return data;
}

export async function getMe(token: string) {
  const { data } = await api.get<{ user: User }>('/api/auth/me', { headers: authHeaders(token) });
  return data.user;
}
