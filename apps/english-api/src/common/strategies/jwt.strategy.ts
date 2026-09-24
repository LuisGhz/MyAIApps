import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { EnvService } from '../../config';
import type { JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(envService: EnvService) {
    const domain = envService.auth0Domain.replace(/\/$/, '');
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${domain}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: envService.auth0Audience,
      issuer: `${domain}/`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
