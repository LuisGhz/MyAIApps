import { JwtPayload, JwtSign } from '@cmn/interfaces';
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

type DecodedJwtPayload = JwtPayload & Record<string, unknown>;

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  sign(payload: JwtSign) {
    return this.jwtService.sign(payload);
  }

  signWithPreviousToken(token: string): string {
    const decodedPayload = this.jwtService.decode<DecodedJwtPayload | null>(
      token,
    );
    if (!decodedPayload || typeof decodedPayload !== 'object') {
      throw new Error('Unable to decode JWT payload');
    }

    const { exp, iat, ...payload } = decodedPayload;
    void exp;
    void iat;
    return this.jwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  decode(token: string): JwtPayload {
    return this.jwtService.decode(token);
  }
}
