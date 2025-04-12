import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {FileClipComponent} from '../components/file-clip/file-clip.component';

@Component({
  selector: 'app-study-helper',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    FileClipComponent
  ],
  templateUrl: './study-helper.component.html',
  styleUrl: './study-helper.component.scss'
})
export class StudyHelperComponent {
  inputText: string = '';
  uploadedFile: File | null = null;
  submittedText: string = '';
  responseText: string | null = null;
  responseAudio: any = null;

  @ViewChild('textArea', { static: false }) textArea!: ElementRef;

  onFileSelected(event: any): void {
    this.uploadedFile = event.target.files[0];
  }

  onSubmit(): void {
    this.submittedText = this.inputText;
    if (this.uploadedFile) {
      console.log('File:', this.uploadedFile);
    }
    this.responseText = "Okay voaray";
    console.log('Text:', this.inputText);
    this.inputText = '';
    this.uploadedFile = null;
    this.autoResize(); // Reset height after submit
  }

  autoResize(): void {
    if (this.textArea && this.textArea.nativeElement) {
      this.textArea.nativeElement.style.height = 'auto';
      this.textArea.nativeElement.style.height = this.textArea.nativeElement.scrollHeight + 'px';
    }
  }

  ngAfterViewChecked(): void {
    this.autoResize(); // Initial resize
  }
}
