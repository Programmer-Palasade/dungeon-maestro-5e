import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  public auth = inject(AuthService);
  public router = inject(Router);

  constructor () { }

  async login() {
    return await this.auth.login_google();
  }

  async logout() {
    return await this.auth.logout();
  }

}
