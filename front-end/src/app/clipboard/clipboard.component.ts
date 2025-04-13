import { Component, ElementRef, OnInit, ViewChild, Renderer2, AfterViewInit } from '@angular/core';
import { io } from 'socket.io-client';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-clipboard',
  templateUrl: './clipboard.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  styleUrls: ['./clipboard.component.css']
})
export class ClipboardComponent implements OnInit, AfterViewInit {
  @ViewChild('draggable') draggable!: ElementRef;
  @ViewChild('videoCapture') videoElement!: ElementRef;
  @ViewChild('canvasOutput') canvasElement!: ElementRef;
  socket: any;
  isDragging = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  fileContent: ArrayBuffer | string | null = null;
  efaLasa : boolean = false
  receivedFiles: any[] = [];

  constructor(private renderer: Renderer2) {}
  devices: any[] = [];

  ngOnInit(): void {
    this.socket = io('http://10.200.50.168:3000');
    this.socket.emit('register', { name: 'Nyavo\'s Phone', type: 'mobile' });
    this.socket.on('updateDevices', (deviceList: any[]) => {
      this.devices = deviceList.filter(d => d.id !== this.socket.id);
    });
    this.socket.on('clipboard', (data: any) => {
      this.receivedFiles.push(data);
      this.showTeaser(data);

      // alert('Received: ' + JSON.stringify(data));
    });
  }
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  downloadFile(file: any): void {
    const blob = new Blob([this.base64ToArrayBuffer(file.content)], { type: file.fileType });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    alert("Downloading")
    // Clean up the temporary URL object
    window.URL.revokeObjectURL(url);
  }


  showPopup = false; // Visibility state of the popup
  popupFile: any = null;

  showTeaser(file: any): void {
    this.popupFile = file; // Assign file to popup
    alert(JSON.stringify(file.content))
    this.showPopup = true; // Show the popup
    this.downloadFile(file)
  }

  // Close popup
  closePopup(): void {
    this.showPopup = false;
    this.popupFile = null;
  }


  async ngAfterViewInit(): Promise<void> {
    await this.setupMediaPipeHands();
  }

  private async setupMediaPipeHands(): Promise<void> {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const canvasCtx = canvas.getContext('2d');

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results: Results) => {
      this.onHandResults(results);
      this.drawHandLandmarks(results, canvasCtx);
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 1280,
      height: 720
    });

    await camera.start();
  }

  private hasSentData = false;
  private wasFisting = false;

  private onHandResults(results: Results): void {
    if (this.efaLasa) return;
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.wasFisting = false;
      this.isDragging = false;
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    const isFisting = this.isFist(landmarks);

    if (isFisting && !this.wasFisting) {
      console.log("Fist start detected");
      const screenX = landmarks[0].x * window.innerWidth; // Use palm base landmark
      const screenY = landmarks[0].y * window.innerHeight;
      const rect = this.draggable.nativeElement.getBoundingClientRect();
      this.isDragging = true;
      this.hasSentData = false;

    }

    // if (!isFisting && this.wasFisting && this.isDragging) {
    //   console.log("Fist end detected");
    //   this.isDragging = false;
    //   this.hasSentData = true;
    //   this.socket.emit('clipboard', {
    //     type: 'text',
    //     content: 'This is the data'
    //   });
    //   console.log("Data sent!");
    // }
    // this.wasFisting = isFisting;
    if (!isFisting && this.wasFisting && this.isDragging) {
      console.log("Fist end detected");
      this.isDragging = false;

      if (!this.hasSentData && this.selectedFile && this.fileContent) {
        this.hasSentData = true;
        this.socket.emit('clipboard', {
          type: 'file',
          fileName: this.selectedFile.name,
          fileType: this.selectedFile.type,
          fileSize: this.selectedFile.size,
          content: this.fileContent
        });
        console.log("File sent!");
        this.efaLasa = true;
      }
    }
    this.wasFisting = isFisting;
  }

  private isFist(landmarks: any[]): boolean {

    const fingers = [
      { tip: 8, pip: 6 },
      { tip: 12, pip: 10 },
      { tip: 16, pip: 14 },
      { tip: 20, pip: 18 }
    ];

    const threshold = 0.1;

    return fingers.every(finger => {
      const dx = landmarks[finger.tip].x - landmarks[finger.pip].x;
      const dy = landmarks[finger.tip].y - landmarks[finger.pip].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < threshold;
    });
  }


  private drawHandLandmarks(results: Results, canvasCtx: CanvasRenderingContext2D): void {
    if (canvasCtx && results.multiHandLandmarks) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
      }
      canvasCtx.restore();
    }
  }
  //
  // sendTo(targetId: string): void {
  //   this.socket.emit('clipboard', { targetId, data: { type: 'text', content: 'This is the data' } });
  // }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.readFile(this.selectedFile);
    }
  }

  private readFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      this.fileContent = e.target?.result as ArrayBuffer;
    };

    // For binary files
    reader.readAsArrayBuffer(file);

    // Alternative for text-based files:
    // reader.readAsDataURL(file);
  }

  // Update sendTo method
  sendTo(targetId: string): void {
    if (this.selectedFile && this.fileContent) {
      this.socket.emit('clipboard', {
        targetId,
        data: {
          type: 'file',
          fileName: this.selectedFile.name,
          fileType: this.selectedFile.type,
          fileSize: this.selectedFile.size,
          content: this.fileContent
        }
      });
    }
  }
}

const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17]
];

