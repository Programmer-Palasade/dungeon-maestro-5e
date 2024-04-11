import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FirestoreService, Campaign, Work, User } from '../shared/firestore.service';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, MatButton],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  public firestore = inject(FirestoreService);
  private auth = inject(AuthService);
  public router = inject(Router);

  public selected_campaign = "";

  constructor () {
  }

  public select_campaign(c_id: string) {
    if (this.firestore.campaigns.has(c_id)) { this.selected_campaign = c_id; return true; }
    return false;
  }

  public async logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }

}

