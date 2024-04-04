import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { FirestoreService } from '../shared/firestore.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  private firestore = inject(FirestoreService);
  private route = inject(ActivatedRouteSnapshot);
  private location = inject(Location);

  public user = {uid:"", name:"", email:""};

  constructor () { }

}

