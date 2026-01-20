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

  user = signal<CurrentUser | null>(null);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.user.set(JSON.parse(stored));
    }
  }

  setUser(partial: Partial<CurrentUser>) {
    const current = this.user();
    const updated = { ...current, ...partial } as CurrentUser;
    //It merges updates (step 1 sets email, step 2 sets phone, etc.) then saves to storage.

    this.user.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  getUser() {
    return this.user();
  }

  clear() {
    this.user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
