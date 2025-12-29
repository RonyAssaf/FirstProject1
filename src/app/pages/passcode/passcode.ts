import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '@components/toast/toast.service';
import { OtpInputComponent } from '@components/otp-input/otp-input';
import { ToastComponent } from '@components/toast/toast';

@Component({
  selector: 'app-passcode',
  standalone: true,
  imports: [OtpInputComponent, ToastComponent],
  templateUrl: './passcode.html',
  styleUrl: './passcode.scss',
})
export class Passcode {
  private readonly CORRECT_CODE = '123456';

  constructor(private router: Router, private toast: ToastService) {}

  onOtpChange(code: string) {
    if (code.length === 6 && code === this.CORRECT_CODE) {
      this.router.navigate(['/successful']);
    }
  }

  forgotPasscode() {
    this.toast.show('We sent an email to reset your passcode');
  }
}
