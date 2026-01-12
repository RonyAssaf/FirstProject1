import { Injectable, signal } from '@angular/core';
import { AuthUser } from '../servics/current-user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user';

  user = signal<AuthUser | null>(null);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.user.set(JSON.parse(stored));
    }
  }

  setUser(user: AuthUser) {
    this.user.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  getUser() {
    return this.user();
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.user();
  }
}
