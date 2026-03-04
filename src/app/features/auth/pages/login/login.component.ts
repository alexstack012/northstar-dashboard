import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  async submit() {
    if (this.form.invalid) return;

    this.loading = true;

    const { email, password } = this.form.value;

    const success = await this.authService.login(email!, password!);

    this.loading = false;

    if (success) {
      const redirect = this.authService.getRedirectUrl() || `/${ROUTE_PATHS.DASHBOARD}`;
      this.router.navigateByUrl(redirect);
    } else {
      this.snackBar.open('Invalid credentials', 'Close', { duration: 3000 });
    }
  }
}
