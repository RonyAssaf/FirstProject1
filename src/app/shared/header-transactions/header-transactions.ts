import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-header-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-transactions.html',
  styleUrl: './header-transactions.scss',
})
export class HeaderTransactions {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
    });
  }
  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    crumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const children = route.children;
    if (!children || children.length === 0) return crumbs;

    for (const child of children) {
      const segment = child.snapshot.url.map((s) => s.path).join('/');

      // Only advance URL if there is a real segment
      const nextUrl = segment ? `${url}/${segment}` : url;

      const breadcrumb = child.snapshot.data['breadcrumb'];
      const label = typeof breadcrumb === 'function' ? breadcrumb(child.snapshot) : breadcrumb;

      // ✅ Only push breadcrumb if:
      // - it has a label
      // - AND it actually represents a navigable URL
      if (label && segment) {
        crumbs.push({
          label,
          route: nextUrl,
        });
      }

      return this.buildBreadcrumbs(child, nextUrl, crumbs);
    }

    return crumbs;
  }
}
