import { ROLES } from '../constants/roles.constants';
import { EntityId } from './entity-id.type';

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: EntityId;
  name: string;
  email: string;
  role: UserRole;
  tenantId: EntityId;
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
  tenantId: EntityId;
  securityQuestion: string;
  isActive: boolean;
}
