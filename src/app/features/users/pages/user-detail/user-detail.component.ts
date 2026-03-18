import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [NgIf, TitleCasePipe, DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly updatingStatus = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadUser();
  }

  get isCurrentUser(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === this.user()?.id;
  }

  loadUser(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Invalid user id.');
      this.user.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.userService.getUserById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (user) => {
          this.user.set(user);
        },
        error: (error: { status?: number }) => {
          this.user.set(null);
          this.errorMessage.set(
            error.status === 404
              ? 'User not found.'
              : 'Unable to load this user right now. Please try again.'
          );
        }
      });
  }

  editUser(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.router.navigate(['/', ROUTE_PATHS.USERS, currentUser.id, ROUTE_PATHS.EDIT]);
  }

  toggleActiveStatus(): void {
    const currentUser = this.user();

    if (!currentUser || this.isCurrentUser) {
      return;
    }

    const nextActiveState = !currentUser.isActive;
    const updatedAt = new Date().toISOString();

    this.updatingStatus.set(true);
    this.errorMessage.set('');

    this.userService.updateUserStatus(currentUser.id, nextActiveState, updatedAt)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.updatingStatus.set(false))
      )
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.authService.syncCurrentUser(user);
        },
        error: () => {
          this.errorMessage.set('Unable to update this user right now. Please try again.');
        }
      });
  }
}
