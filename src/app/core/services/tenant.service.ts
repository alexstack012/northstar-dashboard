import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Tenant } from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);

  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(API_ENDPOINTS.TENANTS);
  }
}
