import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import type { AuthenticatedUser } from '../types/authenticated-user';

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    nome?: string;
    whatsapp?: string;
  };
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const jwksUri = configService.getOrThrow<string>('SUPABASE_JWKS_URL');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256', 'RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
    });
  }

  validate(payload: SupabaseJwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email ?? null,
      nome: payload.user_metadata?.nome ?? null,
      whatsapp: payload.user_metadata?.whatsapp ?? null,
    };
  }
}
