import { Component, signal } from '@angular/core';
import { CreateAccountComponent } from './pages/create-account/create-account';

@Component({
  selector: 'app-root',
  imports: [CreateAccountComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('assignement');
}
