import { JwtPayload, JwtSign } from '@cmn/interfaces';
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  sign(payload: JwtSign) {
    return this.jwtService.sign(payload);
  }

  signWithPreviousToken(token: string) {
    const { exp, iat, ...rest } = this.jwtService.decode(token);
    return this.jwtService.sign(rest);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  decode(token: string): JwtPayload {
    return this.jwtService.decode(token);
  }
}
