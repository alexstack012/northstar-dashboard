import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Job } from '../../../../core/models/job.model';
import { JobService } from '../../../../core/services/job.service';
import { MatButton } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [NgIf, TitleCasePipe, RouterLink, MatButton, MatIconModule],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss'
})
export class JobDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);

  readonly job = signal<Job | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadJob();
  }

  loadJob(): void {
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (job) => {
        this.job.set(job);
        this.loading.set(false);
      },
      error: (error: { status?: number }) => {
        this.job.set(null);
        this.errorMessage.set(error.status === 404
          ? 'Job not found.'
          : 'Unable to load this job right now. Please try again.');
        this.loading.set(false);
      }
    });
  }

  editJob(): void {
    console.log('Navigate to edit page for job id:', this.job()!.id);
  }

  deleteJob(): void {
    console.log('Delete job with id:', this.job()!.id);
  }
}
