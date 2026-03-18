import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { CANDIDATE_STATUS_OPTIONS } from '../../../../core/constants/status.constants';
import { CandidateFormValue } from '../../../../core/models/candidate.model';
import { Job } from '../../../../core/models/job.model';
import { CandidateService } from '../../../../core/services/candidate.service';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-candidate-form',
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
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.scss'
})
export class CandidateFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly candidateService = inject(CandidateService);
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusOptions = CANDIDATE_STATUS_OPTIONS;
  readonly jobs = signal<Job[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly pageTitle = signal('Add Candidate');
  readonly pageDescription = signal('Create a new candidate record and connect it to an open role.');

  candidateId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    jobId: [0, [Validators.required, Validators.min(1)]],
    status: ['applied' as CandidateFormValue['status'], Validators.required],
    notes: ['', [Validators.required, Validators.maxLength(500)]]
  });

  get isEditMode(): boolean {
    return this.candidateId !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loadJobs();
      return;
    }

    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      this.errorMessage.set('The candidate you are trying to edit has an invalid id.');
      return;
    }

    this.candidateId = parsedId;
    this.pageTitle.set('Edit Candidate');
    this.pageDescription.set('Update contact information, notes, and pipeline status.');
    this.loadCandidateAndJobs(parsedId);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set('');

    const request = this.isEditMode && this.candidateId !== null
      ? this.candidateService.updateCandidate(this.candidateId, payload)
      : this.candidateService.createCandidate(payload);

    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (candidate) => {
          const destinationId = this.resolveNavigationId(candidate.id);

          if (destinationId !== null) {
            this.router.navigate(['/', ROUTE_PATHS.CANDIDATES, destinationId]);
            return;
          }

          this.router.navigate(['/', ROUTE_PATHS.CANDIDATES]);
        },
        error: () => {
          this.errorMessage.set(
            this.isEditMode
              ? 'Unable to save your updates right now. Please try again.'
              : 'Unable to create this candidate right now. Please try again.'
          );
        }
      });
  }

  private resolveNavigationId(returnedId: unknown): number | null {
    if (this.isEditMode) {
      return this.candidateId;
    }

    const parsedId = Number(returnedId);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private loadJobs(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.jobService.getJobs()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (jobs) => {
          this.jobs.set(jobs);
        },
        error: () => {
          this.errorMessage.set('Unable to load jobs for candidate assignment right now.');
        }
      });
  }

  private loadCandidateAndJobs(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      candidate: this.candidateService.getCandidateById(id),
      jobs: this.jobService.getJobs()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ candidate, jobs }) => {
          this.jobs.set(jobs);
          this.form.setValue({
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            jobId: candidate.jobId,
            status: candidate.status,
            notes: candidate.notes
          });
        },
        error: (error: { status?: number }) => {
          this.errorMessage.set(
            error.status === 404
              ? 'This candidate no longer exists.'
              : 'Unable to load this candidate right now. Please try again.'
          );
        }
      });
  }
}
