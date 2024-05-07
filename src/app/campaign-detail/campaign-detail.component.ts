import { Component, Input, inject } from '@angular/core';
import { FirestoreService } from '../shared/firestore.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Campaign } from '../shared/interfaces';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule],
  templateUrl: './campaign-detail.component.html',
  styleUrl: './campaign-detail.component.scss'
})
export class CampaignDetailComponent {
  
  public router = inject(Router);
  public firestore = inject(FirestoreService);

  @Input({required: true}) c_id = '';
  
  constructor() {
  }

  get campaign(): Campaign {
    return this.firestore.campaigns.get(this.c_id) ?? {name: 'Undefined', owner: 'Unknown', users: []};
  }

}
