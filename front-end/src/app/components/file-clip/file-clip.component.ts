import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-file-clip',
  standalone: true,
  imports: [],
  templateUrl: './file-clip.component.html',
  styleUrl: './file-clip.component.scss'
})
export class FileClipComponent {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
}
