import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly STORAGE_KEY = 'currentUser';
  private redirectUrl: string | null = null;

  async login(email: string, password: string): Promise<boolean> {
    const users = await firstValueFrom(
      this.http.get<User[]>(`${API_ENDPOINTS.USERS}?email=${email}`)
    );

    if (!users.length) return false;

    const user = users[0];

    if (!user.isActive) return false;

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) return false;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  }

  syncCurrentUser(user: User): void {
    const currentUser = this.getCurrentUser();

    if (!currentUser || currentUser.id !== user.id) {
      return;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }
}
