'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi, companiesApi } from '@/lib/api';
import type { ShipmentSearchParams, ShipmentSearchResult, CompanySearchResult } from '@/types';

/**
 * useShipmentSearch Hook
 *
 * React Query hook for shipment search with caching.
 */
export function useShipmentSearch(params: ShipmentSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['shipments', 'search', params],
    queryFn: () => shipmentsApi.search(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * useCompanySearch Hook
 *
 * React Query hook for company search.
 */
export function useCompanySearch(
  params: {
    q?: string;
    country?: string;
    hsCode?: string;
    role?: 'importer' | 'exporter' | 'both';
    page?: number;
    pageSize?: number;
  },
  enabled = true
) {
  return useQuery({
    queryKey: ['companies', 'search', params],
    queryFn: () => companiesApi.search(params),
    enabled,
  });
}

/**
 * useCompany Hook
 *
 * Fetch a single company profile.
 */
export function useCompany(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ['companies', companyId],
    queryFn: () => companiesApi.getById(companyId),
    enabled: enabled && !!companyId,
  });
}

/**
 * useExportShipments Hook
 *
 * Mutation for exporting search results.
 */
export function useExportShipments() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ShipmentSearchParams; format: 'csv' | 'xlsx' }) =>
      shipmentsApi.export(params, format),
    onSuccess: (blob, { format }) => {
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shipments-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
