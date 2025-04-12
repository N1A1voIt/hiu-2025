import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ChildRoomComponent} from './child-room/child-room.component';
import { MenuComponent } from './components-atomique/menu/menu.component';
import {CustomizableRoomComponent} from './customizable-room/customizable-room.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChildRoomComponent,MenuComponent],
  imports: [RouterOutlet, ChildRoomComponent, CustomizableRoomComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-end';
}
