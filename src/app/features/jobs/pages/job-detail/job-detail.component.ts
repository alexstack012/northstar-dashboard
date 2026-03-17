import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Job } from '../../../../core/models/job.model';
import { JobService } from '../../../../core/services/job.service';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [NgIf, TitleCasePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss'
})
export class JobDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);

  readonly job = signal<Job | null>(null);
  readonly loading = signal(false);
  readonly deleting = signal(false);
  readonly showDeleteConfirmation = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadJob();
  }

  loadJob(): void {
    this.showDeleteConfirmation.set(false);

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Invalid job id.');
      this.job.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.jobService.getJobById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
      next: (job) => {
        this.job.set(job);
      },
      error: (error: { status?: number }) => {
        this.job.set(null);
        this.errorMessage.set(error.status === 404
          ? 'Job not found.'
          : 'Unable to load this job right now. Please try again.');
      }
    });
  }

  editJob(): void {
    const currentJob = this.job();

    if (!currentJob) {
      return;
    }

    this.router.navigate(['/', ROUTE_PATHS.JOBS, currentJob.id, ROUTE_PATHS.EDIT]);
  }

  deleteJob(): void {
    const currentJob = this.job();

    if (!currentJob) {
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');

    this.jobService.deleteJob(currentJob.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deleting.set(false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/', ROUTE_PATHS.JOBS]);
        },
        error: () => {
          this.errorMessage.set('Unable to delete this job right now. Please try again.');
        }
      });
  }

  requestDelete(): void {
    this.showDeleteConfirmation.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
  }
}
