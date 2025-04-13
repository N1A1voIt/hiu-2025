import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CurrencyPipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import {FileClipComponent} from '../components/file-clip/file-clip.component';
import {FinanceComponent} from '../finance-bg/finance.component';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {VideoAnalyzerComponent} from '../video-analyzer/video-analyzer.component';
import {ChatService} from '../../services/chat.service';
import {LoaderComponent} from '../loader/loader.component';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    NgForOf,
    CurrencyPipe,
    FileClipComponent,
    FinanceComponent,
    NgIf,
    RouterLinkActive,
    VideoAnalyzerComponent,
    RouterLink,
    NgStyle,
    LoaderComponent
  ],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss'
})
export class BudgetComponent implements OnInit {
  budgets: any[] = [];
  totalExpenses: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;


  uploadedFile!: File;

  constructor(private firestore: AngularFirestore,private chatService: ChatService,) {}

  ngOnInit(): void {
    this.fetchBudgets();
  }

  fetchBudgets() {
    this.firestore
      .collection('budget')
      .valueChanges({ idField: 'id' })
      .subscribe({
        next: (docs: any[]) => {
          this.budgets = docs;
          this.calculateTotalExpenses();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching budgets:', error);
          this.errorMessage = 'An error occurred while fetching budgets.';
          this.isLoading = false;
        }
      });
  }

  calculateTotalExpenses() {
    this.totalExpenses = this.budgets
      .filter(budget => budget.type === 'expense')
      .reduce((sum, budget) => sum + parseFloat(budget.total || 0), 0);
  }

  uploadBudgetToFirestore(budgetItem: any): Promise<void> {
    try {
      // Generate a unique ID for the document or use one if provided
      const docId = budgetItem.id || this.firestore.createId();

      // Optionally add a timestamp or any other data processing
      const budgetWithTimestamp = {
        ...budgetItem
      };

      // Return the promise for uploading the single item
      return this.firestore.collection('budget').doc(docId).set(budgetWithTimestamp);
    } catch (error) {
      console.error('Error uploading budget item:', error);
      return Promise.reject(error);
    }
  }


  uploadFile(event: any): void {
    this.uploadedFile = event.target.files[0];

    // call ocr or idk

   let response = {
      "total": 2000,
      "type": "expense",
      "title": "title of the receipt",
      "description": "description of the receipt",
      "details":"details of the receipt",
    }

  this.chatService.sendMessageWithFileDep("azavao",this.uploadedFile).subscribe({
    next: (value) => {
      let ind = 0;
      if (value.length > 1) {
        ind = 2;
      }
      const rawText = value[ind].content.parts[0].text;
      const cleanText = rawText.replace(/```json|```/g, '').trim();
      console.log("cleann "+cleanText);
      response = JSON.parse(cleanText);

      this.isLoading = true;
      this.uploadBudgetToFirestore(response)
        .then(() => {
          console.log('Budgets uploaded successfully');
          // You might want to show a success message to the user
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Failed to upload budgets:', error);
          this.errorMessage = 'Failed to upload the budget data. Please try again.';
          this.isLoading = false;
        });
    }
  });


  }

  protected readonly alert = alert;
}
