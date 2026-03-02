export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'recruiter';
  tenantId: number;
  passwordHash: string;
  securityQuestion: string;
  securityAnswerHash: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}