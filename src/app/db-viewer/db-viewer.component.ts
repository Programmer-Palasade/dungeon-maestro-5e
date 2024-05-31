import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '../shared/firestore.service';
import { Campaign, Work } from '../shared/interfaces';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-db-viewer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './db-viewer.component.html',
  styleUrl: './db-viewer.component.css'
})
export class DbViewerComponent {

  @Input() selected_campaign: string = '';
  @Input() selected_work: string = '';

  public router = inject(Router);
  public firestore = inject(FirestoreService);

  constructor() {  }

}
