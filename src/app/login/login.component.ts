import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, User, signOut } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance'
import { EMPTY, Observable, Subscription, map } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  public readonly user: Observable<User | null> = EMPTY;
  private readonly userDisposable: Subscription|undefined;

  logged_in = false;

  show_login_button = false;
  show_logout_button = false;

  constructor (@Optional() private auth: Auth) {
    if (auth) {
      this.user = authState(this.auth);
      this.userDisposable = authState(this.auth).pipe(
        traceUntilFirst('auth'),
        map(u => !!u)
      ).subscribe(logged_in => {
        this.logged_in = logged_in;
        this.show_login_button = !logged_in;
        this.show_logout_button = logged_in;
      });
    }
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.userDisposable) {
      this.userDisposable.unsubscribe();
    }
  }

  async login() {
    return await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async logout() {
    return await signOut(this.auth);
  }

}
