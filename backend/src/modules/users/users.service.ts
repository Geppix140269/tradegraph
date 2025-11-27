import { Injectable } from '@nestjs/common';

/**
 * Users Service
 *
 * User and organization management.
 */
@Injectable()
export class UsersService {
  async findById(id: string) {
    // TODO: Implement with Prisma
    return null;
  }

  async findByEmail(email: string) {
    // TODO: Implement with Prisma
    return null;
  }

  async getOrganization(organizationId: string) {
    // TODO: Implement with Prisma
    return null;
  }
}
