import { Component, AfterViewInit } from '@angular/core';
import { Application } from '@splinetool/runtime';

@Component({
  selector: 'app-donut',
  standalone: true,
  imports: [],
  templateUrl: './donut.component.html',
  styleUrl: './donut.component.scss'
})
export class DonutComponent implements AfterViewInit {
  ngAfterViewInit() {
    const canvas = document.getElementById('canvas3d') as HTMLCanvasElement;
    if (canvas) {
      const app = new Application(canvas);
      app.load('https://prod.spline.design/IX4VyMdeD9S0BPrX/scene.splinecode');
    } else {
      console.error('Canvas element not found');
    }
  }
}
