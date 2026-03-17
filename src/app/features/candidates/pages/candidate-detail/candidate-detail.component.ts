import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { Candidate } from '../../../../core/models/candidate.model';
import { CandidateService } from '../../../../core/services/candidate.service';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [NgIf, TitleCasePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.scss'
})
export class CandidateDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly candidateService = inject(CandidateService);
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);

  readonly candidate = signal<Candidate | null>(null);
  readonly jobTitle = signal('');
  readonly loading = signal(false);
  readonly deleting = signal(false);
  readonly showDeleteConfirmation = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadCandidate();
  }

  loadCandidate(): void {
    this.showDeleteConfirmation.set(false);

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Invalid candidate id.');
      this.candidate.set(null);
      this.loading.set(false);
      return;
    }

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
          this.candidate.set(candidate);
          this.jobTitle.set(jobs.find((job) => job.id === candidate.jobId)?.title ?? 'Unassigned Job');
        },
        error: (error: { status?: number }) => {
          this.candidate.set(null);
          this.jobTitle.set('');
          this.errorMessage.set(
            error.status === 404
              ? 'Candidate not found.'
              : 'Unable to load this candidate right now. Please try again.'
          );
        }
      });
  }

  editCandidate(): void {
    const currentCandidate = this.candidate();

    if (!currentCandidate) {
      return;
    }

    this.router.navigate(['/', ROUTE_PATHS.CANDIDATES, currentCandidate.id, ROUTE_PATHS.EDIT]);
  }

  deleteCandidate(): void {
    const currentCandidate = this.candidate();

    if (!currentCandidate) {
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');

    this.candidateService.deleteCandidate(currentCandidate.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deleting.set(false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/', ROUTE_PATHS.CANDIDATES]);
        },
        error: () => {
          this.errorMessage.set('Unable to delete this candidate right now. Please try again.');
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
