import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fermer',
  standalone: true,
  imports: [],
  templateUrl: './fermer.component.html',
  styleUrl: './fermer.component.scss',
})
export class FermerComponent {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
}
