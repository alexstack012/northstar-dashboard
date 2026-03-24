import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Job, JobFormValue } from '../models/job.model';
import { EntityId } from '../models/entity-id.type';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly http = inject(HttpClient);

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(API_ENDPOINTS.JOBS);
  }

  getJobById(id: EntityId): Observable<Job> {
    return this.http.get<Job>(`${API_ENDPOINTS.JOBS}/${id}`);
  }

  createJob(job: JobFormValue): Observable<Job> {
    return this.http.post<Job>(API_ENDPOINTS.JOBS, job);
  }

  updateJob(id: EntityId, job: JobFormValue): Observable<Job> {
    return this.http.put<Job>(`${API_ENDPOINTS.JOBS}/${id}`, job);
  }

  deleteJob(id: EntityId): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.JOBS}/${id}`);
  }
}
