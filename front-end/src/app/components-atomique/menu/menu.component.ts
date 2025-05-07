import { Component } from '@angular/core';
import { LinkComponent } from '../link/link.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [LinkComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {}
