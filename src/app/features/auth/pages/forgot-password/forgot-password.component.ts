import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { CONSTANTS } from '../../../../core/constants/constants';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints.constants';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly securityQuestions = CONSTANTS.SECURITY_QUESTIONS;
  readonly currentStep = signal(0);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly passwordReset = signal(false);

  foundUser: User | null = null;

  // STEP 1
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // STEP 2
  securityForm = this.fb.group({
    selectedQuestion: ['', Validators.required],
    answer: ['', Validators.required]
  });

  // STEP 3
  resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  async findUser(): Promise<void> {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const email = this.emailForm.value.email;

    try {
      const users = await firstValueFrom(
        this.http.get<User[]>(`${API_ENDPOINTS.USERS}?email=${email}`)
      );

      if (!users.length) {
        this.foundUser = null;
        this.errorMessage.set('We could not find an account with that email address.');
        return;
      }

      this.foundUser = users[0];
      this.securityForm.patchValue({
        selectedQuestion: this.foundUser.securityQuestion,
        answer: ''
      });
      this.currentStep.set(1);
    } catch {
      this.errorMessage.set('Unable to look up that account right now. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async verifyAnswer(): Promise<boolean> {
    if (!this.foundUser || this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return false;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const answerMatch = await bcrypt.compare(
        this.securityForm.value.answer!,
        this.foundUser.securityAnswerHash
      );

      const isValid = (
        answerMatch &&
        this.securityForm.value.selectedQuestion === this.foundUser.securityQuestion
      );

      if (!isValid) {
        this.errorMessage.set('That answer did not match our records. Please try again.');
        return false;
      }

      this.currentStep.set(2);
      return true;
    } finally {
      this.submitting.set(false);
    }
  }

  async resetPassword(): Promise<void> {
    if (!this.foundUser || this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const newHash = await bcrypt.hash(this.resetForm.value.newPassword!, 10);

      await firstValueFrom(
        this.http.patch(
          `${API_ENDPOINTS.USERS}/${this.foundUser.id}`,
          { passwordHash: newHash, updatedAt: new Date().toISOString() }
        )
      );

      this.passwordReset.set(true);
      this.successMessage.set('Password updated successfully. You can return to sign in now.');
    } catch {
      this.errorMessage.set('Unable to reset the password right now. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
