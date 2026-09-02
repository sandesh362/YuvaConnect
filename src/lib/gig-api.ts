import { api, authHeaders } from '@/config/api';
import { Application, Gig, Payment } from '@/types/api';

export type GigInput = { title: string; description: string; skillsRequired: string[]; budget: number; deadline: string; location: string };
const headers = (token: string) => ({ headers: authHeaders(token) });
export async function listGigs(token: string, filters: Record<string, string> = {}) { const { data } = await api.get<{ gigs: Gig[] }>('/api/gigs', { ...headers(token), params: filters }); return data.gigs; }
export async function getGig(token: string, id: string) { const { data } = await api.get<{ gig: Gig }>(`/api/gigs/${id}`, headers(token)); return data.gig; }
export async function getMyGigs(token: string) { const { data } = await api.get<{ gigs: Gig[]; applications?: Application[] }>('/api/gigs/mine', headers(token)); return data; }
export async function createGig(token: string, input: GigInput) { const { data } = await api.post<{ gig: Gig }>('/api/gigs', input, headers(token)); return data.gig; }
export async function applyToGig(token: string, id: string, input: { proposal: string; relevantExperience: string; availability: string }) { const { data } = await api.post<{ application: Application }>(`/api/gigs/${id}/apply`, input, headers(token)); return data.application; }
export async function getApplicants(token: string, gigId: string) { const { data } = await api.get<{ applicants: (Application & { student: UserSummary; rating: number | null; pastGigCount: number })[] }>(`/api/gigs/${gigId}/applicants`, headers(token)); return data.applicants; }
type UserSummary = { id: string; name: string; email: string; studentProfile?: { college: string; skills: string[]; bio: string; profileImageUrl: string | null } | null };
export async function selectApplicant(token: string, id: string) { await api.patch(`/api/gigs/applications/${id}/select`, {}, headers(token)); }
export async function rejectApplicant(token: string, id: string) { await api.patch(`/api/gigs/applications/${id}/reject`, {}, headers(token)); }
export async function startGig(token: string, id: string) { const { data } = await api.patch<{ gig: Gig }>(`/api/gigs/${id}/start`, {}, headers(token)); return data.gig; }
export async function submitGig(token: string, id: string, input: { fileUrl: string; note: string }) { const { data } = await api.post<{ gig: Gig }>(`/api/gigs/${id}/submit`, input, headers(token)); return data.gig; }
export async function requestRevision(token: string, id: string, feedback: string) { const { data } = await api.post<{ gig: Gig }>(`/api/gigs/${id}/request-revision`, { feedback }, headers(token)); return data.gig; }
export async function approveGig(token: string, id: string) { const { data } = await api.patch<{ gig: Gig }>(`/api/gigs/${id}/approve`, {}, headers(token)); return data.gig; }
export type PaymentOrder = { id: string; amount: number; currency: string; keyId: string };
export type RazorpayPaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
export type EarningsPayment = { id: string; gigId: string; gigTitle: string; amount: string; date: string };
export async function createPaymentOrder(token: string, id: string) { const { data } = await api.post<{ order: PaymentOrder; payment: Payment }>(`/api/gigs/${id}/create-order`, {}, headers(token)); return data; }
export async function verifyPayment(token: string, id: string, payment: RazorpayPaymentResponse) { const { data } = await api.post<{ payment: Payment }>(`/api/gigs/${id}/verify-payment`, payment, headers(token)); return data.payment; }
export async function releasePayment(token: string, id: string) { const { data } = await api.post<{ payment: Payment; gig: Gig }>(`/api/gigs/${id}/release-payment`, {}, headers(token)); return data; }
export async function getEarnings(token: string) { const { data } = await api.get<{ payments: EarningsPayment[]; total: string }>('/api/earnings', headers(token)); return data; }
