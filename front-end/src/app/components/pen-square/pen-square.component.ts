import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pen-square',
  templateUrl: './pen-square.component.html',
  styleUrls: ['./pen-square.component.scss'],
})
export class PenSquareComponent {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
}
