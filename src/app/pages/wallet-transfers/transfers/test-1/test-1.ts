import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-1',
  standalone: true,
  imports: [RouterModule], // 🔥 REQUIRED for routerLink
  templateUrl: './test-1.html',
  styleUrl: './test-1.scss',
})
export class Test1 {
  constructor(private router: Router) {}
  goToTest11() {
    this.router.navigate(['/transfers/test-1/test-11']);
  }
  isActive(): boolean {
    return this.router.url.startsWith('/transfers/test-1');
  }
}
