import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, doc, query, or, where, onSnapshot, getDoc, setDoc, addDoc, Query, DocumentData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Unsubscribe } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService implements OnDestroy {

  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private user_sub: Subscription;

  private readonly campaigns_col = collection(this.firestore, 'campaigns');
  private q_campaign: Unsubscribe|undefined;
  private q_works: Map<string, Unsubscribe> = new Map();

  public user: User = {uid:"", name:"", email:""};
  public campaigns: Map<string, Campaign> = new Map();
  public works: Map<string, Map<string, Work>> = new Map();

  constructor() {
    this.user_sub = this.auth.user.subscribe(u => {
      if (u == null) {
        this.user = {uid:"", name:"", email:""};
        this.unlisten_campaigns();
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
          this.listener();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.user_sub.unsubscribe();
    this.unlisten_campaigns();
  }

  private unlisten_campaigns() {
    if (this.q_campaign) {this.q_campaign();}
    this.campaigns = new Map();
    this.unlisten_works();
  }

  private unlisten_works(c_id?: string) {
    if (c_id) {
      var unsub = this.q_works.get(c_id);
      if (unsub) {unsub();}
      this.q_works.delete(c_id);
      this.works.delete(c_id);
    }
    else {
      this.q_works.forEach( (value, key) => {value();});
      this.q_works = new Map();
      this.works = new Map();
    }
  }

  private listener() {
    this.unlisten_campaigns();
    const q_c = query( this.campaigns_col, or( where('owner', '==', this.user.uid), where('users', 'array-contains', this.user.uid) ) )
    this.q_campaign = onSnapshot( q_c, snapshot => {
      snapshot.docChanges().forEach( change => {

        if (change.type == 'removed') {
          this.campaigns.delete(change.doc.id);
          this.unlisten_works(change.doc.id);
        }
        else {
          var new_campaign = change.doc.data() as Campaign;
          this.campaigns.set(change.doc.id, new_campaign);
          if (change.type == 'added') {
            this.unlisten_works(change.doc.id);
            this.works.set(change.doc.id, new Map());
            this.create_work_listener(change.doc.id);
          }
        }
      })
    });
  }

  private create_work_listener(c_id: string) {
    
    var q = query( collection(this.firestore, 'campaigns/'.concat(c_id, '/works')) );
    if (this.user.uid != this.campaigns.get(c_id)?.owner) {
      q = query(q, or( where('beholders', 'array-contains', this.user.uid), where('supervisible', '==', true) ) );
    }
    return onSnapshot(q, snapshot => { snapshot.docChanges().forEach( change => {

      if (change.type == 'removed') {
        this.works.get(c_id)?.delete(change.doc.id);
      }

      else {
        var new_work = change.doc.data() as Work;
        this.works.get(c_id)?.set(change.doc.id, new_work);
      }

    }) });

  }

  upload_campaign(c: Campaign) {
    addDoc(this.campaigns_col, c).then( new_ref => {
      this.campaigns.set(new_ref.id, c);
    } )
  }

  upload_work(c_id: string, w: Work) {
    addDoc( collection(this.firestore, 'campaigns/'.concat(c_id, '/works')), w);
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
  filterables: string[],
  identifiers: string[],
  info: string,
  name: string,
  supervisible: boolean
}
