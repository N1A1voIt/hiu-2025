import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-home-heart',
  standalone: true,
  imports: [],
  templateUrl: './home-heart.component.html',
  styleUrl: './home-heart.component.scss'
})
export class HomeHeartComponent {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
}
