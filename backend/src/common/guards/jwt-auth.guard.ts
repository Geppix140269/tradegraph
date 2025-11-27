import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * JWT Auth Guard
 *
 * Validates JWT tokens from Authorization header.
 * In production, would integrate with Auth0/Clerk.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // For development, allow unauthenticated requests
      // TODO: Remove this in production
      request.user = {
        id: 'dev-user',
        organizationId: 'dev-org',
        tier: 'PRO',
        role: 'ADMIN',
      };
      return true;
    }

    // TODO: Validate JWT token
    // For now, mock user extraction
    request.user = {
      id: 'user-123',
      organizationId: 'org-456',
      tier: 'PRO',
      role: 'ANALYST',
    };

    return true;
  }
}
