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


  trackByIndex(index: number) {
    return index;
  }

  getStatus(index: number): string {
    if (!this.values[index]) return '';
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

    const next = input.nextElementSibling as HTMLInputElement | null;
    if (next) next.focus();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (input.value === '') {
        const prev = input.previousElementSibling as HTMLInputElement | null;
        if (prev) prev.focus();
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

    for (let i = 0; i < 6; i++) {
      this.values[i] = digits[i] ?? '';
    }

    const boxes = this.otpBoxes.toArray();
    this.values.forEach((v, i) => {
      if (boxes[i]) boxes[i].nativeElement.value = v;
    });

    this.codeChange.emit(this.values.join(''));

    const last = boxes[digits.length - 1];
    if (last) last.nativeElement.focus();
  }
}
