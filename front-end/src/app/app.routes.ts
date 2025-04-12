import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { CustomizableRoomComponent } from './customizable-room/customizable-room.component';
import { BudgetComponent } from './budget/budget.component';
import { LogineComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'room', component: CustomizableRoomComponent },
  { path: 'budget', component: BudgetComponent },
  { path: 'login', component: LogineComponent },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
];
