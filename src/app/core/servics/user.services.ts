import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private usersUrl = 'http://localhost:8080/users';
  private authUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.usersUrl}/register`, payload);
  }

  // ✅ JWT login endpoint + correct return type
  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, payload);
  }

  // ✅ lookup by phone
  lookupByPhone(phone: string): Observable<UserLookupResponse> {
    const params = new HttpParams().set('phone', phone);
    return this.http.get<UserLookupResponse>(`${this.usersUrl}/lookup`, { params });
  }

  // ✅ lookup by email
  lookupByEmail(email: string): Observable<UserLookupResponse> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UserLookupResponse>(`${this.usersUrl}/lookup`, { params });
  }
}
