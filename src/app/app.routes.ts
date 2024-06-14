import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { ListViewerComponent } from './list-viewer/list-viewer.component';
import { WorkDetailComponent } from './work-detail/work-detail.component';
import { CampaignDetailComponent } from './campaign-detail/campaign-detail.component';
import { UserNotificationsComponent } from './user-notifications/user-notifications.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent },
    {path: 'home', component: LandingPageComponent},
    {path: 'campaigns/:c_id/:w_id', component: WorkDetailComponent},
    {path: 'campaigns/:c_id', component: CampaignDetailComponent},
    {path: 'campaigns', component: ListViewerComponent},
    {path: 'notifications', component: UserNotificationsComponent},

    {path: '', redirectTo: '/login', pathMatch: 'full'}
];
