import * as ImagePicker from 'expo-image-picker';
import { api, authHeaders } from '@/config/api';
import { BusinessProfile, PortfolioItem, StudentProfile } from '@/types/api';

export async function getProfile(token: string) {
  const { data } = await api.get<{ role: 'STUDENT' | 'BUSINESS'; profile: StudentProfile | BusinessProfile | null }>('/api/profile', { headers: authHeaders(token) });
  return data;
}

export async function updateProfile(token: string, input: Record<string, unknown>) {
  const { data } = await api.put<{ profile: StudentProfile | BusinessProfile }>('/api/profile', input, { headers: authHeaders(token) });
  return data.profile;
}

export async function addPortfolioItem(token: string, input: { title: string; description?: string; imageUrl?: string | null }) {
  const { data } = await api.post<{ item: PortfolioItem }>('/api/profile/portfolio', input, { headers: authHeaders(token) });
  return data.item;
}

export async function removePortfolioItem(token: string, id: string) {
  await api.delete(`/api/profile/portfolio/${id}`, { headers: authHeaders(token) });
}

export async function uploadImage(token: string, asset: ImagePicker.ImagePickerAsset) {
  const form = new FormData();
  form.append('file', {
    uri: asset.uri,
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
    type: asset.mimeType ?? 'image/jpeg',
  } as unknown as Blob);
  const { data } = await api.post<{ url: string }>('/api/upload', form, {
    headers: { ...authHeaders(token), 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
