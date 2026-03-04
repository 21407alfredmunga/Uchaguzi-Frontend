import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { RegistrationComponent } from './components/registration/registration';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ResultsComponent } from './components/results/results';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'results',
    component: ResultsComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];