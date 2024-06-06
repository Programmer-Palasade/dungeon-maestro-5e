import { Component, Input, inject } from '@angular/core';
import { FirestoreService } from '../shared/firestore.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { Campaign, Work } from '../shared/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './campaign-detail.component.html',
  styleUrl: './campaign-detail.component.scss'
})
export class CampaignDetailComponent {
  
  public router = inject(Router);
  public firestore = inject(FirestoreService);

  invitee : string = "";

  @Input({required: true}) c_id = '';
  
  constructor() {
  }

  get campaign(): Campaign {
    return this.firestore.campaigns.get(this.c_id) ?? {name: 'Undefined', owner: 'Unknown', users: []};
  }

  get works(): Map<string, Work> {
    return this.firestore.works.get(this.c_id) ?? new Map();
  }

  update_name(name: string) {
    this.campaign.name = name;
  }

  invite_user(email: string) {
    const uid = this.firestore.get_user_id(email).then(
      value => this.firestore.send_campaign_invite(value, this.c_id)
    );

    this.invitee = "";

    alert("A request to join your campaign has been sent to ".concat(email))
  }

}
