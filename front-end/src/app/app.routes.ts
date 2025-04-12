import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { CustomizableRoomComponent } from './customizable-room/customizable-room.component';
import { BudgetComponent } from './budget/budget.component';
import { LogineComponent } from './login/login.component';
import {ClipboardComponent} from './clipboard/clipboard.component';
import {ChildRoomComponent} from './child-room/child-room.component';
import {RegisterComponent} from './authentication-screens/register/register.component';
import {LoginComponent} from './authentication-screens/login/login.component';
import { Landing2Component } from './landing2/landing2.component';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'room', component: CustomizableRoomComponent },
  { path: 'budget', component: BudgetComponent },
  { path: 'logine', component: LogineComponent },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {path:'drag',component:ClipboardComponent},
  {path:'child-room',component:ChildRoomComponent},
  {path:'register',component:RegisterComponent},
  {path:'login',component:LoginComponent},
  {path:'landing2',component:Landing2Component},
];
