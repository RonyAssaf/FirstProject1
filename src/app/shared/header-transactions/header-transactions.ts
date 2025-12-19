import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Location } from '@angular/common';

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

  constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
    });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    crumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const child = route.firstChild;
    if (!child) return crumbs;

    const segment = child.snapshot.url.map((s) => s.path).join('/');
    if (segment) url += `/${segment}`;

    const breadcrumb = child.snapshot.data['breadcrumb'];

    // ✅ IMPORTANT: execute breadcrumb function
    const label = typeof breadcrumb === 'function' ? breadcrumb(child.snapshot) : breadcrumb;

    // 🚫 Skip empty-path duplication
    if (label && segment) {
      crumbs.push({ label, route: url });
    }

    return this.buildBreadcrumbs(child, url, crumbs);
  }
  goBack() {
    this.location.back();
  }
}
