import { Component, Input, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { User } from '../shared/structure';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class HomeDashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);
  public router = inject(Router);

  @Input({required: true}) u_id = "";

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        
        // Mobile View
        return [
          { title: 'Campaigns', cols: 2, rows: 1, class: "dashboard-campaign-card-m", click: '/campaigns' },
          { title: 'Characters', cols: 2, rows: 1, class: "dashboard-character-card-m", click: '/home' },
          { title: 'Notifications', cols: 1, rows: 1, class: "dashboard-notification-card-m", click: '/notifications' },
          { title: 'Profile', cols: 1, rows: 1, class: "dashboard-profile-card-m", click: '/user/'.concat(this.u_id)}
        ];
      }

      // Desktop View
      return [
        { title: 'Campaigns', cols: 2, rows: 1, class: "dashboard-campaign-card", click: '/campaigns' },
        { title: 'Characters', cols: 1, rows: 2, class: "dashboard-character-card", click: '/home'},
        { title: 'Notifications', cols: 1, rows: 1, class: "dashboard-notification-card", click: '/notifications' },
        { title: 'Profile', cols: 1, rows: 1, class: "dashboard-profile-card", click: '/user/'.concat(this.u_id) }
      ];
    })
  );
}
