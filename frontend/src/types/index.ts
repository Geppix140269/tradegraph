/**
 * TradeGraph Frontend Types
 *
 * Shared type definitions mirroring backend entities.
 * Keep in sync with backend/src/common/entities/*.
 */

// ─────────────────────────────────────────────────────────────────────────────
// USER & ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────

export type Tier = 'STARTER' | 'PRO' | 'ENTERPRISE' | 'GOV' | 'CHAMBER';
export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  tier: Tier;
}

export interface Organization {
  id: string;
  name: string;
  tier: Tier;
  seatLimit: number;
  apiQuota: number;
  complianceCredits: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHIPMENT
// ─────────────────────────────────────────────────────────────────────────────

export type TransportMode = 'SEA' | 'AIR' | 'RAIL' | 'ROAD' | 'MULTIMODAL';

export interface Shipment {
  id: string;
  shipperId: string;
  shipperName: string;
  shipperCountryCode: string;
  consigneeId: string;
  consigneeName: string;
  consigneeCountryCode: string;
  originCountryCode: string;
  destinationCountryCode: string;
  portOfLoadingId: string;
  portOfLoadingName: string;
  portOfDischargeId: string;
  portOfDischargeName: string;
  hsCode: string;
  productDescription: string;
  quantity: number;
  quantityUnit: string;
  declaredValueUsd: number | null;
  unitPriceUsd: number | null;
  transportMode: TransportMode;
  carrier: string | null;
  shipmentDate: string;
  arrivalDate: string | null;
}

export interface ShipmentSearchParams {
  hsCode?: string;
  productKeyword?: string;
  shipperName?: string;
  consigneeName?: string;
  originCountries?: string[];
  destinationCountries?: string[];
  portsOfLoading?: string[];
  portsOfDischarge?: string[];
  dateFrom?: string;
  dateTo?: string;
  minQuantity?: number;
  maxQuantity?: number;
  minValueUsd?: number;
  maxValueUsd?: number;
  minUnitPrice?: number;
  maxUnitPrice?: number;
  transportMode?: TransportMode;
  carrier?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  excludeCompanyIds?: string[];
}

export interface ShipmentSearchResult {
  items: Shipment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  aggregations: SearchAggregations;
}

export interface SearchAggregations {
  byOriginCountry: CountAggregation[];
  byDestinationCountry: CountAggregation[];
  byHsChapter: CountAggregation[];
  byTransportMode: CountAggregation[];
  byCarrier: CountAggregation[];
  valueRange: RangeAggregation;
  quantityRange: RangeAggregation;
}

export interface CountAggregation {
  key: string;
  label: string;
  count: number;
}

export interface RangeAggregation {
  min: number;
  max: number;
  avg: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY
// ─────────────────────────────────────────────────────────────────────────────

export type RiskStatus = 'CLEAR' | 'REVIEW_REQUIRED' | 'FLAGGED' | 'SANCTIONED';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Company {
  id: string;
  displayName: string;
  canonicalName: string;
  countryCode: string;
  address: Address | null;
  registrationNumber: string | null;
  riskStatus: RiskStatus;
  lastComplianceCheck: string | null;
  tradeStats: CompanyTradeStats;
}

export interface Address {
  street: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string;
}

export interface CompanyTradeStats {
  importVolumeTotal: number;
  importValueUsd: number;
  importShipmentCount: number;
  topImportOrigins: CountryVolume[];
  topImportProducts: HsCodeVolume[];
  exportVolumeTotal: number;
  exportValueUsd: number;
  exportShipmentCount: number;
  topExportDestinations: CountryVolume[];
  topExportProducts: HsCodeVolume[];
  statsFrom: string;
  statsTo: string;
}

export interface CountryVolume {
  countryCode: string;
  countryName: string;
  volumePercent: number;
  valueUsd: number;
}

export interface HsCodeVolume {
  hsCode: string;
  description: string;
  volumePercent: number;
  valueUsd: number;
}

export interface CompanySearchResult {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplianceCheckResult {
  id: string;
  companyId: string;
  companyName: string;
  status: RiskStatus;
  checkedAt: string;
  checkedBy: string;
  hits: SanctionsHit[];
  creditsRemaining: number;
}

export interface SanctionsHit {
  listName: string;
  matchScore: number;
  matchedName: string;
  programs: string[];
  source: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TARIFFS
// ─────────────────────────────────────────────────────────────────────────────

export interface DutyRateResult {
  hsCode: string;
  origin: string;
  destination: string;
  mfnRate: number;
  preferentialRates: PreferentialRate[];
  tradeMeasures: TradeMeasure[];
  effectiveTotalRate: number;
}

export interface PreferentialRate {
  ftaName: string;
  rate: number;
  conditions: string;
}

export interface TradeMeasure {
  type: 'ANTIDUMPING' | 'COUNTERVAILING' | 'SAFEGUARD' | 'QUOTA';
  rate: number | null;
  quotaVolume: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVED SEARCHES & WATCHLISTS
// ─────────────────────────────────────────────────────────────────────────────

export interface SavedSearch {
  id: string;
  name: string;
  query: ShipmentSearchParams;
  alertEnabled: boolean;
  alertFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY';
  createdAt: string;
  lastAlertSentAt: string | null;
}

export interface Watchlist {
  id: string;
  name: string;
  type: 'COMPANY' | 'HS_CODE' | 'ROUTE';
  itemCount: number;
  alertEnabled: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI STATE
// ─────────────────────────────────────────────────────────────────────────────

export type ViewMode = 'companies' | 'shipments' | 'routes';

export interface SearchState {
  params: ShipmentSearchParams;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
}
