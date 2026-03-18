import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ROUTE_PATHS } from '../../core/constants/route-paths.constants';

export const SHELL_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        redirectTo: ROUTE_PATHS.DASHBOARD,
        pathMatch: 'full'
      },
      {
        path: ROUTE_PATHS.DASHBOARD,
        loadComponent: () =>
          import('../../features/dashboard/pages/dashboard-home/dashboard-home.component')
            .then((m) => m.DashboardHomeComponent)
      },
      {
        path: ROUTE_PATHS.JOBS,
        loadChildren: () =>
          import('../../features/jobs/jobs.routes').then((m) => m.JOB_ROUTES)
      },
      {
        path: ROUTE_PATHS.CANDIDATES,
        loadChildren: () =>
          import('../../features/candidates/candidates.routes').then((m) => m.CANDIDATE_ROUTES)
      },
      {
        path: ROUTE_PATHS.USERS,
        loadChildren: () =>
          import('../../features/users/users.routes').then((m) => m.USER_ROUTES)
      }
    ]
  }
];
