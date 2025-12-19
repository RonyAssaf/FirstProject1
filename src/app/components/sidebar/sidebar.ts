import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Output() sectionChange = new EventEmitter<string>();

  selected: string = 'Transactions'; // default selected

  onSelect(section: string) {
    this.selected = section;
    this.sectionChange.emit(section);
  }
}
