'use client';

import { Search, Shield, TrendingUp, Users, Ship, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * QuickTemplates Component
 *
 * Role-based search templates to accelerate common workflows.
 * Each template pre-populates the search with relevant filters
 * and sometimes opens a modal to collect additional parameters.
 */

type UserRole = 'exporter' | 'importer' | 'logistics' | 'chamber' | 'government';

interface Template {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
}

interface QuickTemplatesProps {
  role: UserRole;
}

export function QuickTemplates({ role }: QuickTemplatesProps) {
  const router = useRouter();

  // Templates by role
  const templatesByRole: Record<UserRole, Template[]> = {
    exporter: [
      {
        id: 'find-importers',
        label: 'Find Importers by HS Code',
        description: 'Search for buyers by product category',
        icon: Search,
        action: () => router.push('/search?mode=find-buyers'),
      },
      {
        id: 'check-risk',
        label: 'Check Company Risk',
        description: 'Run sanctions and compliance check',
        icon: Shield,
        action: () => router.push('/compliance/check'),
      },
      {
        id: 'competitor-intel',
        label: 'Competitor Analysis',
        description: "See where competitors' products go",
        icon: TrendingUp,
        action: () => router.push('/search?mode=competitor'),
      },
      {
        id: 'market-entry',
        label: 'Market Entry Analysis',
        description: 'Evaluate a new export market',
        icon: FileText,
        action: () => router.push('/reports/market-entry'),
      },
    ],
    importer: [
      {
        id: 'find-suppliers',
        label: 'Find Suppliers by HS Code',
        description: 'Search for exporters by product',
        icon: Search,
        action: () => router.push('/search?mode=find-suppliers'),
      },
      {
        id: 'check-risk',
        label: 'Verify Supplier',
        description: 'Check compliance and trade history',
        icon: Shield,
        action: () => router.push('/compliance/check'),
      },
      {
        id: 'price-benchmark',
        label: 'Price Benchmarking',
        description: 'Compare unit prices across market',
        icon: TrendingUp,
        action: () => router.push('/analytics/pricing'),
      },
      {
        id: 'duty-lookup',
        label: 'Duty Rate Lookup',
        description: 'Check tariffs and trade measures',
        icon: FileText,
        action: () => router.push('/tariffs'),
      },
    ],
    logistics: [
      {
        id: 'find-shippers',
        label: 'Find Shippers by Route',
        description: 'Identify prospects on specific lanes',
        icon: Ship,
        action: () => router.push('/search?mode=find-shippers'),
      },
      {
        id: 'route-analysis',
        label: 'Route Volume Analysis',
        description: 'See traffic and carriers by lane',
        icon: TrendingUp,
        action: () => router.push('/analytics/routes'),
      },
      {
        id: 'port-congestion',
        label: 'Port Congestion',
        description: 'Real-time terminal delays',
        icon: Ship,
        action: () => router.push('/ports/congestion'),
      },
      {
        id: 'rate-benchmark',
        label: 'Rate Benchmarking',
        description: 'Compare freight rates by lane',
        icon: FileText,
        action: () => router.push('/analytics/rates'),
      },
    ],
    chamber: [
      {
        id: 'member-export-readiness',
        label: 'Member Export Readiness',
        description: 'Score members by trade profile',
        icon: Users,
        action: () => router.push('/members/readiness'),
      },
      {
        id: 'trade-mission',
        label: 'Trade Mission Shortlist',
        description: 'Generate mission candidate list',
        icon: Ship,
        action: () => router.push('/missions/create'),
      },
      {
        id: 'export-report',
        label: 'Generate Export Report',
        description: 'Sector or country report builder',
        icon: FileText,
        action: () => router.push('/reports/builder'),
      },
      {
        id: 'member-search',
        label: 'Search Member Activity',
        description: 'Find member trade data',
        icon: Search,
        action: () => router.push('/members/search'),
      },
    ],
    government: [
      {
        id: 'anomaly-alerts',
        label: 'Anomaly Alerts',
        description: 'Review flagged transactions',
        icon: Shield,
        action: () => router.push('/anomalies'),
      },
      {
        id: 'sector-monitor',
        label: 'Sectoral Monitoring',
        description: 'Deep-dive on strategic sectors',
        icon: TrendingUp,
        action: () => router.push('/sectors'),
      },
      {
        id: 'policy-simulator',
        label: 'Policy Impact Simulator',
        description: 'Model duty changes',
        icon: FileText,
        action: () => router.push('/policy/simulator'),
      },
      {
        id: 'company-investigation',
        label: 'Company Investigation',
        description: 'Full entity profile and network',
        icon: Search,
        action: () => router.push('/investigations'),
      },
    ],
  };

  const templates = templatesByRole[role] || templatesByRole.exporter;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={template.action}
          className="card p-4 text-left hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <template.icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {template.label}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
