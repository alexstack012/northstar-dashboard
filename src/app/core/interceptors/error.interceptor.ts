import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ROUTE_PATHS } from '../constants/route-paths.constants';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        snackBar.open('Your session has expired. Please sign in again.', 'Close', {
          duration: 3500
        });
        router.navigate([`/${ROUTE_PATHS.LOGIN}`]);
      } else if (error.status === 0) {
        snackBar.open('Unable to reach the server. Check that the mock API is running.', 'Close', {
          duration: 4000
        });
      } else if (error.status >= 500) {
        snackBar.open('Something went wrong on the server. Please try again.', 'Close', {
          duration: 4000
        });
      }

      return throwError(() => error);
    })
  );
};
