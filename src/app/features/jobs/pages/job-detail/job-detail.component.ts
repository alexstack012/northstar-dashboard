import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Job } from '../../../../core/models/job.model';
import { JobService } from '../../../../core/services/job.service';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EntityId, toEntityKey } from '../../../../core/models/entity-id.type';
import { TenantService } from '../../../../core/services/tenant.service';
import { JobFormComponent, JobFormDialogResult } from '../job-form/job-form.component';

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
  private readonly tenantService = inject(TenantService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  readonly job = signal<Job | null>(null);
  readonly loading = signal(false);
  readonly deleting = signal(false);
  readonly showDeleteConfirmation = signal(false);
  readonly errorMessage = signal('');
  readonly tenantName = signal('Tenant');

  ngOnInit(): void {
    this.loadJob();
  }

  loadJob(): void {
    this.showDeleteConfirmation.set(false);

    const id = this.route.snapshot.paramMap.get('id');

    if (!id || toEntityKey(id).trim() === '') {
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
        this.loadTenantName(job.tenantId);
      },
      error: (error: { status?: number }) => {
        this.job.set(null);
        this.tenantName.set('Tenant');
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

    this.dialog.open<JobFormComponent, { jobId: EntityId }, JobFormDialogResult | undefined>(JobFormComponent, {
      data: { jobId: currentJob.id },
      width: '720px',
      maxWidth: 'calc(100vw - 2rem)',
      autoFocus: false
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.loadJob();
      });
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

  private loadTenantName(tenantId: EntityId): void {
    this.tenantService.getTenants()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tenants) => {
          const tenant = tenants.find((item) => toEntityKey(item.id) === toEntityKey(tenantId));
          this.tenantName.set(tenant?.name ?? `Tenant ${tenantId}`);
        },
        error: () => {
          this.tenantName.set(`Tenant ${tenantId}`);
        }
      });
  }
}
