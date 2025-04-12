import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ChildRoomComponent} from './child-room/child-room.component';
import {VideoAnalyzerComponent} from './video-analyzer/video-analyzer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChildRoomComponent, VideoAnalyzerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-end';
}
