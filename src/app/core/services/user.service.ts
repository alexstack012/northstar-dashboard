import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { User } from '../models/user.model';
import { EntityId } from '../models/entity-id.type';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.USERS);
  }

  getUserById(id: EntityId): Observable<User> {
    return this.http.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  }

  createUser(payload: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(API_ENDPOINTS.USERS, payload);
  }

  updateUser(id: EntityId, payload: Omit<User, 'id'>): Observable<User> {
    return this.http.put<User>(`${API_ENDPOINTS.USERS}/${id}`, payload);
  }

  updateUserStatus(id: EntityId, isActive: boolean, updatedAt: string): Observable<User> {
    return this.http.patch<User>(`${API_ENDPOINTS.USERS}/${id}`, { isActive, updatedAt });
  }
}
