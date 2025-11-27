import { ApiProperty } from '@nestjs/swagger';

/**
 * Aggregations DTO - defined first as it's referenced by ShipmentResponseDto
 */
export class AggregationsDto {
  @ApiProperty({ type: [Object] })
  byOriginCountry: { key: string; label: string; count: number }[];

  @ApiProperty({ type: [Object] })
  byDestinationCountry: { key: string; label: string; count: number }[];

  @ApiProperty({ type: [Object] })
  byHsChapter: { key: string; label: string; count: number }[];

  @ApiProperty({ type: [Object] })
  byTransportMode: { key: string; label: string; count: number }[];

  @ApiProperty({ type: [Object] })
  byCarrier: { key: string; label: string; count: number }[];

  @ApiProperty()
  valueRange: { min: number; max: number; avg: number };

  @ApiProperty()
  quantityRange: { min: number; max: number; avg: number };
}

/**
 * Shipment DTO
 */
export class ShipmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shipperId: string;

  @ApiProperty()
  shipperName: string;

  @ApiProperty()
  shipperCountryCode: string;

  @ApiProperty()
  consigneeId: string;

  @ApiProperty()
  consigneeName: string;

  @ApiProperty()
  consigneeCountryCode: string;

  @ApiProperty()
  hsCode: string;

  @ApiProperty()
  productDescription: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  quantityUnit: string;

  @ApiProperty({ required: false })
  declaredValueUsd?: number;

  @ApiProperty({ required: false })
  unitPriceUsd?: number;

  @ApiProperty()
  portOfLoadingName: string;

  @ApiProperty()
  portOfDischargeName: string;

  @ApiProperty()
  shipmentDate: string;
}

/**
 * Shipment Response DTO
 *
 * Swagger-documented response type for shipment search results.
 */
export class ShipmentResponseDto {
  @ApiProperty({ description: 'Array of shipment records', type: [ShipmentDto] })
  items: ShipmentDto[];

  @ApiProperty({ description: 'Total matching records' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Results per page' })
  pageSize: number;

  @ApiProperty({ description: 'Total pages available' })
  totalPages: number;

  @ApiProperty({ description: 'Aggregations for faceted filtering', type: AggregationsDto })
  aggregations: AggregationsDto;
}
