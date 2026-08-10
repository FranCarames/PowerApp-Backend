import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Módulo transversal de autenticación/autorización.
 * Exporta `AuthService` y los guards para que cualquier módulo que lo importe
 * pueda usar `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`.
 * `JwtModule` es global (ver app.module), así que `AuthService` resuelve `JwtService`.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
