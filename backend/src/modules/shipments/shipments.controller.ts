import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { SearchShipmentsDto } from './dto/search-shipments.dto';
import { ShipmentResponseDto } from './dto/shipment-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequiresTier } from '../../common/decorators/requires-tier.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Shipments Controller
 *
 * Primary endpoint for trade intelligence searches.
 * This is where exporters find importers, importers find suppliers,
 * and analysts explore trade flows.
 *
 * Key design decisions:
 * - POST for search (complex query bodies, easy to save/share)
 * - Aggregations returned with results for faceted filtering
 * - Tier-based access controls for export limits
 */
@ApiTags('shipments')
@ApiBearerAuth()
@Controller('api/v1/shipments')
@UseGuards(JwtAuthGuard, TierGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  /**
   * Search Shipments
   *
   * The core search endpoint. Supports:
   * - HS code filtering (with wildcards)
   * - Product keyword full-text search
   * - Party name/ID filtering
   * - Geographic filtering (countries, ports)
   * - Date range filtering
   * - Quantity/value range filtering
   *
   * Returns paginated results with aggregations for building filter UI.
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search shipments',
    description: 'Search global shipment records with filters and aggregations',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated shipment results with aggregations',
    type: ShipmentResponseDto,
  })
  @RequiresTier('STARTER') // All tiers can search; limits enforced in service
  async searchShipments(
    @Body() searchDto: SearchShipmentsDto,
    @CurrentUser() user: { id: string; organizationId: string; tier: string },
  ) {
    return this.shipmentsService.search(searchDto, user);
  }

  /**
   * Get Shipment by ID
   *
   * Retrieve full details of a single shipment record.
   * Includes linked company IDs for profile navigation.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get shipment details' })
  @ApiResponse({ status: 200, description: 'Shipment details' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @RequiresTier('STARTER')
  async getShipment(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; organizationId: string },
  ) {
    return this.shipmentsService.findById(id, user);
  }

  /**
   * Get Shipments by Company
   *
   * Retrieve all shipments where a company is shipper or consignee.
   * Used for company profile trade history view.
   */
  @Get('by-company/:companyId')
  @ApiOperation({ summary: 'Get shipments for a company' })
  @ApiQuery({ name: 'role', enum: ['shipper', 'consignee', 'both'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @RequiresTier('STARTER')
  async getShipmentsByCompany(
    @Param('companyId') companyId: string,
    @Query('role') role: 'shipper' | 'consignee' | 'both' = 'both',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @CurrentUser() user: { id: string; organizationId: string },
  ) {
    return this.shipmentsService.findByCompany(companyId, role, { page, pageSize }, user);
  }

  /**
   * Export Shipments
   *
   * Export search results to CSV/Excel.
   * Row limits enforced by tier:
   * - Starter: 500 rows
   * - Pro: 5,000 rows
   * - Enterprise: 50,000 rows
   */
  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export shipment search results' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'] })
  @RequiresTier('STARTER')
  async exportShipments(
    @Body() searchDto: SearchShipmentsDto,
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
    @CurrentUser() user: { id: string; organizationId: string; tier: string },
  ) {
    return this.shipmentsService.export(searchDto, format, user);
  }

  /**
   * Get Trade Route Analytics
   *
   * Aggregate shipment data by route (port pair) for a given HS code.
   * Shows volume, value, top shippers/consignees per route.
   * Useful for logistics companies and market analysis.
   */
  @Get('analytics/routes')
  @ApiOperation({ summary: 'Get trade route analytics' })
  @ApiQuery({ name: 'hsCode', required: true })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @RequiresTier('PRO')
  async getRouteAnalytics(
    @Query('hsCode') hsCode: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.shipmentsService.getRouteAnalytics(hsCode, { dateFrom, dateTo }, user);
  }

  /**
   * Get Price Distribution
   *
   * Statistical distribution of unit prices for an HS code/route.
   * Enables price benchmarking feature.
   * Pro tier and above.
   */
  @Get('analytics/price-distribution')
  @ApiOperation({ summary: 'Get price distribution for HS code' })
  @ApiQuery({ name: 'hsCode', required: true })
  @ApiQuery({ name: 'originCountry', required: false })
  @ApiQuery({ name: 'destinationCountry', required: false })
  @RequiresTier('PRO')
  async getPriceDistribution(
    @Query('hsCode') hsCode: string,
    @Query('originCountry') originCountry?: string,
    @Query('destinationCountry') destinationCountry?: string,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.shipmentsService.getPriceDistribution(hsCode, {
      originCountry,
      destinationCountry,
    }, user);
  }
}
