import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp-input.html',
  styleUrls: ['./otp-input.scss'],
})
export class OtpInputComponent {
  @Output() codeChange = new EventEmitter<string>();

  values: string[] = ['', '', '', '', '', ''];
  correctCode = '123456'; // Replace with your actual correct OTP

  // TrackBy to prevent DOM re-render issues
  trackByIndex(index: number, item: any) {
    return index;
  }

  // Determine the class for each input: '' | 'correct' | 'incorrect'
  getStatus(index: number): string {
    const currentValue = this.values[index];
    if (!currentValue) return '';
    // Only apply correct if full OTP matches
    return this.values.join('') === this.correctCode ? 'correct' : 'incorrect';
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow single digits
    if (!/^\d$/.test(value)) {
      input.value = '';
      return;
    }

    this.values[index] = value;
    this.codeChange.emit(this.values.join(''));

    // Move focus to next input if it exists
    const nextInput = input.nextElementSibling as HTMLInputElement | null;
    if (nextInput) nextInput.focus();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace') {
      if (input.value === '') {
        const prevInput = input.previousElementSibling as HTMLInputElement | null;
        if (prevInput) prevInput.focus();
      } else {
        this.values[index] = '';
        this.codeChange.emit(this.values.join(''));
      }
    }
  }
}
