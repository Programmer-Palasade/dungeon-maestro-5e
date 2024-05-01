import { Injectable, OnDestroy, inject } from '@angular/core';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { Auth, User, user, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  private auth = inject(Auth);
  private router = inject(Router);
  private google_provider = new GoogleAuthProvider();

  public readonly user: Observable<User | null> = EMPTY;
  private readonly userDisposable: Subscription|undefined;

  public logged_in = false;

  constructor() {
    this.google_provider.addScope('email');
    this.google_provider.addScope('profile');
    if (this.auth) {
      this.user = user(this.auth);
      this.userDisposable = this.user.subscribe(u => {
        this.logged_in = (u != null);
        if (!this.logged_in) {
          this.router.navigate(['login']);
        }
      });
    }
   }

   ngOnDestroy(): void {
     this.userDisposable?.unsubscribe();
   }

   async login_google() {
    return await signInWithPopup(this.auth, this.google_provider);
   }

   async logout() {
    return await signOut(this.auth);
   }

}
