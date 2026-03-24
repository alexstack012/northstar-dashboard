import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  it('allows access when the current user has a matching role', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ role: 'admin' })
          }
        }
      ]
    }).compileComponents();

    const route = new ActivatedRouteSnapshot();
    route.data = { roles: ['admin'] };
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => RoleGuard(route, state));

    expect(result).toBe(true);
  });

  it('redirects to the dashboard when the current user lacks the required role', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ role: 'recruiter' })
          }
        }
      ]
    }).compileComponents();

    const route = new ActivatedRouteSnapshot();
    route.data = { roles: ['admin'] };
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => RoleGuard(route, state));
    const router = TestBed.inject(Router);

    expect(router.serializeUrl(result as ReturnType<typeof router.createUrlTree>)).toBe('/dashboard');
  });
});
