import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private capturedStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  capturedStream$ = this.capturedStreamSubject.asObservable();

  async captureTeamsWindow(): Promise<MediaStream> {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      this.capturedStreamSubject.next(displayStream);
      return displayStream;
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
      throw new Error(`Impossible de capturer la fenêtre Teams: ${error}`);
    }
  }

  stopCapture() {
    const stream = this.capturedStreamSubject.value;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.capturedStreamSubject.next(null);
    }
  }
}
