import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

/* =====================
 * TYPES
 * ===================== */

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phoneNumber: string;
}

export interface AuthUser {
  id: string;
  email: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UserLookupResponse {
  id: string;
  email: string;
  phoneNumber?: string;
  displayName: string; // letters before @
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersUrl = `${environment.apiBaseUrl}/users`;
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  /* =====================
   * AUTH
   * ===================== */

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http
      .post<ApiResponse<AuthUser>>(`${this.usersUrl}/register`, payload)
      .pipe(map((res) => res.data));
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.authUrl}/login`, payload)
      .pipe(map((res) => res.data));
  }

  /* =====================
   * LOOKUP
   * ===================== */

  lookupByPhone(phone: string): Observable<UserLookupResponse> {
    const params = new HttpParams().set('phone', phone);
    return this.http
      .get<ApiResponse<UserLookupResponse>>(`${this.usersUrl}/lookup`, { params })
      .pipe(map((res) => res.data));
  }

  lookupByEmail(email: string): Observable<UserLookupResponse> {
    const params = new HttpParams().set('email', email);
    return this.http
      .get<ApiResponse<UserLookupResponse>>(`${this.usersUrl}/lookup`, { params })
      .pipe(map((res) => res.data));
  }
}
