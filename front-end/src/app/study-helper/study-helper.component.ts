import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { FileClipComponent } from '../components/file-clip/file-clip.component';
import {ChatService} from '../../services/chat.service';

@Component({
  selector: 'app-study-helper',
  standalone: true,
  imports: [FormsModule, NgIf, FileClipComponent],
  templateUrl: './study-helper.component.html',
  styleUrl: './study-helper.component.scss',
})
export class StudyHelperComponent {
  inputText: string = '';
  uploadedFile: File | null = null;
  submittedText: string = '';
  responseText: string | null = null;
  displayedText: string = '';
  responseAudio: any = null;

  @ViewChild('textArea', { static: false }) textArea!: ElementRef;

  typingIndex: number = 0;
  typingSpeed: number = 20; // ms per character

  onFileSelected(event: any): void {
    this.uploadedFile = event.target.files[0];
  }
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file); // Includes the MIME prefix

      reader.onload = () => {
        const base64 = reader.result as string; // Full base64 like data:image/png;base64,...
        resolve(base64);
      };

      reader.onerror = error => reject(error);
    });
  }

  onSubmit(): void {
    console.log("atooooo");
    this.submittedText = this.inputText;
    if (this.uploadedFile) {
      console.log('File:', this.uploadedFile);
      let file="";
      this.convertFileToBase64(this.uploadedFile).then(base64String => {
        this.chatService.sendMessageWithFile(this.submittedText,file).subscribe({
          next: ( value) => {
            this.responseText = value[0].content.parts[0].text;
            this.displayedText = '';
            this.typingIndex = 0;
            this.typeText();
          }
        });
      });
    }
    else{
      this.chatService.sendMessage(this.submittedText).subscribe({
        next: ( value) => {
          this.responseText = value[0].content.parts[0].text;
          console.log('Response:', this.responseText);
          this.displayedText = '';
          this.typingIndex = 0;
          this.typeText();
        }
      });
    }
    console.log('Text:', this.inputText);
    this.inputText = '';
    this.uploadedFile = null;
    this.autoResize(); // Reset height after submit
  }

  typeText(): void {
    if (!this.responseText) return;

    if (this.typingIndex < this.responseText.length) {
      this.displayedText += this.responseText[this.typingIndex];
      this.typingIndex++;
      setTimeout(() => this.typeText(), this.typingSpeed);
    }
  }

  autoResize(): void {
    if (this.textArea && this.textArea.nativeElement) {
      this.textArea.nativeElement.style.height = 'auto';
      this.textArea.nativeElement.style.height =
        this.textArea.nativeElement.scrollHeight + 'px';
    }
  }

  ngAfterViewChecked(): void {
    this.autoResize(); // Initial resize
  }
  constructor(private chatService: ChatService) {
  }
}
