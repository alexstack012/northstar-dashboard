import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { JOB_STATUS_OPTIONS } from '../../../../core/constants/status.constants';
import { JobFormValue } from '../../../../core/models/job.model';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-job-form',
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
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss'
})
export class JobFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusOptions = JOB_STATUS_OPTIONS;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly pageTitle = signal('Create Job');
  readonly pageDescription = signal('Add a new role to the Northstar pipeline.');

  jobId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    tenantId: [1, [Validators.required, Validators.min(1)]],
    status: ['draft' as JobFormValue['status'], Validators.required]
  });

  get isEditMode(): boolean {
    return this.jobId !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      this.errorMessage.set('The job you are trying to edit has an invalid id.');
      return;
    }

    this.jobId = parsedId;
    this.pageTitle.set('Edit Job');
    this.pageDescription.set('Update the role details and current hiring status.');
    this.loadJob(parsedId);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set('');

    const request = this.isEditMode && this.jobId !== null
      ? this.jobService.updateJob(this.jobId, payload)
      : this.jobService.createJob(payload);

    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (job) => {
          this.router.navigate(['/', ROUTE_PATHS.JOBS, job.id]);
        },
        error: () => {
          this.errorMessage.set(
            this.isEditMode
              ? 'Unable to save your updates right now. Please try again.'
              : 'Unable to create this job right now. Please try again.'
          );
        }
      });
  }

  private loadJob(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.jobService.getJobById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (job) => {
          this.form.setValue({
            title: job.title,
            tenantId: job.tenantId,
            status: job.status
          });
        },
        error: (error: { status?: number }) => {
          this.errorMessage.set(
            error.status === 404
              ? 'This job no longer exists.'
              : 'Unable to load this job right now. Please try again.'
          );
        }
      });
  }
}
