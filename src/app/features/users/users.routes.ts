import { Routes } from '@angular/router';
import { ROLES } from '../../core/constants/roles.constants';
import { RoleGuard } from '../../core/guards/role.guard';
import { ROUTE_PATHS } from '../../core/constants/route-paths.constants';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: [ROLES.ADMIN] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/user-list/user-list.component').then((m) => m.UserListComponent)
      },
      {
        path: ROUTE_PATHS.NEW,
        loadComponent: () =>
          import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent)
      },
      {
        path: ROUTE_PATHS.DETAIL,
        loadComponent: () =>
          import('./pages/user-detail/user-detail.component').then((m) => m.UserDetailComponent)
      },
      {
        path: `${ROUTE_PATHS.DETAIL}/${ROUTE_PATHS.EDIT}`,
        loadComponent: () =>
          import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent)
      }
    ]
  }
];
