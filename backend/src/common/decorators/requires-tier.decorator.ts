import { SetMetadata } from '@nestjs/common';

/**
 * RequiresTier Decorator
 *
 * Marks an endpoint as requiring a minimum subscription tier.
 * Used by TierGuard to enforce access control.
 */
export const RequiresTier = (tier: string) => SetMetadata('requiredTier', tier);
