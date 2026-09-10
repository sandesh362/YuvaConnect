import { api, authHeaders } from '@/config/api';
import { Message, MessagesPage, NotificationItem, NotificationsPage, Rating, RatingSummary, Report } from '@/types/api';

const headers = (token: string) => ({ headers: authHeaders(token) });

export async function listMessages(token: string, gigId: string, opts: { before?: string; limit?: number } = {}) {
  const { data } = await api.get<MessagesPage>(`/api/gigs/${gigId}/messages`, {
    ...headers(token),
    params: { ...(opts.before ? { before: opts.before } : {}), ...(opts.limit ? { limit: opts.limit } : {}) },
  });
  return data;
}

export async function sendMessage(token: string, gigId: string, content: string) {
  const { data } = await api.post<{ message: Message }>(`/api/gigs/${gigId}/messages`, { content }, headers(token));
  return data.message;
}

export async function rateGig(token: string, gigId: string, input: { score: number; comment?: string }) {
  const { data } = await api.post<{ rating: Rating }>(`/api/gigs/${gigId}/rate`, input, headers(token));
  return data.rating;
}

export async function getMyRating(token: string, gigId: string) {
  const { data } = await api.get<{ rating: Rating | null }>(`/api/gigs/${gigId}/my-rating`, headers(token));
  return data.rating;
}

export async function getUserRatings(token: string, userId: string) {
  const { data } = await api.get<{ summary: RatingSummary; ratings: Rating[]; page: number; limit: number; total: number }>(
    `/api/users/${userId}/ratings`,
    headers(token),
  );
  return data;
}

export async function createReport(token: string, input: { gigId?: string; reason: string }) {
  const { data } = await api.post<{ report: Report }>('/api/reports', input, headers(token));
  return data.report;
}

export async function listNotifications(token: string, opts: { page?: number; limit?: number } = {}) {
  const { data } = await api.get<NotificationsPage>('/api/notifications', {
    ...headers(token),
    params: { ...(opts.page ? { page: opts.page } : {}), ...(opts.limit ? { limit: opts.limit } : {}) },
  });
  return data;
}

export async function markNotificationRead(token: string, id: string) {
  const { data } = await api.patch<{ notification: NotificationItem }>(`/api/notifications/${id}/read`, {}, headers(token));
  return data.notification;
}

export async function markAllNotificationsRead(token: string) {
  const { data } = await api.patch<{ updated: number }>('/api/notifications/read-all', {}, headers(token));
  return data;
}
