import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brain',
  standalone: true,
  imports: [],
  templateUrl: './brain.component.html',
  styleUrl: './brain.component.scss',
})
export class BrainComponent {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
}
