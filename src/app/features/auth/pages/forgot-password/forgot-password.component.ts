import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  securityQuestions = CONSTANTS.SECURITY_QUESTIONS;

  foundUser: any = null;

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

  async findUser() {
    const email = this.emailForm.value.email;

    const users = await firstValueFrom(
      this.http.get<any[]>(`${API_ENDPOINTS.USERS}?email=${email}`)
    );

    if (users.length) {
      this.foundUser = users[0];
    }
  }

  async verifyAnswer(): Promise<boolean> {
    if (!this.foundUser) return false;

    const answerMatch = await bcrypt.compare(
      this.securityForm.value.answer!,
      this.foundUser.securityAnswerHash
    );

    return (
      answerMatch &&
      this.securityForm.value.selectedQuestion ===
        this.foundUser.securityQuestion
    );
  }

  async resetPassword() {
    const newHash = await bcrypt.hash(this.resetForm.value.newPassword!, 10);

    await firstValueFrom(
      this.http.patch(
        `${API_ENDPOINTS.USERS}/${this.foundUser.id}`,
        { passwordHash: newHash }
      )
    );
  }
}