import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
// import { SHELL_ROUTES } from './shell/shell.routes';

export const APP_ROUTES: Routes = [
  ...AUTH_ROUTES,
  // ...SHELL_ROUTES,
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];