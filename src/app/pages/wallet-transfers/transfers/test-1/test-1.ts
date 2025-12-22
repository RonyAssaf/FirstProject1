import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-1',
  standalone: true,
  imports: [RouterModule], // 🔥 REQUIRED for routerLink
  templateUrl: './test-1.html',
  styleUrl: './test-1.scss',
})
export class Test1 {}
