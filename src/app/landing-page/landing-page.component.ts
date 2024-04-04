import { Component, Optional } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Location } from '@angular/common';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  

  constructor ( @Optional() private firestore: Firestore, private route: ActivatedRouteSnapshot, private location: Location) { }

}
