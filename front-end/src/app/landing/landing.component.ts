import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  isClicked: boolean = false;
  isChat: boolean = false;
  isAnimating: boolean = false;
  isAnimatingChat: boolean = false;

  clickSafe() {
    this.isAnimating = true;
    setTimeout(() => {
      this.isClicked = !this.isClicked;
      this.isAnimating = false;
    }, 3000);
  }
  clickChat() {
    this.isAnimatingChat = true;
    setTimeout(() => {
      this.isChat = !this.isChat;
      this.isAnimatingChat = false;
    }, 300);
  }
}
