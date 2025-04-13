import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {MediaService} from '../services/media.service';
import {EmotionDetector} from '../services/emotion-detector.service';
import {JsonPipe, NgIf} from '@angular/common';
import * as tf from '@tensorflow/tfjs';
import {Subscription} from 'rxjs';
import {ChatService} from '../../services/chat.service';
import {LoaderComponent} from "../loader/loader.component";

@Component({
  selector: 'app-video-analyzer',
  standalone: true,
  imports: [
    JsonPipe,
    NgIf,
    LoaderComponent
  ],
  templateUrl: './video-analyzer.component.html',
  styleUrl: './video-analyzer.component.scss'
})
export class VideoAnalyzerComponent implements OnInit{
  @ViewChild('capturedVideo') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  private subscription = new Subscription();

  isLoading: boolean = false;

  faceData: any = [];
  isCapturing: boolean = false;
  isModal: boolean = false;
  responseText: string = "";

  constructor(private captureService: MediaService, private emotionDetector: EmotionDetector, private chatService: ChatService) {}

  ngOnInit() {
    this.subscription.add(
      this.captureService.capturedStream$.subscribe(stream => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      })
    );

  }

  async toggleCapture() {
    if (this.isCapturing) {
      this.stopCapture();
    } else {
      await this.startCapture();
    }
    this.isCapturing = !this.isCapturing;
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
    this.isLoading = true;
    console.log("FACE DATA DANS VIDEO ANALYZER", this.faceData);
    this.chatService.sendMessage(JSON.stringify(this.faceData)).subscribe({
      next: (value) => {
        // @ts-ignore
        this.responseText = value[0].content.parts[0].text;
        const jsonResponse = JSON.parse(this.responseText.replace("```json","").replace("```",""));
        const details = jsonResponse.details;
        this.responseText = details;
        console.log('Response:', this.responseText);
        this.isLoading = false;
        this.isModal = !this.isModal;
      }
    });
  }

  clickModal() {
    this.isModal = !this.isModal;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.captureService.stopCapture();
  }
}
