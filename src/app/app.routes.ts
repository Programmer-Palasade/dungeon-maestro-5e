import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent },
    {path: 'home', component: LandingPageComponent},

    {path: '', redirectTo: '/login', pathMatch: 'full'}
];
