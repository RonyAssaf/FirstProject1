import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Single source of truth for auth
  private readonly TOKEN_KEY = 'token';
  private readonly CURRENT_USER_KEY = 'current_user';
  private readonly AUTH_USER_KEY = 'auth_user'; // legacy key, optional cleanup

  /** Logged in = token exists */
  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return typeof token === 'string' && token.length > 0;
  }

  /** Returns the raw token (useful for interceptors if you want) */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Save token (call after login) */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /** Clear token + stored user objects */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);

    // also clean user storage keys so state is consistent
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.AUTH_USER_KEY);
  }
}
