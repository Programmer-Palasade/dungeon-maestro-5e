import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '../shared/firestore.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-list-viewer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatGridListModule],
  templateUrl: './list-viewer.component.html',
  styleUrl: './list-viewer.component.scss'
})
export class ListViewerComponent {

  public router = inject(Router);
  public firestore = inject(FirestoreService);

  constructor() {  }

}
