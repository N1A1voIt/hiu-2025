import { Component, AfterViewInit } from '@angular/core';
import { Application } from '@splinetool/runtime';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [],
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss'
})
export class FamilyComponent implements AfterViewInit {
  ngAfterViewInit() {
    const canvas = document.getElementById('canvas3d') as HTMLCanvasElement;
    if (canvas) {
      const app = new Application(canvas);
      app.load('https://prod.spline.design/YgnoMoWQUF7p3Okr/scene.splinecode');
    } else {
      console.error('Canvas element not found');
    }
  }
}
