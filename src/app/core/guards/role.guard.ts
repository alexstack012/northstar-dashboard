import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROUTE_PATHS } from '../constants/route-paths.constants';

export const RoleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const expectedRoles = route.data['roles'] as string[] | undefined;

  // No user → kick to login
  if (!user) {
    return router.createUrlTree([`/${ROUTE_PATHS.LOGIN}`]);
  }

  // No roles defined → allow (failsafe)
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  // Check role match
  const hasAccess = expectedRoles.includes(user.role);

  if (!hasAccess) {
    return router.createUrlTree([`/${ROUTE_PATHS.DASHBOARD}`]);
  }

  return true;
};
