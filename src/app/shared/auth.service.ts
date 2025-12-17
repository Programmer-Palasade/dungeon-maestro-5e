import { Injectable, OnDestroy, Signal, signal, computed, inject, Resource, resource, ResourceRef } from '@angular/core';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Auth, User, user, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, confirmPasswordReset } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { PublicUser } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  private auth = inject(Auth);
  private firestore = inject(FirestoreService);
  private router = inject(Router);
  private google_provider = new GoogleAuthProvider();

  public readonly user: Signal<User | null | undefined>;
  private readonly userDisposable: Subscription|undefined;

  public logged_in: Signal<boolean>;

  constructor() {
    
    this.google_provider.addScope('email');
    this.google_provider.addScope('profile');

    this.user = toSignal(user(this.auth));
    this.logged_in = computed(() => Boolean(this.user()));

   }

   ngOnDestroy(): void {
     this.userDisposable?.unsubscribe();
   }

   async login_email(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password)
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(error);
    });;
   }

   async login_google() {
    return await signInWithPopup(this.auth, this.google_provider);
   }

   async signup_email(email: string, password: string) {
    return await createUserWithEmailAndPassword(this.auth, email, password)
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(error);
    });
   }

   async logout() {
    return await signOut(this.auth);
   }

   async passwordReset(email: string){
    return await sendPasswordResetEmail(this.auth, email)
  }
}
