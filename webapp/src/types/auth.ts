export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user?: {
    id: number;
    username: string;
    createdAt: Date;
  };
}

export interface ErrorResponse {
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  message: string;
}
