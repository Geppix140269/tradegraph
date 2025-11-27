import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TariffsService } from './tariffs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequiresTier } from '../../common/decorators/requires-tier.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Tariffs Controller
 *
 * Duty rates, trade measures, and regulatory information.
 * Essential for importers to understand landed cost.
 *
 * Data sources:
 * - WTO Tariff Database
 * - TARIC (EU)
 * - USITC HTS
 * - National customs authorities
 */
@ApiTags('tariffs')
@ApiBearerAuth()
@Controller('api/v1/tariffs')
@UseGuards(JwtAuthGuard, TierGuard)
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  /**
   * Get Duty Rates
   *
   * Lookup applicable duty rates for an HS code + origin/destination.
   * Returns:
   * - MFN (Most Favored Nation) rate
   * - Preferential rates under FTAs
   * - Any active trade measures (AD/CVD, safeguards, quotas)
   */
  @Get('rates')
  @ApiOperation({ summary: 'Get duty rates for HS code and route' })
  @ApiQuery({ name: 'hsCode', required: true, description: 'HS code (6-10 digits)' })
  @ApiQuery({ name: 'origin', required: true, description: 'Origin country code' })
  @ApiQuery({ name: 'destination', required: true, description: 'Destination country code' })
  @ApiResponse({
    status: 200,
    description: 'Duty rates and trade measures',
    schema: {
      properties: {
        hsCode: { type: 'string' },
        origin: { type: 'string' },
        destination: { type: 'string' },
        mfnRate: { type: 'number', description: 'MFN duty percentage' },
        preferentialRates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ftaName: { type: 'string' },
              rate: { type: 'number' },
              conditions: { type: 'string' },
            },
          },
        },
        tradeMeasures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['ANTIDUMPING', 'COUNTERVAILING', 'SAFEGUARD', 'QUOTA'] },
              rate: { type: 'number' },
              effectiveFrom: { type: 'string' },
              effectiveTo: { type: 'string' },
            },
          },
        },
        effectiveTotalRate: { type: 'number', description: 'Total applicable duty %' },
      },
    },
  })
  @RequiresTier('STARTER')
  async getDutyRates(
    @Query('hsCode') hsCode: string,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.tariffsService.getDutyRates(hsCode, origin, destination);
  }

  /**
   * Get Trade Measures
   *
   * Active anti-dumping, countervailing duties, safeguards, and quotas
   * for a specific HS code or all codes for an origin/destination pair.
   */
  @Get('measures')
  @ApiOperation({ summary: 'Get active trade measures' })
  @ApiQuery({ name: 'hsCode', required: false, description: 'HS code (optional)' })
  @ApiQuery({ name: 'origin', required: false, description: 'Origin country (optional)' })
  @ApiQuery({ name: 'destination', required: true, description: 'Importing country' })
  @RequiresTier('STARTER')
  async getTradeMeasures(
    @Query('destination') destination: string,
    @Query('hsCode') hsCode?: string,
    @Query('origin') origin?: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.tariffsService.getTradeMeasures({ hsCode, origin, destination });
  }

  /**
   * Get HS Code Details
   *
   * Hierarchical HS code information:
   * - Description at each level (chapter, heading, subheading)
   * - Related codes
   * - Common product examples
   */
  @Get('hs-codes/:code')
  @ApiOperation({ summary: 'Get HS code details' })
  @RequiresTier('STARTER')
  async getHsCodeDetails(
    @Query('code') code: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.tariffsService.getHsCodeDetails(code);
  }

  /**
   * Search HS Codes
   *
   * Find HS codes by product description.
   * Uses full-text search + ML classification.
   */
  @Get('hs-codes')
  @ApiOperation({ summary: 'Search HS codes by description' })
  @ApiQuery({ name: 'q', required: true, description: 'Product description' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequiresTier('STARTER')
  async searchHsCodes(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
    @CurrentUser() user?: { id: string },
  ) {
    return this.tariffsService.searchHsCodes(query, limit);
  }

  /**
   * Get FTAs for Route
   *
   * List applicable Free Trade Agreements for a country pair.
   * Shows eligibility conditions and potential savings.
   */
  @Get('ftas')
  @ApiOperation({ summary: 'Get FTAs applicable to a route' })
  @ApiQuery({ name: 'origin', required: true })
  @ApiQuery({ name: 'destination', required: true })
  @RequiresTier('STARTER')
  async getFTAs(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.tariffsService.getFTAs(origin, destination);
  }

  /**
   * Calculate Landed Cost Estimate
   *
   * Estimate total import cost including:
   * - Product value (CIF)
   * - Duty
   * - Trade measures
   * - Estimated VAT/GST
   *
   * Note: This is an estimate; actual costs depend on specific circumstances.
   */
  @Get('landed-cost')
  @ApiOperation({ summary: 'Estimate landed cost for an import' })
  @ApiQuery({ name: 'hsCode', required: true })
  @ApiQuery({ name: 'origin', required: true })
  @ApiQuery({ name: 'destination', required: true })
  @ApiQuery({ name: 'cifValue', required: true, type: Number, description: 'CIF value in USD' })
  @RequiresTier('PRO')
  async calculateLandedCost(
    @Query('hsCode') hsCode: string,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('cifValue') cifValue: number,
    @CurrentUser() user?: { id: string },
  ) {
    return this.tariffsService.calculateLandedCost(hsCode, origin, destination, cifValue);
  }

  /**
   * Policy Impact Simulation (Government Tier)
   *
   * Simulate the impact of a proposed duty change on historical trade.
   * Used by government analysts for policy assessment.
   */
  @Get('simulate-policy')
  @ApiOperation({ summary: 'Simulate policy impact on trade flows' })
  @ApiQuery({ name: 'hsCode', required: true })
  @ApiQuery({ name: 'origin', required: false, description: 'Target origin (or all)' })
  @ApiQuery({ name: 'destination', required: true })
  @ApiQuery({ name: 'newDutyRate', required: true, type: Number })
  @ApiQuery({ name: 'lookbackMonths', required: false, type: Number, description: 'Historical period to analyze' })
  @RequiresTier('GOV')
  async simulatePolicyImpact(
    @Query('hsCode') hsCode: string,
    @Query('destination') destination: string,
    @Query('newDutyRate') newDutyRate: number,
    @Query('origin') origin?: string,
    @Query('lookbackMonths') lookbackMonths: number = 12,
    @CurrentUser() user?: { id: string },
  ) {
    return this.tariffsService.simulatePolicyImpact({
      hsCode,
      origin,
      destination,
      newDutyRate,
      lookbackMonths,
    });
  }
}
