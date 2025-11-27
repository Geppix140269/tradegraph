'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Providers Component
 *
 * Wraps the application with necessary context providers:
 * - React Query for data fetching and caching
 * - Auth provider (to be added with Auth0/Clerk)
 * - Theme provider for white-label customization
 *
 * Platform: CargoIntel (working name)
 */

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance per request (prevents shared state in SSR)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes (shipment data doesn't change frequently)
            staleTime: 5 * 60 * 1000,
            // Cache time: 30 minutes
            gcTime: 30 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
