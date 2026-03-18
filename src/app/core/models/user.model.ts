import { ROLES } from '../constants/roles.constants';

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  tenantId: number;
  passwordHash: string;
  securityQuestion: string;
  securityAnswerHash: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormValue {
  name: string;
  email: string;
  role: UserRole;
  tenantId: number;
  securityQuestion: string;
  isActive: boolean;
}
