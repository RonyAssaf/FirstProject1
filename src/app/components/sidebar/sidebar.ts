import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Output() sectionChange = new EventEmitter<string>();

  onSelect(section: string) {
    this.sectionChange.emit(section);
  }
}
