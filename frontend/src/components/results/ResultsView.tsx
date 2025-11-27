'use client';

import { useState } from 'react';
import {
  Building2,
  Ship,
  Route,
  Download,
  BookmarkPlus,
  Shield,
  ChevronDown,
  ExternalLink,
  Check,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import type { ShipmentSearchResult, Company, Shipment, RiskStatus } from '@/types';

/**
 * ResultsView Component
 *
 * The main search results display. Supports three views:
 * - Companies: Aggregated counterparty view (default for lead gen)
 * - Shipments: Individual transaction records
 * - Routes: Port-to-port flow analysis
 *
 * Key UX features:
 * - Inline risk indicators (clear/review/flagged/sanctioned)
 * - Bulk action bar when items selected
 * - Faceted filtering in sidebar
 *
 * Platform name: TradeNexus
 */

type ViewMode = 'companies' | 'shipments' | 'routes';

interface ResultsViewProps {
  results: ShipmentSearchResult;
  companies: Company[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCompanyClick: (companyId: string) => void;
  onShipmentClick: (shipmentId: string) => void;
  onRiskCheck: (companyId: string) => void;
  onAddToList: (ids: string[]) => void;
  onExport: (format: 'csv' | 'xlsx') => void;
}

// Risk status badge component
function RiskBadge({ status }: { status: RiskStatus }) {
  const config = {
    CLEAR: { icon: Check, className: 'badge-clear', label: 'Clear' },
    REVIEW_REQUIRED: { icon: AlertTriangle, className: 'badge-review', label: 'Review' },
    FLAGGED: { icon: AlertTriangle, className: 'badge-flagged', label: 'Flagged' },
    SANCTIONED: { icon: XCircle, className: 'badge-sanctioned', label: 'Sanctioned' },
  };

  const { icon: Icon, className, label } = config[status];

  return (
    <span className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </span>
  );
}

// Format large numbers
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// Format currency
function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

export function ResultsView({
  results,
  companies,
  viewMode,
  onViewModeChange,
  onCompanyClick,
  onShipmentClick,
  onRiskCheck,
  onAddToList,
  onExport,
}: ResultsViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('volume');

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (viewMode === 'companies') {
      setSelectedIds(new Set(companies.map((c) => c.id)));
    } else {
      setSelectedIds(new Set(results.items.map((s) => s.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <div className="flex-1 flex flex-col">
      {/* View mode tabs + meta info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* View tabs */}
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              onClick={() => onViewModeChange('companies')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'companies'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="h-4 w-4 inline mr-1.5" />
              Companies
            </button>
            <button
              onClick={() => onViewModeChange('shipments')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'shipments'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Ship className="h-4 w-4 inline mr-1.5" />
              Shipments
            </button>
            <button
              onClick={() => onViewModeChange('routes')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'routes'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Route className="h-4 w-4 inline mr-1.5" />
              Routes
            </button>
          </div>

          {/* Results count */}
          <span className="text-sm text-gray-500">
            {viewMode === 'companies'
              ? `${formatNumber(companies.length)} companies`
              : `${formatNumber(results.total)} shipments`}
          </span>
        </div>

        {/* Sort + actions */}
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="volume">Sort by Volume</option>
            <option value="value">Sort by Value</option>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>

          <button onClick={() => onExport('csv')} className="btn-secondary">
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk action bar (appears when items selected) */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToList(Array.from(selectedIds))}
              className="btn-secondary text-sm"
            >
              <BookmarkPlus className="h-4 w-4 mr-1.5" />
              Add to List
            </button>
            <button
              onClick={() => {
                // Run compliance check on all selected
                selectedIds.forEach((id) => onRiskCheck(id));
              }}
              className="btn-secondary text-sm"
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Check Compliance
            </button>
            <button onClick={() => onExport('xlsx')} className="btn-secondary text-sm">
              <Download className="h-4 w-4 mr-1.5" />
              Export Selected
            </button>
            <button onClick={clearSelection} className="btn-ghost text-sm">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Results list - Companies view */}
      {viewMode === 'companies' && (
        <div className="space-y-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="card p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(company.id)}
                  onChange={() => toggleSelection(company.id)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                {/* Company info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => onCompanyClick(company.id)}
                      className="text-base font-medium text-gray-900 hover:text-blue-600 truncate"
                    >
                      {company.displayName}
                    </button>
                    <RiskBadge status={company.riskStatus} />
                  </div>

                  <p className="text-sm text-gray-500 mb-2">
                    {company.address?.city}, {company.countryCode}
                    {company.registrationNumber && ` · Reg: ${company.registrationNumber}`}
                  </p>

                  {/* Trade stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-400">Volume:</span>{' '}
                      <span className="font-medium text-gray-700">
                        {formatNumber(company.tradeStats.importVolumeTotal)} units
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Value:</span>{' '}
                      <span className="font-medium text-gray-700">
                        {formatCurrency(company.tradeStats.importValueUsd)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Top origins:</span>{' '}
                      <span className="text-gray-700">
                        {company.tradeStats.topImportOrigins
                          .slice(0, 3)
                          .map((o) => o.countryCode)
                          .join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCompanyClick(company.id)}
                    className="btn-secondary text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onRiskCheck(company.id)}
                    className="btn-secondary text-sm"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAddToList([company.id])}
                    className="btn-secondary text-sm"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results list - Shipments view */}
      {viewMode === 'shipments' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                </th>
                <th>Date</th>
                <th>Shipper</th>
                <th>Consignee</th>
                <th>Product</th>
                <th>Route</th>
                <th>Qty</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.items.map((shipment) => (
                <tr key={shipment.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(shipment.id)}
                      onChange={() => toggleSelection(shipment.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                  </td>
                  <td className="whitespace-nowrap">
                    {new Date(shipment.shipmentDate).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => onCompanyClick(shipment.shipperId)}
                      className="text-blue-600 hover:underline truncate max-w-[150px] block"
                    >
                      {shipment.shipperName}
                    </button>
                    <span className="text-xs text-gray-400">{shipment.shipperCountryCode}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => onCompanyClick(shipment.consigneeId)}
                      className="text-blue-600 hover:underline truncate max-w-[150px] block"
                    >
                      {shipment.consigneeName}
                    </button>
                    <span className="text-xs text-gray-400">{shipment.consigneeCountryCode}</span>
                  </td>
                  <td>
                    <div className="truncate max-w-[150px]" title={shipment.productDescription}>
                      <span className="text-xs font-mono text-gray-500">{shipment.hsCode}</span>
                      <br />
                      {shipment.productDescription}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    {shipment.portOfLoadingName} → {shipment.portOfDischargeName}
                  </td>
                  <td className="whitespace-nowrap">
                    {formatNumber(shipment.quantity)} {shipment.quantityUnit}
                  </td>
                  <td className="whitespace-nowrap">
                    {shipment.declaredValueUsd
                      ? formatCurrency(shipment.declaredValueUsd)
                      : '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => onShipmentClick(shipment.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {results.page} of {results.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={results.page <= 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={results.page >= results.totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
