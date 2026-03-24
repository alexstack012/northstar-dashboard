import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { User } from '../models/user.model';
import { toEntityKey } from '../models/entity-id.type';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly STORAGE_KEY = 'currentUser';
  private readonly SESSION_EXPIRY_KEY = 'sessionExpiresAt';
  private readonly SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
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

    this.persistSession(user);
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_EXPIRY_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  getCurrentUser(): User | null {
    const sessionExpiresAt = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);
    const user = sessionStorage.getItem(this.STORAGE_KEY);

    if (!sessionExpiresAt || !user) {
      this.logout();
      return null;
    }

    if (Date.now() >= Number(sessionExpiresAt)) {
      this.logout();
      return null;
    }

    return JSON.parse(user) as User;
  }

  syncCurrentUser(user: User): void {
    const currentUser = this.getCurrentUser();

    if (!currentUser || toEntityKey(currentUser.id) !== toEntityKey(user.id)) {
      return;
    }

    this.persistSession(user, this.getSessionExpiry());
  }

  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }

  private persistSession(user: User, expiresAt = Date.now() + this.SESSION_DURATION_MS): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    sessionStorage.setItem(this.SESSION_EXPIRY_KEY, String(expiresAt));
  }

  private getSessionExpiry(): number {
    const rawExpiry = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);
    const parsedExpiry = Number(rawExpiry);

    return Number.isFinite(parsedExpiry) && parsedExpiry > Date.now()
      ? parsedExpiry
      : Date.now() + this.SESSION_DURATION_MS;
  }
}
