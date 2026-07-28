import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [SupabaseJwtStrategy],
})
export class AuthModule {}
