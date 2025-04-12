import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: false }) video!: ElementRef;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  videoStream: MediaStream | null = null;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async startCamera() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.video.nativeElement.srcObject = this.videoStream;
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('Unable to access the camera. Please grant permissions.');
    }
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
  }
  capturePhoto(): void {
    const context = this.canvas.nativeElement.getContext('2d');
    if (context) {
      context.drawImage(this.video.nativeElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.canvas.nativeElement.toBlob((blob: Blob) => {
        if (blob) {
          this.sendPhoto(blob);
        } else {
          alert('Failed to capture image.');
        }
      }, 'image/jpeg');
    }
  }

  sendPhoto(photoBlob: Blob): void {
    const formData = new FormData();
    formData.append('photo', photoBlob, 'photo.jpg');

    this.http.post('http://localhost:3000/api/login', formData).subscribe(
      (response:any) => {
          localStorage.setItem('user', JSON.stringify(response.match));
          alert("Logged")
      },
      (error) => {
        console.error('Upload error:', error);
      }
    );
  }
}
