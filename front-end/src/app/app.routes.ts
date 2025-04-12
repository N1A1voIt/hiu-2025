import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import {CustomizableRoomComponent} from './customizable-room/customizable-room.component';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'room', component: CustomizableRoomComponent },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

];
