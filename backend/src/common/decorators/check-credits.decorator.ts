import { SetMetadata } from '@nestjs/common';

/**
 * CheckCredits Decorator
 *
 * Marks an endpoint as consuming credits (e.g., compliance checks).
 * Used by a guard/interceptor to verify and deduct credits.
 */
export const CheckCredits = (creditType: string) => SetMetadata('creditType', creditType);
