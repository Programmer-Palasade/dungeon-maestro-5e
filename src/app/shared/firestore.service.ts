import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, or, where, onSnapshot, getDoc } from '@angular/fire/firestore';
import { Observable, Subscription, timeout } from 'rxjs';
import { AuthService } from './auth.service';
import { Unsubscribe } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService implements OnDestroy {

  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private user_sub: Subscription;

  private readonly users_col = collection(this.firestore, 'users');
  private readonly campaigns_col = collection(this.firestore, 'campaigns');
  private readonly works_col = collection(this.firestore, 'works');

  public user: User = {uid:"", name:"", email:""};
  public campaigns: Campaign[] = [];
  private selected_campaign: string = "";
  public works: Work[] = [];

  private listeners: Unsubscribe[] = [];

  constructor() {
    this.user_sub = this.auth.user.subscribe(u => {
      if (u == null) {this.user = {uid:"", name:"", email:""}}
      else {
        getDoc( doc(this.firestore, 'users/'.concat(u.uid) ) ).then( snapshot => {
          this.user = {uid: u.uid, name: snapshot.get('name'), email: snapshot.get('email')}
        })
      }
    });
    // ADJUST THE QUERY HERE TO LOAD BASED ON CORRECT USER
    this.listeners.push( onSnapshot( query( this.campaigns_col, or( where('owner', '==', 'test_admin'), where('users', 'array-contains', this.user.uid) ) ), snapshot => {
      snapshot.forEach( c => {
        var look_ahead = this.campaigns.filter( element => { return element.doc_id == c.id } );
        if (look_ahead.length > 0) {
          look_ahead[0].name = c.get('name');
          look_ahead[0].owner = c.get('owner');
          look_ahead[0].users = c.get('users');
        }
        else {
          var new_c = c.data() as Campaign;
          new_c.doc_id = c.id;
          this.campaigns.push(new_c);
        }
      } )
    } ) )
  }

  ngOnDestroy(): void {
    this.user_sub.unsubscribe();
    this.listeners.forEach( unsub => { unsub(); });
  }

  select_campaign(c_id: string) {
    this.selected_campaign = c_id;
  }

}


export interface Campaign {
  doc_id?: string,
  name: string,
  owner: string,
  users: string[],
}


export interface User {
  uid?: string,
  name: string,
  email: string
}


export interface Work {
  doc_id?: string,
  beholders: string[],
  campaigns: string[],
  filterables: string[],
  identifiers: string[],
  info: string,
  name: string,
  supervisible: boolean
}
