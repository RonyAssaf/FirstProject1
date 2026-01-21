import { Injectable, signal } from '@angular/core';

export interface CurrentUser {
  email: string;
  password?: string;
  phoneNumber?: string;
  id?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  phoneNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly STORAGE_KEY = 'current_user';

  readonly user = signal<CurrentUser | null>(null);

  constructor() {
    const stored = this.readFromStorage<CurrentUser>(this.STORAGE_KEY);
    if (stored) this.user.set(stored);
  }

  setUser(partial: Partial<CurrentUser>): void {
    const current = this.user();

    // If there's no current user yet, start from an empty object
    const base: CurrentUser = current ?? ({} as CurrentUser);

    const updated: CurrentUser = { ...base, ...partial };

    this.user.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  getUser(): CurrentUser | null {
    return this.user();
  }

  clear(): void {
    this.user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private readFromStorage<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}
