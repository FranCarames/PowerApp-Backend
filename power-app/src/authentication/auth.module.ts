import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OwnerGuard } from './guards/owner.guard';

/**
 * Módulo transversal de autenticación/autorización.
 * Exporta `AuthService` y los guards para que cualquier módulo que lo importe
 * pueda usar `@Auth(...)` (que junta `JwtAuthGuard`, `RolesGuard` y `OwnerGuard`).
 * `JwtModule` es global (ver app.module), así que `AuthService` resuelve `JwtService`.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, JwtAuthGuard, RolesGuard, OwnerGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, OwnerGuard],
})
export class AuthModule {}
