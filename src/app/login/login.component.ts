import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {

  private auth = inject(AuthService)
  private user_sub: Subscription;

  public user: User|undefined;
  logged_in = false;

  constructor () {
    this.user_sub = this.auth.user.subscribe((u: User | null) => {
      this.user = undefined;
      this.logged_in = this.auth.logged_in;
      if (u != null) {
        this.user = u;
      }
    });
  }

  ngOnDestroy(): void {
    this.user_sub.unsubscribe();
  }

  async login() {
    return await this.auth.login_google();
  }

  async logout() {
    return await this.auth.logout();
  }

}
