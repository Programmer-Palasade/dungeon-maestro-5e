import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public auth = inject(AuthService);
  public router = inject(Router);

  constructor () { }

  async login() {
    return await this.auth.login_google();
  }

  recoverPassword(){
    console.log("Hi");
  }

}
