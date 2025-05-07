import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {NgxSpinnerComponent, NgxSpinnerService} from 'ngx-spinner';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgxSpinnerComponent,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LogineComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: false }) video!: ElementRef;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef;
  isLoading:boolean = false
  videoStream: MediaStream | null = null;

  constructor(private http: HttpClient,private route:Router) {}

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
    this.isLoading = true
    this.http.post('http://localhost:3000/api/login', formData).subscribe(
      (response:any) => {
        this.isLoading = false
        localStorage.setItem('user', JSON.stringify(response.match));
        this.route.navigate(['/landing'])
      },
      (error) => {
        console.error('Login error:', error);
      }
    );
  }

}
