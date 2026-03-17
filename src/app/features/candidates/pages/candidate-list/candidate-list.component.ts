import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { Candidate } from '../../../../core/models/candidate.model';
import { Job } from '../../../../core/models/job.model';
import { CandidateService } from '../../../../core/services/candidate.service';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, RouterLink, MatButtonModule],
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.scss'
})
export class CandidateListComponent implements OnInit {
  private readonly candidateService = inject(CandidateService);
  private readonly jobService = inject(JobService);
  private readonly destroyRef = inject(DestroyRef);

  readonly candidates = signal<Array<Candidate & { jobTitle: string }>>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      candidates: this.candidateService.getCandidates(),
      jobs: this.jobService.getJobs()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ candidates, jobs }) => {
          this.candidates.set(this.mapCandidatesWithJobs(candidates, jobs));
        },
        error: () => {
          this.candidates.set([]);
          this.errorMessage.set('Unable to load candidates right now. Please try again.');
        }
      });
  }

  private mapCandidatesWithJobs(
    candidates: Candidate[],
    jobs: Job[]
  ): Array<Candidate & { jobTitle: string }> {
    const jobTitles = new Map(jobs.map((job) => [job.id, job.title]));

    return candidates.map((candidate) => ({
      ...candidate,
      jobTitle: jobTitles.get(candidate.jobId) ?? 'Unassigned Job'
    }));
  }
}
