import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
    {path: 'home', component: LandingPageComponent},

    {path: '', redirectTo: '/home', pathMatch: 'full'}
];
