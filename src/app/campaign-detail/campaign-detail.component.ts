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
import { MatDividerModule } from '@angular/material/divider';
import { Campaign, Work } from '../shared/interfaces';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './campaign-detail.component.html',
  styleUrl: './campaign-detail.component.scss'
})
export class CampaignDetailComponent {
  
  public router = inject(Router);
  public firestore = inject(FirestoreService);
  
  public edit_mode = false;
  public changes_made = false;

  @Input({required: true}) c_id = '';
  
  constructor() {
  }

  get campaign(): Campaign {
    return this.firestore.campaigns.get(this.c_id) ?? {name: 'Undefined', owner: 'Unknown', users: []};
  }

  get works(): Map<string, Work> {
    return this.firestore.works.get(this.c_id) ?? new Map();
  }



  async new_work() {
    var new_w: Work = {beholders: [], filterables: [], identifiers: [], info: "An extraordinarily ordinary and descriptive describation.", name: "Titilating Titular Topic Title", supervisible: false};
    const new_wid = await this.firestore.upload_new_work(this.c_id, new_w);
    // this.router.navigate(['/campaigns/'.concat(this.c_id, '/', new_wid)]);
  }

  update_name(name: string) {
    this.campaign.name = name;
    this.changes_made = true;
  }

}
