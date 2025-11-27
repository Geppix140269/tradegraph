import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { TransportMode, ShipmentSortField } from '../../../common/entities/shipment.entity';

/**
 * Search Shipments DTO
 *
 * Validated request body for shipment search.
 * Designed to be intuitive for the frontend while mapping cleanly to OpenSearch.
 */
export class SearchShipmentsDto {
  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT FILTERS
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'HS code (supports wildcards, e.g., "7308*" for all steel structures)',
    example: '730890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  hsCode?: string;

  @ApiPropertyOptional({
    description: 'Full-text search in product description',
    example: 'steel pipe fittings',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  productKeyword?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // PARTY FILTERS
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Shipper (exporter) name - partial match supported',
    example: 'Acme Manufacturing',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  shipperName?: string;

  @ApiPropertyOptional({
    description: 'Consignee (importer) name - partial match supported',
    example: 'Müller GmbH',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  consigneeName?: string;

  @ApiPropertyOptional({ description: 'Specific shipper company ID' })
  @IsOptional()
  @IsString()
  shipperId?: string;

  @ApiPropertyOptional({ description: 'Specific consignee company ID' })
  @IsOptional()
  @IsString()
  consigneeId?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // GEOGRAPHY FILTERS
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Origin countries (ISO 3166-1 alpha-2 codes)',
    example: ['CN', 'IN', 'VN'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  originCountries?: string[];

  @ApiPropertyOptional({
    description: 'Destination countries (ISO 3166-1 alpha-2 codes)',
    example: ['DE', 'FR', 'IT'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  destinationCountries?: string[];

  @ApiPropertyOptional({
    description: 'Ports of loading (UN/LOCODE)',
    example: ['CNSHA', 'CNTAO'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  portsOfLoading?: string[];

  @ApiPropertyOptional({
    description: 'Ports of discharge (UN/LOCODE)',
    example: ['DEHAM', 'NLRTM'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  portsOfDischarge?: string[];

  // ─────────────────────────────────────────────────────────────────────────
  // TIME FILTERS
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Start date for shipment date range',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'End date for shipment date range',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // QUANTITY & VALUE FILTERS
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Minimum quantity', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity', example: 100000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'Minimum declared value (USD)', example: 10000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minValueUsd?: number;

  @ApiPropertyOptional({ description: 'Maximum declared value (USD)', example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxValueUsd?: number;

  @ApiPropertyOptional({ description: 'Minimum unit price (USD per quantity unit)', example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minUnitPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum unit price (USD per quantity unit)', example: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxUnitPrice?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSPORT FILTERS
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Transport mode',
    enum: ['SEA', 'AIR', 'RAIL', 'ROAD', 'MULTIMODAL'],
  })
  @IsOptional()
  @IsEnum(['SEA', 'AIR', 'RAIL', 'ROAD', 'MULTIMODAL'])
  transportMode?: TransportMode;

  @ApiPropertyOptional({ description: 'Carrier/shipping line name', example: 'Maersk' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carrier?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // PAGINATION & SORTING
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['shipmentDate', 'declaredValueUsd', 'quantity', 'unitPriceUsd', 'shipperName', 'consigneeName'],
    default: 'shipmentDate',
  })
  @IsOptional()
  @IsEnum(['shipmentDate', 'declaredValueUsd', 'quantity', 'unitPriceUsd', 'shipperName', 'consigneeName'])
  sortBy?: ShipmentSortField = 'shipmentDate';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  // ─────────────────────────────────────────────────────────────────────────
  // ADVANCED OPTIONS
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Include aggregations in response (for filter UI)',
    default: true,
  })
  @IsOptional()
  includeAggregations?: boolean = true;

  @ApiPropertyOptional({
    description: 'Exclude companies by ID (e.g., to filter out existing customers)',
    example: ['company-id-1', 'company-id-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(100)
  excludeCompanyIds?: string[];
}
