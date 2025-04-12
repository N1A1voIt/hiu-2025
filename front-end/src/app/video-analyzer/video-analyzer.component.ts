import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {MediaService} from '../services/media.service';
import {EmotionDetector} from '../services/emotion-detector.service';
import {JsonPipe} from '@angular/common';
import * as tf from '@tensorflow/tfjs';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-video-analyzer',
  standalone: true,
  imports: [
    JsonPipe
  ],
  templateUrl: './video-analyzer.component.html',
  styleUrl: './video-analyzer.component.scss'
})
export class VideoAnalyzerComponent implements OnInit{
  @ViewChild('capturedVideo') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  private subscription = new Subscription();

  faceData: any = [];

  constructor(private captureService: MediaService, private emotionDetector: EmotionDetector) {}

  ngOnInit() {
    this.subscription.add(
      this.captureService.capturedStream$.subscribe(stream => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      })
    );

  }

  async startCapture() {
    try {
      await this.captureService.captureTeamsWindow();
      await this.emotionDetector.analyzeVideo(this.videoElement.nativeElement, this.faceData, this.canvasElement.nativeElement);
    } catch (error) {
      alert(`Erreur: ${error}`);
    }
  }

  stopCapture() {
    this.captureService.stopCapture();
    console.log("FACE DATA DANS VIDEO ANALYZER", this.faceData);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.captureService.stopCapture();
  }
}
