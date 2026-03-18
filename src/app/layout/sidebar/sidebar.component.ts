import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ROUTE_PATHS } from '../../core/constants/route-paths.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { AuthService } from '../../core/services/auth.service';
import { MatAnchor } from "@angular/material/button";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive, MatAnchor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  readonly navItems = [
    { label: 'Dashboard', path: `/${ROUTE_PATHS.DASHBOARD}` },
    { label: 'Jobs', path: `/${ROUTE_PATHS.JOBS}` },
    { label: 'Candidates', path: `/${ROUTE_PATHS.CANDIDATES}` },
    { label: 'Users', path: `/${ROUTE_PATHS.USERS}`, adminOnly: true }
  ];

  get visibleNavItems() {
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.role === ROLES.ADMIN;

    return this.navItems.filter((item) => !item.adminOnly || isAdmin);
  }
}
