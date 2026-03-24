import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { EntityId, toEntityKey } from '../../../../core/models/entity-id.type';
import { User } from '../../../../core/models/user.model';
import { TenantService } from '../../../../core/services/tenant.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, DatePipe, RouterLink, MatButtonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly tenantService = inject(TenantService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly tenantNames = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      users: this.userService.getUsers(),
      tenants: this.tenantService.getTenants()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ users, tenants }) => {
          this.users.set([...users].sort((a, b) => a.name.localeCompare(b.name)));
          this.tenantNames.set(
            Object.fromEntries(tenants.map((tenant) => [toEntityKey(tenant.id), tenant.name]))
          );
        },
        error: () => {
          this.users.set([]);
          this.tenantNames.set({});
          this.errorMessage.set('Unable to load users right now. Please try again.');
        }
      });
  }

  getTenantName(tenantId: EntityId): string {
    return this.tenantNames()[toEntityKey(tenantId)] ?? `Tenant ${tenantId}`;
  }
}
