import { Component } from '@angular/core';

@Component({
  selector: 'app-corrected-text',
  standalone: true,
  imports: [],
  templateUrl: './corrected-text.component.html',
  styleUrl: './corrected-text.component.css',
})
export class CorrectedTextComponent {
  textCorrected: string = 'Lorem Ipsum dolores....';
  displayedText: string = '';
  typingIndex: number = 0;
  typingSpeed: number = 40;

  ngOnInit(): void {
    this.typeText();
  }

  typeText() {
    if (this.typingIndex < this.textCorrected.length) {
      this.displayedText += this.textCorrected[this.typingIndex];
      this.typingIndex++;
      setTimeout(() => this.typeText(), this.typingSpeed);
    }
  }
}
