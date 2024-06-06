import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FirestoreService } from '../shared/firestore.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatGridListModule],
  templateUrl: './user-notifications.component.html',
  styleUrl: './user-notifications.component.scss'
})
export class UserNotificationsComponent {
  public firestore = inject(FirestoreService);
}
