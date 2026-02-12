import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Requests that should NOT attach Authorization header.
   * Keep these aligned with backend public endpoints.
   */
  private static readonly PUBLIC_PATHS = [
    '/auth/login',
    '/users/register',
    '/users/lookup',
    '/swagger-ui',
    '/v3/api-docs',
  ] as const;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isPublicRequest(req.url)) {
      return next.handle(req);
    }

    const token = this.getToken();
    if (!token) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

    return next.handle(authReq);
  }

  /**
   * Checks URL pathname safely (works for absolute and relative URLs).
   */
  private isPublicRequest(url: string): boolean {
    const path = this.extractPathname(url);
    return AuthInterceptor.PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  }

  private extractPathname(url: string): string {
    // Absolute URL? parse normally
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        return new URL(url).pathname;
      } catch {
        return url; // fallback
      }
    }
    // Relative URL like "/transactions" or "transactions"
    return url.startsWith('/') ? url : `/${url}`;
  }

  private getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') return null;
    return token;
  }
}
