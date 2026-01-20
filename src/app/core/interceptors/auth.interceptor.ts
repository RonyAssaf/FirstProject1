import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ don’t attach token to public endpoints
    const isPublic =
      req.url.includes('/auth/login') ||
      req.url.includes('/users/register') ||
      req.url.includes('/users/login') ||
      req.url.includes('/swagger-ui') ||
      req.url.includes('/v3/api-docs');

    if (isPublic) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');

    // ✅ handle missing/invalid token strings
    if (!token || token === 'null' || token === 'undefined') {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq);
  }
}
