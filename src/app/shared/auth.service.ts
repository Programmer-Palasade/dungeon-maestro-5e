import { Injectable, OnDestroy, inject } from '@angular/core';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { Auth, authState, User, user, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  private auth = inject(Auth);
  private google_provider = new GoogleAuthProvider();

  public readonly user: Observable<User | null> = EMPTY;
  public subscription: Subscription|undefined;
  private readonly userDisposable: Subscription|undefined;

  public logged_in = false;

  constructor() {
    this.google_provider.addScope('email');
    this.google_provider.addScope('profile');
    if (this.auth) {
      this.user = user(this.auth);
      this.userDisposable = user(this.auth).subscribe(u => {
        this.logged_in = (u != null);
      });
    }
   }

   ngOnDestroy(): void {
     this.userDisposable?.unsubscribe();
     this.subscription?.unsubscribe();
   }

   async login_google() {
    return await signInWithPopup(this.auth, this.google_provider);
   }

   async logout() {
    return await signOut(this.auth);
   }

}
