import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { RunCheckDto } from './dto/run-check.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequiresTier } from '../../common/decorators/requires-tier.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckCredits } from '../../common/decorators/check-credits.decorator';

/**
 * Compliance Controller
 *
 * Risk and sanctions screening endpoints.
 * This is a key revenue driver - compliance checks are metered.
 *
 * Screening sources:
 * - OFAC SDN (US)
 * - EU Consolidated Sanctions
 * - UN Security Council
 * - UK Sanctions
 * - PEP databases (Pro tier)
 * - Adverse media (Enterprise tier)
 */
@ApiTags('compliance')
@ApiBearerAuth()
@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard, TierGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * Run Compliance Check
   *
   * Screen a company against sanctions lists.
   * Results include:
   * - Match status (CLEAR, REVIEW_REQUIRED, MATCH)
   * - Match details (which list, match confidence, programs)
   * - Recommended actions
   *
   * Consumes check credits based on tier.
   */
  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run sanctions/compliance check on a company',
    description: 'Screens against OFAC, EU, UN, UK sanctions lists. Consumes check credits.',
  })
  @ApiResponse({
    status: 200,
    description: 'Compliance check result',
    schema: {
      properties: {
        companyId: { type: 'string' },
        status: { type: 'string', enum: ['CLEAR', 'REVIEW_REQUIRED', 'MATCH'] },
        checkedAt: { type: 'string', format: 'date-time' },
        hits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              listName: { type: 'string' },
              matchScore: { type: 'number' },
              matchedName: { type: 'string' },
              programs: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        creditsRemaining: { type: 'number' },
      },
    },
  })
  @RequiresTier('STARTER')
  @CheckCredits('COMPLIANCE_CHECK') // Decorator that verifies & deducts credits
  async runCheck(
    @Body() checkDto: RunCheckDto,
    @CurrentUser() user: { id: string; organizationId: string; tier: string },
  ) {
    return this.complianceService.runCheck(checkDto, user);
  }

  /**
   * Batch Compliance Check
   *
   * Screen multiple companies at once.
   * Useful for validating a list of prospects.
   * Consumes credits per company checked.
   */
  @Post('check/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run compliance check on multiple companies' })
  @RequiresTier('PRO')
  @CheckCredits('COMPLIANCE_CHECK_BATCH')
  async runBatchCheck(
    @Body() body: { companyIds: string[] },
    @CurrentUser() user: { id: string; organizationId: string; tier: string },
  ) {
    return this.complianceService.runBatchCheck(body.companyIds, user);
  }

  /**
   * Get Check History
   *
   * Audit trail of compliance checks run by the organization.
   * Required for compliance documentation.
   */
  @Get('history')
  @ApiOperation({ summary: 'Get compliance check history' })
  @RequiresTier('STARTER')
  async getCheckHistory(
    @CurrentUser() user: { id: string; organizationId: string },
  ) {
    return this.complianceService.getHistory(user.organizationId);
  }

  /**
   * Get Check Result
   *
   * Retrieve a specific past check result.
   * Useful for generating PDF reports.
   */
  @Get('check/:checkId')
  @ApiOperation({ summary: 'Get a specific compliance check result' })
  @RequiresTier('STARTER')
  async getCheckResult(
    @Param('checkId') checkId: string,
    @CurrentUser() user: { id: string; organizationId: string },
  ) {
    return this.complianceService.getCheckResult(checkId, user.organizationId);
  }

  /**
   * Export Check as PDF
   *
   * Generate a branded PDF report of the compliance check.
   * Useful for internal records and auditors.
   */
  @Get('check/:checkId/pdf')
  @ApiOperation({ summary: 'Export compliance check as PDF' })
  @RequiresTier('STARTER')
  async exportCheckPdf(
    @Param('checkId') checkId: string,
    @CurrentUser() user: { id: string; organizationId: string },
  ) {
    return this.complianceService.exportPdf(checkId, user.organizationId);
  }

  /**
   * Run PEP Check
   *
   * Check if company officers/UBOs are Politically Exposed Persons.
   * Premium feature - Pro tier and above.
   */
  @Post('pep-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run PEP (Politically Exposed Person) check' })
  @RequiresTier('PRO')
  @CheckCredits('PEP_CHECK')
  async runPepCheck(
    @Body() body: { companyId: string },
    @CurrentUser() user: { id: string; organizationId: string; tier: string },
  ) {
    return this.complianceService.runPepCheck(body.companyId, user);
  }

  /**
   * Run Adverse Media Check
   *
   * Search news and public records for negative mentions.
   * Enterprise tier feature.
   */
  @Post('adverse-media-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run adverse media screening' })
  @RequiresTier('ENTERPRISE')
  @CheckCredits('ADVERSE_MEDIA_CHECK')
  async runAdverseMediaCheck(
    @Body() body: { companyId: string },
    @CurrentUser() user: { id: string; organizationId: string; tier: string },
  ) {
    return this.complianceService.runAdverseMediaCheck(body.companyId, user);
  }

  /**
   * Get Credits Balance
   *
   * Check remaining compliance check credits for the organization.
   */
  @Get('credits')
  @ApiOperation({ summary: 'Get remaining compliance check credits' })
  @RequiresTier('STARTER')
  async getCreditsBalance(
    @CurrentUser() user: { id: string; organizationId: string },
  ) {
    return this.complianceService.getCreditsBalance(user.organizationId);
  }
}
