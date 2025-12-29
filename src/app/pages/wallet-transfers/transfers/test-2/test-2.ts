import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-2',
  imports: [],
  templateUrl: './test-2.html',
  styleUrl: './test-2.scss',
})
export class Test2 {
  constructor(private router: Router) {}

  goToTest21() {
    this.router.navigate(['/transfers/test-2/test-22']);
  }
  isActive(): boolean {
    return this.router.url.startsWith('/transfers/test-2');
  }
}
