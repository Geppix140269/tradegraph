/**
 * Shipment Entity
 *
 * Core transactional record representing a single shipment/consignment.
 * Sourced from customs declarations, bills of lading, or trade statistics.
 *
 * This is the primary fact table for trade intelligence queries.
 */
export interface Shipment {
  id: string;

  // ─────────────────────────────────────────────────────────────────────────
  // PARTIES
  // ─────────────────────────────────────────────────────────────────────────
  shipperId: string;              // FK to Company (exporter)
  shipperName: string;            // Denormalized for search
  shipperCountryCode: string;

  consigneeId: string;            // FK to Company (importer)
  consigneeName: string;          // Denormalized for search
  consigneeCountryCode: string;

  notifyPartyId: string | null;   // Often the actual buyer or agent
  notifyPartyName: string | null;

  // ─────────────────────────────────────────────────────────────────────────
  // ROUTING
  // ─────────────────────────────────────────────────────────────────────────
  originCountryCode: string;      // ISO 3166-1 alpha-2
  destinationCountryCode: string;

  portOfLoadingId: string;        // FK to Port (UN/LOCODE)
  portOfLoadingName: string;

  portOfDischargeId: string;      // FK to Port
  portOfDischargeName: string;

  transshipmentPorts: string[];   // List of intermediate ports (if known)

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT
  // ─────────────────────────────────────────────────────────────────────────
  hsCode: string;                 // 6-digit WCO harmonized code
  nationalHsCode: string | null;  // 8-10 digit national tariff code
  productDescription: string;     // As declared
  normalizedDescription: string;  // Cleaned/categorized

  // ─────────────────────────────────────────────────────────────────────────
  // QUANTITIES & VALUE
  // ─────────────────────────────────────────────────────────────────────────
  quantity: number;
  quantityUnit: QuantityUnit;
  grossWeightKg: number | null;
  netWeightKg: number | null;

  declaredValueUsd: number | null;    // CIF or FOB value in USD
  declaredValueOriginal: number | null;
  declaredValueCurrency: string | null;

  // Calculated/derived
  unitPriceUsd: number | null;        // declaredValueUsd / quantity

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSPORT DETAILS
  // ─────────────────────────────────────────────────────────────────────────
  transportMode: TransportMode;
  carrier: string | null;             // Shipping line, airline, etc.
  vesselName: string | null;
  voyageNumber: string | null;
  billOfLadingNumber: string | null;
  containerNumbers: string[];
  containerCount: number | null;
  teuEquivalent: number | null;       // Twenty-foot equivalent units

  // ─────────────────────────────────────────────────────────────────────────
  // DATES
  // ─────────────────────────────────────────────────────────────────────────
  shipmentDate: Date;                 // Date of departure/loading
  arrivalDate: Date | null;           // Date of arrival/discharge
  declarationDate: Date | null;       // Customs declaration date

  // ─────────────────────────────────────────────────────────────────────────
  // DATA PROVENANCE
  // ─────────────────────────────────────────────────────────────────────────
  dataSource: DataSource;
  dataSourceRef: string | null;       // Original record ID in source
  dataQualityScore: number;           // 0-100, completeness/reliability

  createdAt: Date;
  updatedAt: Date;
}

export type QuantityUnit =
  | 'KG'
  | 'MT'           // Metric tons
  | 'LBS'
  | 'PCS'          // Pieces
  | 'CTN'          // Cartons
  | 'PKG'          // Packages
  | 'TEU'          // Container equivalent
  | 'CBM'          // Cubic meters
  | 'SQM'          // Square meters
  | 'L'            // Liters
  | 'OTHER';

export type TransportMode = 'SEA' | 'AIR' | 'RAIL' | 'ROAD' | 'MULTIMODAL';

export type DataSource =
  | 'US_CUSTOMS'
  | 'EU_COMEXT'
  | 'CN_CUSTOMS'
  | 'IN_CUSTOMS'
  | 'CARRIER_BL'    // Direct from shipping lines
  | 'PORT_DATA'
  | 'AGGREGATOR';   // Third-party data provider

/**
 * Shipment Search Query
 *
 * Represents the search criteria for shipment discovery.
 * Used by the search service to build OpenSearch queries.
 */
export interface ShipmentSearchQuery {
  // Product filters
  hsCode?: string;                    // Supports wildcards: "7308*"
  productKeyword?: string;            // Full-text search in description

  // Party filters
  shipperName?: string;
  consigneeName?: string;
  shipperId?: string;
  consigneeId?: string;

  // Geography filters
  originCountries?: string[];
  destinationCountries?: string[];
  portsOfLoading?: string[];
  portsOfDischarge?: string[];

  // Time filters
  dateFrom?: Date;
  dateTo?: Date;

  // Quantity/value filters
  minQuantity?: number;
  maxQuantity?: number;
  minValueUsd?: number;
  maxValueUsd?: number;
  minUnitPrice?: number;
  maxUnitPrice?: number;

  // Transport filters
  transportMode?: TransportMode;
  carrier?: string;

  // Pagination & sorting
  page?: number;
  pageSize?: number;
  sortBy?: ShipmentSortField;
  sortOrder?: 'asc' | 'desc';
}

export type ShipmentSortField =
  | 'shipmentDate'
  | 'declaredValueUsd'
  | 'quantity'
  | 'unitPriceUsd'
  | 'shipperName'
  | 'consigneeName';

/**
 * Shipment Search Result
 *
 * Paginated response with aggregations for faceted filtering.
 */
export interface ShipmentSearchResult {
  items: Shipment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  // Aggregations for filters
  aggregations: {
    byOriginCountry: CountAggregation[];
    byDestinationCountry: CountAggregation[];
    byHsChapter: CountAggregation[];
    byTransportMode: CountAggregation[];
    byCarrier: CountAggregation[];
    valueRange: RangeAggregation;
    quantityRange: RangeAggregation;
  };
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
