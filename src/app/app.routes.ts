import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { DbViewerComponent } from './db-viewer/db-viewer.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent },
    {path: 'home', component: LandingPageComponent},
    {path: 'viewer/:selected_campaign/:selected_work', component: DbViewerComponent},
    {path: 'viewer/:selected_campaign', component: DbViewerComponent},
    {path: 'viewer', component: DbViewerComponent},

    {path: '', redirectTo: '/login', pathMatch: 'full'}
];
