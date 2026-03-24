import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { CandidateService } from '../../../../core/services/candidate.service';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { UserService } from '../../../../core/services/user.service';
import { Candidate } from '../../../../core/models/candidate.model';
import { EntityId, toEntityKey } from '../../../../core/models/entity-id.type';
import { Job } from '../../../../core/models/job.model';
import { Tenant } from '../../../../core/models/tenant.model';
import { User } from '../../../../core/models/user.model';

interface DashboardMetric {
  label: string;
  value: string;
  tone: 'rose' | 'green' | 'gold' | 'ink';
  detail: string;
}

interface PipelineSpotlight {
  title: string;
  value: string;
  description: string;
}

interface CandidateSnapshot {
  id: EntityId;
  name: string;
  status: Candidate['status'];
  jobTitle: string;
}

interface UserSnapshot {
  id: EntityId;
  name: string;
  role: User['role'];
  isActive: boolean;
  lastLogin: string | null;
  tenantName: string;
}

interface OpenJobSnapshot {
  id: EntityId;
  title: string;
  status: Job['status'];
  tenantName: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe, DatePipe, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {
  private readonly jobService = inject(JobService);
  private readonly candidateService = inject(CandidateService);
  private readonly userService = inject(UserService);
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly metrics = signal<DashboardMetric[]>([]);
  readonly pipelineSpotlights = signal<PipelineSpotlight[]>([]);
  readonly recentCandidates = signal<CandidateSnapshot[]>([]);
  readonly teamSnapshot = signal<UserSnapshot[]>([]);
  readonly openJobs = signal<OpenJobSnapshot[]>([]);
  readonly currentUserName = signal('Team');

  ngOnInit(): void {
    this.currentUserName.set(this.authService.getCurrentUser()?.name ?? 'Team');
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      jobs: this.jobService.getJobs(),
      candidates: this.candidateService.getCandidates(),
      users: this.userService.getUsers(),
      tenants: this.tenantService.getTenants()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ jobs, candidates, users, tenants }) => {
          this.metrics.set(this.buildMetrics(jobs, candidates, users));
          this.pipelineSpotlights.set(this.buildPipelineSpotlights(candidates));
          this.recentCandidates.set(this.buildRecentCandidates(candidates, jobs));
          this.teamSnapshot.set(this.buildTeamSnapshot(users, tenants));
          this.openJobs.set(this.buildOpenJobs(jobs, tenants));
        },
        error: () => {
          this.metrics.set([]);
          this.pipelineSpotlights.set([]);
          this.recentCandidates.set([]);
          this.teamSnapshot.set([]);
          this.openJobs.set([]);
          this.errorMessage.set('Unable to load dashboard data right now. Please try again.');
        }
      });
  }

  private buildMetrics(jobs: Job[], candidates: Candidate[], users: User[]): DashboardMetric[] {
    const openJobs = jobs.filter((job) => job.status === 'open').length;
    const activeUsers = users.filter((user) => user.isActive).length;
    const candidatesInInterview = candidates.filter((candidate) => candidate.status === 'interview').length;
    const placedCandidates = candidates.filter((candidate) => candidate.status === 'placed').length;
    const placementRate = candidates.length ? placedCandidates / candidates.length : 0;

    return [
      {
        label: 'Open Roles',
        value: String(openJobs),
        tone: 'rose',
        detail: `${jobs.length} total jobs in the system`
      },
      {
        label: 'Interview Stage',
        value: String(candidatesInInterview),
        tone: 'gold',
        detail: `${candidates.length} total candidates in play`
      },
      {
        label: 'Active Users',
        value: String(activeUsers),
        tone: 'green',
        detail: `${users.length - activeUsers} inactive account${users.length - activeUsers === 1 ? '' : 's'}`
      },
      {
        label: 'Placement Rate',
        value: `${Math.round(placementRate * 100)}%`,
        tone: 'ink',
        detail: `${placedCandidates} placed candidate${placedCandidates === 1 ? '' : 's'}`
      }
    ];
  }

  private buildPipelineSpotlights(candidates: Candidate[]): PipelineSpotlight[] {
    const counts = new Map<Candidate['status'], number>();

    for (const candidate of candidates) {
      counts.set(candidate.status, (counts.get(candidate.status) ?? 0) + 1);
    }

    return [
      {
        title: 'Applied',
        value: String(counts.get('applied') ?? 0),
        description: 'New prospects that need an initial review.'
      },
      {
        title: 'Screening',
        value: String(counts.get('screening') ?? 0),
        description: 'Candidates in recruiter or phone-screen motion.'
      },
      {
        title: 'Interview',
        value: String(counts.get('interview') ?? 0),
        description: 'People currently advancing through interviews.'
      },
      {
        title: 'Offer / Placed',
        value: String((counts.get('offer') ?? 0) + (counts.get('placed') ?? 0)),
        description: 'Late-stage pipeline momentum and successful placements.'
      }
    ];
  }

  private buildRecentCandidates(candidates: Candidate[], jobs: Job[]): CandidateSnapshot[] {
    const jobTitles = new Map(jobs.map((job) => [toEntityKey(job.id), job.title]));

    return [...candidates]
      .sort((a, b) => toEntityKey(b.id).localeCompare(toEntityKey(a.id), undefined, { numeric: true }))
      .slice(0, 4)
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        status: candidate.status,
        jobTitle: jobTitles.get(toEntityKey(candidate.jobId)) ?? 'Unassigned Job'
      }));
  }

  private buildOpenJobs(jobs: Job[], tenants: Tenant[]): OpenJobSnapshot[] {
    const tenantNames = new Map(tenants.map((tenant) => [toEntityKey(tenant.id), tenant.name]));

    return jobs
      .filter((job) => job.status === 'open')
      .slice(0, 4)
      .map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        tenantName: tenantNames.get(toEntityKey(job.tenantId)) ?? `Tenant ${job.tenantId}`
      }));
  }

  private buildTeamSnapshot(users: User[], tenants: Tenant[]): UserSnapshot[] {
    const tenantNames = new Map(tenants.map((tenant) => [toEntityKey(tenant.id), tenant.name]));

    return [...users]
      .sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }

        if (a.lastLogin && b.lastLogin) {
          return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
        }

        if (a.lastLogin) return -1;
        if (b.lastLogin) return 1;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 4)
      .map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        tenantName: tenantNames.get(toEntityKey(user.tenantId)) ?? `Tenant ${user.tenantId}`
      }));
  }
}
