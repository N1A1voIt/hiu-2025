import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CustomizableRoomComponent } from '../customizable-room/customizable-room.component';
import { FamilyComponent } from '../family/family.component';

import {ClipboardComponent} from '../clipboard/clipboard.component';

import {VideoAnalyzerComponent} from '../video-analyzer/video-analyzer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, CustomizableRoomComponent, FamilyComponent, ClipboardComponent],

  imports: [
    CommonModule,
    CustomizableRoomComponent,
    FamilyComponent,
    RouterModule,
    VideoAnalyzerComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  isClicked: boolean = false;
  isChat: boolean = false;
  isAnimating: boolean = false;
  isAnimatingChat: boolean = false;
  isModal: boolean = false;

  isGrowing: boolean = false;

  roomWidth: number = 500;
  roomHeight: number = 300;

  containerWidth: number = 600;
  containerHeight: number = 400;

  growthRate: number = 10;

  @ViewChild('customizableRoom', { static: false })
  customizableRoom!: ElementRef;
  @ViewChild('down', { static: false }) safeP!: ElementRef;

  constructor(private router: Router, private renderer: Renderer2) {}

  clickSafe() {
    this.isAnimating = true;
    this.isClicked = !this.isClicked;
    this.isAnimating = false;
  }
  clickChat() {
    this.isAnimatingChat = true;
    setTimeout(() => {
      this.isChat = !this.isChat;
      this.isAnimatingChat = false;
    }, 300);
  }

  removeAllPadding(element: HTMLElement) {
    if (element) {
      if (element.style.padding) {
        element.style.padding = '0';
      }
      const children = element.querySelectorAll('*');
      children.forEach((child, index, nodeList) => {
        // Corrected forEach signature
        if ((child as HTMLElement).style.padding) {
          // Type assertion
          (child as HTMLElement).style.padding = '0'; // Type assertion
        }
      });
    }
  }

  growRoom() {
    this.isGrowing = true;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    if (this.roomWidth < maxWidth || this.roomHeight < maxHeight) {
      this.containerWidth += this.growthRate;
      this.containerHeight += this.growthRate;

      this.roomWidth += this.growthRate;
      this.roomHeight += this.growthRate;

      this.containerWidth = Math.min(this.containerWidth, maxWidth);
      this.containerHeight = Math.min(this.containerHeight, maxHeight);

      // Ensure room size does not exceed window dimensions
      this.roomWidth = Math.min(this.roomWidth, maxWidth);
      this.roomHeight = Math.min(this.roomHeight, maxHeight);

      // Remove padding from all elements within 'down'
      // this.removeAllPadding(this.safeP.nativeElement);

      // Schedule next growth step
      requestAnimationFrame(() => this.growRoom());
    } else {
      this.router.navigate(['/room']);
    }
  }

}
