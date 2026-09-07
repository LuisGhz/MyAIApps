export interface GithubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export interface GithubCallback {
  state: string;
  error: string;
  code: string;
  errorDescription: string;
  clearCookies: () => void;
}
