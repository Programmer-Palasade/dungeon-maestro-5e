import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, and, or, where, onSnapshot, getDoc, addDoc, CollectionReference, QueryFieldFilterConstraint, QueryCompositeFilterConstraint, setDoc } from '@angular/fire/firestore';
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
  private q_campaign: Unsubscribe|undefined;
  private readonly works_col = collection(this.firestore, 'works');
  private q_works: Unsubscribe|undefined;

  public user: User = {uid:"", name:"", email:""};
  public campaigns: Map<string, Campaign> = new Map();
  private selected_campaign: string = "";
  public works: Map<string, Work> = new Map();

  constructor() {
    this.user_sub = this.auth.user.subscribe(u => {
      if (u == null) {
        this.user = {uid:"", name:"", email:""};
        if (this.q_campaign) {this.q_campaign();}
        this.campaigns = new Map();
        if (this.q_works) {this.q_works();}
        this.works = new Map();
      }
      else {
        const user_doc = doc(this.firestore, 'users/'.concat(u.uid));
        getDoc( user_doc ).then( snapshot => {
          if (snapshot.exists()) {
            this.user = {uid: u.uid, name: snapshot.get('name'), email: snapshot.get('email')};
          }
          else {
            this.user = {uid:u.uid, name: u.displayName??"Unknown Adventurer", email: u.email??"" };
            setDoc( user_doc, {name: this.user.name, email: this.user.email});
          }
          this.campaign_listener();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.user_sub.unsubscribe();
    if (this.q_campaign) {this.q_campaign();}
    this.campaigns = new Map();
    if (this.q_works) {this.q_works();}
    this.works = new Map();
  }

  campaign_listener() {
    if (this.q_campaign) {this.q_campaign();}
    this.campaigns = new Map();
    this.q_campaign = onSnapshot( query( this.campaigns_col, or( where('owner', '==', this.user.uid), where('users', 'array-contains', this.user.uid) ) ), snapshot => {
      snapshot.forEach( c => {
          this.campaigns.set(c.id, c.data() as Campaign);
      })
    });
  }

  works_listener() {
    if (this.q_works) {this.q_works();}
    this.works = new Map();
    var q = query( this.works_col, where( 'campaigns', 'array-contains', this.selected_campaign ) );
    if (this.campaigns.get(this.selected_campaign)?.owner != this.user.uid) {
      q = query( this.works_col, and( where('campaigns', 'array-contains', this.selected_campaign), or( where('supervisible', '==', true), where('beholders', 'array-contains', this.user.uid) ) ) );
    }
    this.q_works = onSnapshot( q, snapshot => {
      snapshot.forEach( w => {
        this.works.set(w.id, w.data() as Work)
      })
    } )
  }

  select_campaign(c_id: string) {
    if (this.campaigns.has(c_id)) {
      this.selected_campaign = c_id;
      this.works_listener();
    }
  }

}


export interface Campaign {
  name: string,
  owner: string,
  users: string[],
}


export interface User {
  uid: string,
  name: string,
  email: string
}


export interface Work {
  beholders: string[],
  campaigns: string[],
  filterables: string[],
  identifiers: string[],
  info: string,
  name: string,
  supervisible: boolean
}
