import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ROUTE_PATHS } from '../../core/constants/route-paths.constants';
import { MatAnchor } from "@angular/material/button";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive, MatAnchor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly navItems = [
    { label: 'Dashboard', path: `/${ROUTE_PATHS.DASHBOARD}` },
    { label: 'Jobs', path: `/${ROUTE_PATHS.JOBS}` },
    { label: 'Candidates', path: `/${ROUTE_PATHS.CANDIDATES}` },
    { label: 'Users', path: `/${ROUTE_PATHS.USERS}` }
  ];
}
