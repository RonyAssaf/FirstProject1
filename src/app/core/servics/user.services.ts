import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  email: string;
  password: string;
  phoneNumber: string;
}

export interface AuthUser {
  id: number;
  email: string;
  phoneNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  // ✅ FINAL REGISTER — ONE INSERT
  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/register`, payload);
  } // json { "email": "...", "password": "...", "phoneNumber": "..." }
  login(payload: { email: string; password: string }) {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, payload);
  }
}
