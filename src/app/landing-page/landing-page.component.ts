import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { HomeDashboardComponent } from "../home-dashboard/home-dashboard.component";
import { FirestoreService } from '../shared/firestore.service';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
    imports: [CommonModule, MatSidenavModule, MatButtonModule, MatGridListModule, HomeDashboardComponent]
})
export class LandingPageComponent {

  public router = inject(Router);
  firestore = inject(FirestoreService);


  constructor () {
  }

}

