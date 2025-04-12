import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu-burger',
  templateUrl: './menu-burger.component.html',
  styleUrls: ['./menu-burger.component.scss'],
})
export class MenuBurgerComponent {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
}
