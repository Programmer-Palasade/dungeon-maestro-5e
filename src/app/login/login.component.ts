import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public auth = inject(AuthService);
  public router = inject(Router);

  constructor () { }

  email:string = "";
  password:string = "";
  confirmPassword:string = "";
  onLogin: boolean = true;
  onPasswordReset: boolean = false;

  async login() {
    return await this.auth.login_google();
  }

  async sendResetEmail(email: string) {
    this.email = "";
    this.toggleRecoverPassword();
    return await this.auth.passwordReset(email);
  }

  async login_email(email: string, password: string){
    return await this.auth.login_email(email, password);
  }

  async signup(email: string, password: string){
    return await this.auth.signup_email(email, password);
  }

  hasInvalidInfo(): boolean {
    if(this.password === ""){
      return true;
    }
    else if (this.password !== this.confirmPassword){
      return true;
    }
    else {
      return false;
    }
  }

  toggleLogin(){
    this.email = "";
    this.password = "";
    this.confirmPassword = "";
    this.onLogin = !this.onLogin;
  }

  toggleRecoverPassword(){
    this.password = "";
    this.confirmPassword = "";
    this.onLogin = !this.onLogin;
    this.onPasswordReset = !this.onPasswordReset;
  }

}
function toggleRecoverPassword() {
  throw new Error('Function not implemented.');
}

