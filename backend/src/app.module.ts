import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// App controller
import { AppController } from './app.controller';

// Feature modules
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { TariffsModule } from './modules/tariffs/tariffs.module';
import { UsersModule } from './modules/users/users.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  controllers: [AppController],
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting - prevents abuse, enforces tier limits
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 10,  // 10 requests per second per user
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per user
      },
    ]),

    // Domain modules
    ShipmentsModule,
    CompaniesModule,
    ComplianceModule,
    TariffsModule,
    UsersModule,
    SearchModule,
  ],
})
export class AppModule {}
