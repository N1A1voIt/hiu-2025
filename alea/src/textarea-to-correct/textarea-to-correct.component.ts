import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-textarea-to-correct',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './textarea-to-correct.component.html',
  styleUrl: './textarea-to-correct.component.css'
})
export class TextareaToCorrectComponent {
  inputText: string = '';

  @ViewChild('textArea', { static: false }) textArea!: ElementRef;

  autoResize(): void {
    if (this.textArea && this.textArea.nativeElement) {
      this.textArea.nativeElement.style.height = 'auto';
      this.textArea.nativeElement.style.height =
        this.textArea.nativeElement.scrollHeight + 'px';
    }
  }

  onSubmit () {
    
  }

  // localhost:3000/api/corriger-phrase

  ngAfterViewChecked(): void {
    this.autoResize(); // Initial resize
  }
}
