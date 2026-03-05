import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Job } from '../../../../core/models/job.model';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, RouterLink],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);

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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: () => {
        this.jobs.set([]);
        this.errorMessage.set('Unable to load jobs right now. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
