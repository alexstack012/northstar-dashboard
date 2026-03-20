import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '../../core/constants/route-paths.constants';

export const JOB_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/job-list/job-list.component').then((m) => m.JobListComponent)
  },
  {
    path: ROUTE_PATHS.DETAIL,
    loadComponent: () =>
      import('./pages/job-detail/job-detail.component').then((m) => m.JobDetailComponent)
  }
];
