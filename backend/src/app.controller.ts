import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * App Controller
 *
 * Root endpoint for health checks and API info.
 */
@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Health Check' })
  getRoot() {
    return {
      name: 'TradeGraph API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/docs',
      endpoints: {
        shipments: '/api/v1/shipments',
        companies: '/api/v1/companies',
        compliance: '/api/v1/compliance',
        tariffs: '/api/v1/tariffs',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
