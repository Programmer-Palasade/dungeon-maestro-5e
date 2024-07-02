import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        
        // Mobile View
        return [
          { title: 'Characters', cols: 2, rows: 1, fontstyle: "font-size: 2.5vw", },
          { title: 'Notifications', cols: 1, rows: 1, fontstyle: "font-size: 2.5vw", },
          { title: 'Profile', cols: 1, rows: 1, fontstyle: "font-size: 2.5vw", }
        ];
      }

      // Desktop View
      return [
        { title: 'Characters', cols: 1, rows: 2, fontstyle: "font-size: 1vw" },
        { title: 'Notifications', cols: 1, rows: 1, fontstyle: "font-size: 1vw" },
        { title: 'Profile', cols: 1, rows: 1, fontstyle: "font-size: 1vw" }
      ];
    })
  );
}
