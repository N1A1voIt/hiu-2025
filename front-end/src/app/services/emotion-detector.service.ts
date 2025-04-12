import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import { BehaviorSubject, Observable } from 'rxjs';

export interface EmotionScores {
  neutral?: number;
  happy?: number;
  sad?: number;
  angry?: number;
  fearful?: number;
  disgusted?: number;
  surprised?: number;
}

@Injectable({ providedIn: 'root' })
export class EmotionDetector {
  private modelsLoaded = false;
  private emotionScoresSubject = new BehaviorSubject<EmotionScores>({});
  public emotionScores$: Observable<EmotionScores> = this.emotionScoresSubject.asObservable();

  private detectionInterval: any;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.loadModels();
  }

  async loadModels() {

    if (this.modelsLoaded) return;

    const MODEL_URL = '/assets/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);

    await faceapi.tf.setBackend('webgl');
    await faceapi.tf.ready();

    this.modelsLoaded = true;
  }

  async analyzeVideo(videoElement: HTMLVideoElement, faceData: any, canvasElement?: HTMLCanvasElement): Promise<void> {


    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }

    if (!videoElement) {
      console.error('Élément vidéo non disponible');
      return;
    }

    if (canvasElement) {
      this.canvas = canvasElement;
    } else if (!this.canvas) {
      this.canvas = await faceapi.createCanvasFromMedia(videoElement);
      // Positionnement du canvas sur la vidéo
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      videoElement.parentNode?.appendChild(this.canvas);
    }

    const displaySize = {
      width: videoElement.clientWidth,
      height: videoElement.clientHeight
    };

    faceapi.matchDimensions(this.canvas, displaySize);

    await tf.ready();

    this.detectionInterval = setInterval(async () => {
      if (videoElement.readyState === 4) {
        try {
          const detections = await faceapi.detectAllFaces(
            videoElement,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

          if (detections.length > 0) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            // Effacer le canvas précédent
            const ctx = this.canvas!.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

              faceapi.draw.drawDetections(this.canvas!, resizedDetections);
              faceapi.draw.drawFaceLandmarks(this.canvas!, resizedDetections);
              faceapi.draw.drawFaceExpressions(this.canvas!, resizedDetections);

              this.updateEmotionScores(resizedDetections[0].expressions);
              const emotionsArray = Object.entries(resizedDetections[0].expressions).map(([emotion, value]) => {
                return [emotion, parseFloat(value.toFixed(2))];
              });
              const dominantEmotion = emotionsArray.reduce((max, current) =>
                current[1] > max[1] ? current : max, ['', -1]);
              console.log(`Émotion dominante: ${dominantEmotion[0]} (${dominantEmotion[1]})`);
              faceData.push([dominantEmotion[0], dominantEmotion[1]]);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la détection faciale:', error);
        }
      }
    }, 100);
  }

  stopAnalysis(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
  }

  private updateEmotionScores(expressions: any): void {
    if (expressions) {
      this.emotionScoresSubject.next(expressions);
    }
  }

  getEmotionScores(): Observable<EmotionScores> {
    return this.emotionScores$;
  }
}
