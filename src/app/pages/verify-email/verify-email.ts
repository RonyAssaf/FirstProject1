import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OtpInputComponent } from '../../components/otp-input/otp-input';
import { ToastComponent } from '../../components/toast/toast';
import { ToastService } from '../../components/toast/toast.service';
import { Header } from '../../core/header/header';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, OtpInputComponent, ToastComponent, Header],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.scss'],
})
export class VerifyEmailComponent implements OnInit {
  CORRECT_CODE = '123456';
  currentCode = '';

  counter = 60;
  canResend = false;
  intervalId: any;

  private toast = inject(ToastService);

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown() {
    this.canResend = false;
    this.counter = 60;

    this.intervalId = setInterval(() => {
      this.counter--;

      if (this.counter === 0) {
        this.canResend = true;
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  resendCode() {
    if (!this.canResend) return;

    this.toast.show('A new code has been sent.');
    this.startCountdown();
  }

  onCodeChanged(code: string) {
    this.currentCode = code;
  }
  constructor(private router: Router) {}
  test = this.currentCode === this.CORRECT_CODE;
  submit() {
    if (this.currentCode === this.CORRECT_CODE) {
      this.toast.show('✔ Email verified successfully!');
      // Example navigation:
      this.router.navigate(['/create-password']);
    } else {
      this.toast.show('❌ Incorrect verification code.');
    }
  }
}
