/**
 * Company Entity
 *
 * Represents a trade counterparty (shipper, consignee, or both).
 * Normalized and enriched from multiple data sources:
 * - Customs/B/L records (names as declared)
 * - Corporate registries (legal details)
 * - Sanctions lists (risk flags)
 */
export interface Company {
  id: string;

  // Identity
  canonicalName: string;      // Normalized for matching (uppercase, no punctuation)
  displayName: string;        // Original/preferred display name
  aliases: string[];          // All variations encountered

  // Location
  countryCode: string;        // ISO 3166-1 alpha-2
  address: Address | null;

  // Registry data
  registrationNumber: string | null;
  registrySource: string | null;   // "opencorporates", "orbis", etc.
  legalForm: string | null;        // "GmbH", "Ltd", "Inc", etc.
  incorporationDate: Date | null;

  // Ownership & officers
  officers: Officer[];
  ubos: UltimateBeneficialOwner[];

  // Risk & compliance
  riskFlags: RiskFlag[];
  lastComplianceCheck: Date | null;

  // Trade activity summary (denormalized for fast access)
  tradeStats: CompanyTradeStats;

  // Metadata
  dataQualityScore: number;   // 0-100, based on data completeness
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string;
  raw: string;                // Original unstructured address
}

export interface Officer {
  name: string;
  role: OfficerRole;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
}

export type OfficerRole =
  | 'director'
  | 'secretary'
  | 'ceo'
  | 'cfo'
  | 'authorized_signatory'
  | 'other';

export interface UltimateBeneficialOwner {
  name: string;
  ownershipPercent: number | null;
  countryCode: string | null;
  isPep: boolean;             // Politically Exposed Person flag
}

export interface RiskFlag {
  id: string;
  flagType: RiskFlagType;
  source: string;             // "OFAC_SDN", "EU_SANCTIONS", "internal"
  severity: RiskSeverity;
  details: Record<string, unknown>;
  detectedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
}

export type RiskFlagType =
  | 'SANCTIONS'
  | 'PEP'
  | 'ADVERSE_MEDIA'
  | 'HIGH_RISK_JURISDICTION'
  | 'PRICE_ANOMALY'
  | 'VOLUME_ANOMALY'
  | 'ROUTE_ANOMALY';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CompanyTradeStats {
  // As importer
  importVolumeTotal: number;      // Total quantity units (last 12 months)
  importValueUsd: number;         // Total declared value USD
  importShipmentCount: number;
  topImportOrigins: CountryVolume[];
  topImportProducts: HsCodeVolume[];

  // As exporter
  exportVolumeTotal: number;
  exportValueUsd: number;
  exportShipmentCount: number;
  topExportDestinations: CountryVolume[];
  topExportProducts: HsCodeVolume[];

  // Time range of data
  statsFrom: Date;
  statsTo: Date;
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
