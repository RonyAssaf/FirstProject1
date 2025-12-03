import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './email-input.html',
  styleUrls: ['./email-input.scss'],
})
export class EmailInput {
  @Input() control!: FormControl;
}
