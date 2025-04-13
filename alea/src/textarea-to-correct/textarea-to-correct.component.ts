import {Component, ElementRef, ViewChild,Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-textarea-to-correct',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './textarea-to-correct.component.html',
  styleUrl: './textarea-to-correct.component.css'
})
export class TextareaToCorrectComponent {
  inputText: string = '';

  @ViewChild('textArea', { static: false }) textArea!: ElementRef

  @Input() sendTextToParent: (text: string) => void = () => {};

  constructor(private http: HttpClient) {}


  autoResize(): void {
    if (this.textArea && this.textArea.nativeElement) {
      this.textArea.nativeElement.style.height = 'auto';
      this.textArea.nativeElement.style.height =
        this.textArea.nativeElement.scrollHeight + 'px';
    }
  }

  onSubmit(): void {
    const payload = { text: this.inputText };

    this.http.post('http://localhost:3000/api/corriger-phrase', payload)
      .subscribe({
        next: response => {
          this.sendTextToParent(response.data);
        },
        error: err => {
          console.error('Error:', err);
        }
      });
  }

  ngAfterViewChecked(): void {
    this.autoResize(); // Initial resize
  }
}
