import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CONSTANTS } from '../../../../core/constants/constants';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { ROLES } from '../../../../core/constants/roles.constants';
import { User, UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly pageTitle = signal('Create User');
  readonly pageDescription = signal('Add an administrator or recruiter account to the Northstar workspace.');
  readonly roleOptions: ReadonlyArray<{ value: UserRole; label: string }> = [
    { value: ROLES.ADMIN, label: 'Admin' },
    { value: ROLES.RECRUITER, label: 'Recruiter' }
  ];
  readonly securityQuestions: readonly string[] = CONSTANTS.SECURITY_QUESTIONS;

  userId: number | null = null;
  private existingUser: User | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    role: [ROLES.RECRUITER as UserRole, Validators.required],
    tenantId: [1, [Validators.required, Validators.min(1)]],
    securityQuestion: [this.securityQuestions[0] as string, Validators.required],
    securityAnswer: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    isActive: [true]
  });

  get isEditMode(): boolean {
    return this.userId !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      this.errorMessage.set('The user you are trying to edit has an invalid id.');
      return;
    }

    this.userId = parsedId;
    this.pageTitle.set('Edit User');
    this.pageDescription.set('Update account access, password details, and activation status.');
    this.form.controls.password.setValidators([Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.form.controls.securityAnswer.clearValidators();
    this.form.controls.securityAnswer.updateValueAndValidity();
    this.loadUser(parsedId);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    try {
      const payload = await this.buildPayload();
      const request = this.isEditMode && this.userId !== null
        ? this.userService.updateUser(this.userId, payload)
        : this.userService.createUser(payload);

      request
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.saving.set(false))
        )
        .subscribe({
          next: (user) => {
            this.authService.syncCurrentUser(user);
            this.router.navigate(['/', ROUTE_PATHS.USERS, user.id]);
          },
          error: () => {
            this.errorMessage.set(
              this.isEditMode
                ? 'Unable to save this user right now. Please try again.'
                : 'Unable to create this user right now. Please try again.'
            );
          }
        });
    } catch {
      this.saving.set(false);
      this.errorMessage.set('Unable to prepare secure credentials right now. Please try again.');
    }
  }

  private loadUser(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.userService.getUserById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (user) => {
          this.existingUser = user;
          this.form.patchValue({
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            securityQuestion: user.securityQuestion,
            securityAnswer: '',
            password: '',
            isActive: user.isActive
          });
        },
        error: (error: { status?: number }) => {
          this.errorMessage.set(
            error.status === 404
              ? 'This user no longer exists.'
              : 'Unable to load this user right now. Please try again.'
          );
        }
      });
  }

  private async buildPayload(): Promise<Omit<User, 'id'>> {
    const now = new Date().toISOString();
    const value = this.form.getRawValue();

    const passwordHash = value.password
      ? await bcrypt.hash(value.password, 10)
      : this.existingUser!.passwordHash;
    const securityAnswerHash = value.securityAnswer
      ? await bcrypt.hash(value.securityAnswer, 10)
      : this.existingUser!.securityAnswerHash;

    return {
      name: value.name.trim(),
      email: value.email.trim().toLowerCase(),
      role: value.role,
      tenantId: value.tenantId,
      passwordHash,
      securityQuestion: value.securityQuestion,
      securityAnswerHash,
      isActive: value.isActive,
      lastLogin: this.existingUser?.lastLogin ?? null,
      createdAt: this.existingUser?.createdAt ?? now,
      updatedAt: now
    };
  }
}
