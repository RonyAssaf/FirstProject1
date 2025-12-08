import { Component, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
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
  @ViewChildren('otpBox') otpBoxes!: QueryList<any>;
  values: string[] = ['', '', '', '', '', ''];
  correctCode = '123456';

  // TrackBy to prevent DOM re-render issues
  trackByIndex(index: number, item: any) {
    return index;
  }

  getStatus(index: number): string {
    const currentValue = this.values[index];
    if (!currentValue) return '';
    return this.values.join('') === this.correctCode ? 'correct' : 'incorrect';
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

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
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);

    if (!digits) return;

    // Fill values array
    for (let i = 0; i < 6; i++) {
      this.values[i] = digits[i] ?? '';
    }

    // Fill input fields visually
    const boxes = this.otpBoxes.toArray();
    this.values.forEach((v, i) => {
      if (boxes[i]) boxes[i].nativeElement.value = v;
    });

    this.codeChange.emit(this.values.join(''));

    // Focus the last filled box
    if (boxes[digits.length - 1]) {
      boxes[digits.length - 1].nativeElement.focus();
    }
  }
}
