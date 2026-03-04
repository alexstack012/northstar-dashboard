export const ROUTE_PATHS = {
  // Public
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot-password',

  // Main App
  DASHBOARD: 'dashboard',
  JOBS: 'jobs',
  CANDIDATES: 'candidates',
  USERS: 'users',

  // Optional children
  NEW: 'new',
  EDIT: 'edit',
  DETAIL: ':id'
} as const;