import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './shared/auth.service';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { FirestoreService } from './shared/firestore.service';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatBadgeModule, MatDividerModule, MatIconModule, MatSidenavModule, MatGridListModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dungeon-maestro-5e';
  router = inject(Router);
  auth = inject(AuthService);
  firestore = inject(FirestoreService);


  public async logout() {
    await this.auth.logout();
    this.router.navigate(['login']);
  }

  @ViewChild('sidenav') sidenav!: MatSidenav;
  backdropVisible = false;

  toggleSidenav() {
      this.sidenav.toggle();
  }

  closeSidenav() {
      this.sidenav.close();
      this.backdropVisible = false;
  }

}
