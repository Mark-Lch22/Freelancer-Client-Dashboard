/**
 * Mirrors the PostgreSQL user_role ENUM and the backend UserRole enum.
 * Must stay in sync with: CREATE TYPE user_role AS ENUM ('CLIENT','FREELANCER','ADMIN')
 */
export enum UserRole {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
  ADMIN = 'ADMIN',
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole.CLIENT | UserRole.FREELANCER;
}

export interface LoginFormData {
  email: string;
  password: string;
}
