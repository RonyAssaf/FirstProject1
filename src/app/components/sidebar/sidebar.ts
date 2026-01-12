import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  constructor(private currentUserService: CurrentUserService) {}

  // reactive signals for name and handle
  userName = computed(() => {
    const user = this.currentUserService.user();
    if (!user) return 'Monty Finance'; // default
    // Use actual name if exists, otherwise take part before @
    return user.email.split('@')[0];
  });

  userHandle = computed(() => {
    const user = this.currentUserService.user();
    return user?.email ?? 'haysam'; // show full email
  });
}
