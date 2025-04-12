import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import {ClipboardComponent} from './clipboard/clipboard.component';
import {ChildRoomComponent} from './child-room/child-room.component';
import {RegisterComponent} from './authentication-screens/register/register.component';
import {LoginComponent} from './authentication-screens/login/login.component';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {path:'drag',component:ClipboardComponent},
  {path:'child-room',component:ChildRoomComponent},
  {path:'register',component:RegisterComponent},
  {path:'login',component:LoginComponent},
];
