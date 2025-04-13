import { Component, AfterViewInit } from '@angular/core';
import { Application } from '@splinetool/runtime';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss'
})
export class FinanceComponent implements AfterViewInit {
  ngAfterViewInit() {
    const canvas = document.getElementById('canvas3d') as HTMLCanvasElement;
    if (canvas) {
      const app = new Application(canvas);
      app.load('https://prod.spline.design/B1sss3NlBTWO51Ku/scene.splinecode');
    } else {
      console.error('Canvas element not found');
    }
  }
}
