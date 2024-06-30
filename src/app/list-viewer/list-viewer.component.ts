import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '../shared/firestore.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { Campaign } from '../shared/structure';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-list-viewer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatGridListModule],
  templateUrl: './list-viewer.component.html',
  styleUrl: './list-viewer.component.scss'
})
export class ListViewerComponent {

  public router = inject(Router);
  public firestore = inject(FirestoreService);

  constructor() {  }

  public async new_campaign() {
    const new_cid = await this.firestore.upload_new_campaign();
    // this.router.navigate(['/campaigns/'.concat(new_cid)]);
  }

  public async delete_campaign(c_id: string): Promise<void> {
    return this.firestore.delete_campaign(c_id);
  }

  public async leave_campaign(c_id: string): Promise<void> {
    return this.firestore.remove_user( c_id, this.firestore.user.uid??'' );
  }

}
