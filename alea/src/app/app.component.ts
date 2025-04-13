import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CorrectedTextComponent } from "../corrected-text/corrected-text.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CorrectedTextComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'alea';
}
