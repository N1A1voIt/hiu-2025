import {Component, Input, Type} from '@angular/core';
import {FermerComponent} from "../components/fermer/fermer.component";
import {NgComponentOutlet} from '@angular/common';

@Component({
  selector: 'app-action-btn',
  standalone: true,
  imports: [
    FermerComponent,
    NgComponentOutlet
  ],
  templateUrl: './action-btn.component.html',
  styleUrl: './action-btn.component.scss'
})
export class ActionBtnComponent {
  @Input() action: () => void = () => {};
  @Input() iconComponent!: Type<any>; // Angular component input
}
