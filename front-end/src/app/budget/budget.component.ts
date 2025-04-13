import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CurrencyPipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import {FileClipComponent} from '../components/file-clip/file-clip.component';
import {FinanceComponent} from '../finance-bg/finance.component';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {VideoAnalyzerComponent} from '../video-analyzer/video-analyzer.component';

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
    NgStyle
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

  constructor(private firestore: AngularFirestore) {}

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

  uploadBudgetsToFirestore(budgetItems: any[]): Promise<void[]> {
    try {
      // Create an array of promises for batch processing
      const uploadPromises = budgetItems.map(item => {
        // Generate a unique ID for the document or use one if provided
        const docId = item.id || this.firestore.createId();

        // Add timestamp for when the budget item was created
        const budgetWithTimestamp = {
          ...item
        };

        // Return the promise of setting the document
        return this.firestore.collection('budget').doc(docId).set(budgetWithTimestamp);
      });

      // Return a promise that resolves when all uploads are complete
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading budget items:', error);
      throw error;
    }
  }

  uploadFile(event: any): void {
    this.uploadedFile = event.target.files[0];

    // call ocr or idk

    const response = [{
      "total": 2000,
      "type": "expense",
      "title": "title of the receipt",
      "description": "description of the receipt",
      "details":"details of the receipt",
    }]

    this.uploadBudgetsToFirestore(response)
      .then(() => {
        console.log('Budgets uploaded successfully');
        // You might want to show a success message to the user
      })
      .catch(error => {
        console.error('Failed to upload budgets:', error);
        this.errorMessage = 'Failed to upload the budget data. Please try again.';
      });
  }

  protected readonly alert = alert;
}
