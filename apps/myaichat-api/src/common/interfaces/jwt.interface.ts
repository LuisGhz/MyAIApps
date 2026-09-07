export interface JwtSign {
  sub: string;
  name: string;
  email: string;
  role: string;
}

export interface JwtPayload extends JwtSign {
  exp: number;
  iat: number;
}
