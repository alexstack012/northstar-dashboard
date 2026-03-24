import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      'X-Current-User-Id': String(currentUser.id),
      'X-Current-User-Role': currentUser.role,
      'X-Tenant-Id': String(currentUser.tenantId)
    }
  });

  return next(authenticatedRequest);
};
