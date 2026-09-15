import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';

import { AuthProvider } from '@/providers/auth-provider';

/**
 * App-wide server-state policy.
 *
 * The default React Query client retries a failed query 3 times with
 * exponential backoff, so on a flaky connection a screen sat on its loading
 * skeleton for 7+ seconds before admitting anything was wrong. One quick retry
 * gives a transient blip a chance to recover while still failing fast enough
 * that the error state (with its Retry button) appears almost immediately.
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        retryDelay: 800,
        staleTime: 30_000,
        // Re-fetching on every focus made list screens flicker; 30s staleTime
        // covers the common case, and pull-to-refresh is always available.
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
