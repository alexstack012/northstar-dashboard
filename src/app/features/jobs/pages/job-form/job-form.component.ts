import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JOB_STATUS_OPTIONS } from '../../../../core/constants/status.constants';
import { Job, JobFormValue } from '../../../../core/models/job.model';
import { JobService } from '../../../../core/services/job.service';
import { EntityId, toEntityKey } from '../../../../core/models/entity-id.type';

interface JobFormDialogData {
  jobId?: EntityId;
}

export interface JobFormDialogResult {
  job: Job;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss'
})
export class JobFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<JobFormComponent, JobFormDialogResult | undefined>);
  private readonly dialogData = inject<JobFormDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  readonly statusOptions = JOB_STATUS_OPTIONS;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly pageTitle = signal('Create Job');
  readonly pageDescription = signal('Add a new role to the Northstar pipeline.');

  jobId: EntityId | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    tenantId: ['1' as EntityId, Validators.required],
    status: ['draft' as JobFormValue['status'], Validators.required]
  });

  get isEditMode(): boolean {
    return this.jobId !== null;
  }

  ngOnInit(): void {
    if (!this.dialogData.jobId) {
      return;
    }

    const dialogJobId = this.dialogData.jobId;

    if (dialogJobId === undefined || dialogJobId === null || toEntityKey(dialogJobId).trim() === '') {
      this.errorMessage.set('The job you are trying to edit has an invalid id.');
      return;
    }

    this.jobId = dialogJobId;
    this.pageTitle.set('Edit Job');
    this.pageDescription.set('Update the role details and current hiring status.');
    this.loadJob(dialogJobId);
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
          this.dialogRef.close({
            job,
            mode: this.isEditMode ? 'edit' : 'create'
          });
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

  private loadJob(id: EntityId): void {
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

  close(): void {
    this.dialogRef.close();
  }
}
