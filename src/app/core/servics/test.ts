// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface BackendUser {
//   id: number;
//   email: string;
//   name: string;
// }

// @Injectable({ providedIn: 'root' })
// export class UserService {
//   private apiUrl = 'http://localhost:8080/users';

//   constructor(private http: HttpClient) {}

//   register(payload: { email: string; password: string; phoneNumber: string }) {
//     return this.http.post(`${this.apiUrl}/register`, payload);
//   }

//   login(payload: { email: string; password: string }): Observable<BackendUser> {
//     return this.http.post<BackendUser>(`${this.apiUrl}/login`, payload);
//   }
// }
