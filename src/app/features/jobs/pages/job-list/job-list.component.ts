import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Job } from '../../../../core/models/job.model';
import { JobService } from '../../../../core/services/job.service';
import { JobFormComponent, JobFormDialogResult } from '../job-form/job-form.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, RouterLink, MatButtonModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  readonly jobs = signal<Job[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
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
        this.jobs.set([]);
        this.errorMessage.set('Unable to load jobs right now. Please try again.');
      }
    });
  }

  openCreateDialog(): void {
    this.dialog.open<JobFormComponent, undefined, JobFormDialogResult | undefined>(JobFormComponent, {
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

        this.loadJobs();
      });
  }

  openEditDialog(jobId: number): void {
    this.dialog.open<JobFormComponent, { jobId: number }, JobFormDialogResult | undefined>(JobFormComponent, {
      data: { jobId },
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

        this.loadJobs();
      });
  }
}
