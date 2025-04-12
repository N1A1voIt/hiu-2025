import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CurrencyPipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    NgForOf,
    CurrencyPipe
  ],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss'
})
export class BudgetComponent implements OnInit {
  budgets: any[] = [];
  totalExpenses: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;

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

}
