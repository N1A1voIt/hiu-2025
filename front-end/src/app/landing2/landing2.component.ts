import { Component } from '@angular/core';
import { DonutComponent } from '../donut/donut.component';
import { MenuComponent } from "../components-atomique/menu/menu.component";
import {ClipboardComponent} from '../clipboard/clipboard.component';

@Component({
  selector: 'app-landing2',
  standalone: true,
  imports: [DonutComponent, MenuComponent, ClipboardComponent],
  templateUrl: './landing2.component.html',
  styleUrl: './landing2.component.scss'
})
export class Landing2Component {

}
