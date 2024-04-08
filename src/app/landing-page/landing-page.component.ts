import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FirestoreService, Campaign, Work, User } from '../shared/firestore.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  public firestore = inject(FirestoreService);

  constructor () {
  }

}

