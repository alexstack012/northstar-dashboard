import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '../../core/constants/route-paths.constants';

export const CANDIDATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/candidate-list/candidate-list.component').then((m) => m.CandidateListComponent)
  },
  {
    path: ROUTE_PATHS.NEW,
    loadComponent: () =>
      import('./pages/candidate-form/candidate-form.component').then((m) => m.CandidateFormComponent)
  },
  {
    path: ROUTE_PATHS.DETAIL,
    loadComponent: () =>
      import('./pages/candidate-detail/candidate-detail.component').then((m) => m.CandidateDetailComponent)
  },
  {
    path: `${ROUTE_PATHS.DETAIL}/${ROUTE_PATHS.EDIT}`,
    loadComponent: () =>
      import('./pages/candidate-form/candidate-form.component').then((m) => m.CandidateFormComponent)
  }
];
