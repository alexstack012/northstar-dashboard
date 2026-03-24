import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Candidate, CandidateFormValue } from '../models/candidate.model';
import { EntityId } from '../models/entity-id.type';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly http = inject(HttpClient);

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(API_ENDPOINTS.CANDIDATES);
  }

  getCandidateById(id: EntityId): Observable<Candidate> {
    return this.http.get<Candidate>(`${API_ENDPOINTS.CANDIDATES}/${id}`);
  }

  createCandidate(candidate: CandidateFormValue): Observable<Candidate> {
    return this.http.post<Candidate>(API_ENDPOINTS.CANDIDATES, candidate);
  }

  updateCandidate(id: EntityId, candidate: CandidateFormValue): Observable<Candidate> {
    return this.http.put<Candidate>(`${API_ENDPOINTS.CANDIDATES}/${id}`, candidate);
  }

  deleteCandidate(id: EntityId): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.CANDIDATES}/${id}`);
  }
}
