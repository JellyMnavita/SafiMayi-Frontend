// Types pour les réponses API

export interface User {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  role: string;
  state: boolean;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: User;
  solde_litres?: number;
  id_litrage?: number;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface TokenError {
  detail: string;
  code: string;
  messages: Array<{
    token_class: string;
    token_type: string;
    message: string;
  }>;
}
