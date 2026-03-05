import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Job } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly http = inject(HttpClient);

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(API_ENDPOINTS.JOBS);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${API_ENDPOINTS.JOBS}/${id}`);
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(API_ENDPOINTS.JOBS, job);
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${API_ENDPOINTS.JOBS}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.JOBS}/${id}`);
  }
}
