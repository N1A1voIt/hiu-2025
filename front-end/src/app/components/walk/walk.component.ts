import { Component } from '@angular/core';

@Component({
  selector: 'app-walk',
  standalone: true,
  imports: [],
  templateUrl: './walk.component.html',
  styleUrl: './walk.component.scss',
})
export class WalkComponent {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
}
