import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Tier Guard
 *
 * Enforces feature access based on subscription tier.
 */
@Injectable()
export class TierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private readonly tierHierarchy: Record<string, number> = {
    STARTER: 1,
    PRO: 2,
    ENTERPRISE: 3,
    GOV: 4,
    CHAMBER: 3, // Same level as Enterprise
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.get<string>('requiredTier', context.getHandler());

    if (!requiredTier) {
      return true; // No tier requirement
    }

    const request = context.switchToHttp().getRequest();
    const userTier = request.user?.tier || 'STARTER';

    const requiredLevel = this.tierHierarchy[requiredTier] || 0;
    const userLevel = this.tierHierarchy[userTier] || 0;

    return userLevel >= requiredLevel;
  }
}
