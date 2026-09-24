export interface JwtPayload {
  iss: string; // Issuer (Auth0 domain)
  sub: string; // Subject (user ID)
  aud: string[]; // Audience
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
  scope: string; // OAuth scopes
  azp: string; // Authorized party
}
