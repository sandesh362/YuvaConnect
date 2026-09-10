import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/providers/auth-provider';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}><AuthProvider><Stack screenOptions={{ headerShown: false }} /></AuthProvider></QueryClientProvider>;
}
