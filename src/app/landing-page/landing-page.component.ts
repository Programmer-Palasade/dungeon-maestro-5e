import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FirestoreService, Campaign, Work, User } from '../shared/firestore.service';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnDestroy {

  public firestore = inject(FirestoreService);

  constructor () { }

  ngOnDestroy(): void {
  }
}

