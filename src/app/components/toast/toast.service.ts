import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastState = new BehaviorSubject<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  toast$ = this.toastState.asObservable();

  show(message: string) {
    this.toastState.next({ message, visible: true });

    setTimeout(() => {
      this.toastState.next({ message: '', visible: false });
    }, 3000);
  }
}
