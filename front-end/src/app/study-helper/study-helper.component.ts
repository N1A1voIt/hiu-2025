import {Component, ElementRef, Input, Output, ViewChild} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { FileClipComponent } from '../components/file-clip/file-clip.component';
import {ChatService} from '../../services/chat.service';
import EventEmitter from 'node:events';
import {LoaderComponent} from '../loader/loader.component';

@Component({
  selector: 'app-study-helper',
  standalone: true,
  imports: [FormsModule, NgIf, FileClipComponent, LoaderComponent],
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
  calls: number = 0;
  reward = false;

  isLoading: boolean = false;

  @ViewChild('textArea', { static: false }) textArea!: ElementRef;

  @Input() displayReward: () => void = () => {};

  typingIndex: number = 0;
  typingSpeed: number = 20; // ms per character

  onFileSelected(event: any): void {
    this.uploadedFile = event.target.files[0];
  }
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        // reader.result is something like: "data:image/png;base64,iVBORw0KGgo..."
        const base64String = (reader.result as string).split(',')[1]; // Remove "data:*/*;base64,"
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  onSubmit(): void {
    console.log("atooooo");
    this.submittedText = this.inputText;
    this.calls++;

    this.isLoading = true

    if (this.uploadedFile) {
      console.log('File:', this.uploadedFile);
      this.chatService.sendMessageWithFile(this.submittedText,this.uploadedFile).subscribe({
        next: ( value) => {
          this.responseText = value[0].content.parts[0].text;
          this.isLoading = false;
          this.displayedText = '';
          this.typingIndex = 0;
          this.typeText();
        }
      });
    }
    else{
      this.chatService.sendMessage(this.submittedText).subscribe({
        next: ( value) => {
          this.responseText = value[0].content.parts[0].text;
          console.log('Response:', this.responseText);
          this.isLoading = false;
          this.displayedText = '';
          this.typingIndex = 0;
          this.typeText();
        }
      });
    }

    if (this.calls == 2) {
      this.displayReward();
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
