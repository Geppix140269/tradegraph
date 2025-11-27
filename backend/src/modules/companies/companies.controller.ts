import {
  Controller,
  Get,
  Param,
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
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequiresTier } from '../../common/decorators/requires-tier.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Companies Controller
 *
 * Company profile access and search.
 * Companies are the primary entities users want to discover and validate.
 *
 * Key features:
 * - Full profile with trade stats, registry data, risk flags
 * - Related entity navigation (officers, UBOs, trade partners)
 * - Look-alike company discovery (Pro tier)
 */
@ApiTags('companies')
@ApiBearerAuth()
@Controller('api/v1/companies')
@UseGuards(JwtAuthGuard, TierGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * Get Company by ID
   *
   * Full company profile including:
   * - Registry data (name, address, registration, officers)
   * - Trade statistics (import/export volumes, top products, partners)
   * - Risk flags and last compliance check date
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get company profile' })
  @ApiResponse({ status: 200, description: 'Company profile' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @RequiresTier('STARTER')
  async getCompany(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; organizationId: string },
  ) {
    return this.companiesService.findById(id, user);
  }

  /**
   * Search Companies
   *
   * Find companies by name, country, or trade profile.
   * Useful for direct company lookup (vs. discovering via shipments).
   */
  @Get()
  @ApiOperation({ summary: 'Search companies' })
  @ApiQuery({ name: 'q', description: 'Company name search', required: false })
  @ApiQuery({ name: 'country', description: 'Country code (ISO 3166-1)', required: false })
  @ApiQuery({ name: 'hsCode', description: 'Filter by companies trading this HS code', required: false })
  @ApiQuery({ name: 'role', enum: ['importer', 'exporter', 'both'], required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @RequiresTier('STARTER')
  async searchCompanies(
    @Query('q') query?: string,
    @Query('country') country?: string,
    @Query('hsCode') hsCode?: string,
    @Query('role') role?: 'importer' | 'exporter' | 'both',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.companiesService.search({
      query,
      country,
      hsCode,
      role,
      page,
      pageSize,
    }, user);
  }

  /**
   * Get Trade Partners
   *
   * List companies that this company has traded with.
   * Shows volume, value, and recency of relationship.
   */
  @Get(':id/trade-partners')
  @ApiOperation({ summary: 'Get trade partners for a company' })
  @ApiQuery({ name: 'role', enum: ['buyers', 'suppliers', 'both'], required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @RequiresTier('STARTER')
  async getTradePartners(
    @Param('id') companyId: string,
    @Query('role') role: 'buyers' | 'suppliers' | 'both' = 'both',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.companiesService.getTradePartners(companyId, role, { page, pageSize }, user);
  }

  /**
   * Get Similar Companies (Look-Alike Finder)
   *
   * ML-powered similarity based on:
   * - Product mix (HS codes traded)
   * - Trade volumes
   * - Geographic footprint
   * - Industry classification
   *
   * Pro tier feature.
   */
  @Get(':id/similar')
  @ApiOperation({ summary: 'Find similar companies (look-alike)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results (1-50)' })
  @RequiresTier('PRO')
  async getSimilarCompanies(
    @Param('id') companyId: string,
    @Query('limit') limit: number = 10,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.companiesService.findSimilar(companyId, Math.min(limit, 50), user);
  }

  /**
   * Get Company Officers
   *
   * Directors, secretaries, and other registered officers.
   * From corporate registry data.
   */
  @Get(':id/officers')
  @ApiOperation({ summary: 'Get company officers' })
  @RequiresTier('STARTER')
  async getOfficers(
    @Param('id') companyId: string,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.companiesService.getOfficers(companyId, user);
  }

  /**
   * Get Ultimate Beneficial Owners
   *
   * UBO data where available.
   * Enterprise tier for full UBO drill-down.
   */
  @Get(':id/ubos')
  @ApiOperation({ summary: 'Get ultimate beneficial owners' })
  @RequiresTier('ENTERPRISE')
  async getUBOs(
    @Param('id') companyId: string,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.companiesService.getUBOs(companyId, user);
  }

  /**
   * Get Company Trade Timeline
   *
   * Monthly trade activity over time.
   * Useful for trend analysis and due diligence.
   */
  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get trade activity timeline' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Lookback period (1-36)' })
  @RequiresTier('PRO')
  async getTradeTimeline(
    @Param('id') companyId: string,
    @Query('months') months: number = 12,
    @CurrentUser() user?: { id: string; organizationId: string },
  ) {
    return this.companiesService.getTradeTimeline(companyId, Math.min(months, 36), user);
  }
}
