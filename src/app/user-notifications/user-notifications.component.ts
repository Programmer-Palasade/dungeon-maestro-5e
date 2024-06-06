import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [MatGridListModule],
  templateUrl: './user-notifications.component.html',
  styleUrl: './user-notifications.component.scss'
})
export class UserNotificationsComponent {

}
