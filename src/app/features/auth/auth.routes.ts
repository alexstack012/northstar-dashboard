import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '../../core/constants/route-paths.constants';

export const AUTH_ROUTES: Routes = [
  {
    path: ROUTE_PATHS.LOGIN,
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: ROUTE_PATHS.FORGOT_PASSWORD,
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  }
];