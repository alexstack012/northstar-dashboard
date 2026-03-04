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
        loadComponent: () =>
          import('../../features/jobs/pages/job-list/job-list.component')
            .then((m) => m.JobListComponent)
      },
      {
        path: ROUTE_PATHS.CANDIDATES,
        loadComponent: () =>
          import('../../features/candidates/pages/candidate-list/candidate-list.component')
            .then((m) => m.CandidateListComponent)
      },
      {
        path: ROUTE_PATHS.USERS,
        loadComponent: () =>
          import('../../features/users/pages/user-list/user-list.component')
            .then((m) => m.UserListComponent)
      }
    ]
  }
];
