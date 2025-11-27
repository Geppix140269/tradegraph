import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Run Check DTO
 *
 * Request body for initiating a compliance check.
 */
export class RunCheckDto {
  @ApiProperty({ description: 'Company ID to check' })
  @IsString()
  companyId: string;

  @ApiPropertyOptional({ description: 'Company name (for display/logging)' })
  @IsOptional()
  @IsString()
  companyName?: string;
}
