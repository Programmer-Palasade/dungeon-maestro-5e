import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, doc, query, or, where, onSnapshot, getDoc, setDoc, addDoc } from '@angular/fire/firestore';
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
  private readonly works_col = collection(this.firestore, 'works');
  private q_works: Unsubscribe|undefined;

  public user: User = {uid:"", name:"", email:""};
  public campaigns: Map<string, Campaign> = new Map();
  public selected_campaign: string = "";
  private all_works: Map<string, Work> = new Map();
  public works: Map<string, Work> = new Map();

  constructor() {
    this.user_sub = this.auth.user.subscribe(u => {
      if (u == null) {
        this.user = {uid:"", name:"", email:""};
        this.unlisten_campaign();
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
          this.works_listener();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.user_sub.unsubscribe();
    this.unlisten_campaign();
  }

  unlisten_campaign() {
    if (this.q_campaign) {this.q_campaign();}
    this.campaigns = new Map();
    this.select_campaign("");
    this.unlisten_works();
  }

  unlisten_works() {
    if (this.q_works) {this.q_works();}
    this.all_works = new Map();
    this.select_campaign(this.selected_campaign);
  }

  campaign_listener() {
    this.unlisten_campaign();
    this.q_campaign = onSnapshot( query( this.campaigns_col, or( where('owner', '==', this.user.uid), where('users', 'array-contains', this.user.uid) ) ), snapshot => {
      snapshot.forEach( c => {
          this.campaigns.set(c.id, c.data() as Campaign);
      })
    });
  }

  works_listener() {
    this.unlisten_works();
    var q = this.get_work_query();
    this.q_works = onSnapshot( q, snapshot => {
      snapshot.forEach( w => {
        this.all_works.set(w.id, w.data() as Work);
      });
      this.select_campaign(this.selected_campaign);
    } );
  }

  private get_work_query() {
    var works = query(this.works_col);
    if (this.campaigns.get(this.selected_campaign)?.owner != this.user.uid) {works = query(works, or(where('beholders', 'array-contains', this.user.uid), where('supervisible', '==', true)));}
    this.campaigns.forEach( c => {
      var ind = 0
      if (c.works.length <= 30) {
        works = query(works, where('__name__', 'in', c.works))
      }
      else {
        while (ind < c.works.length) {
          if (c.works.length - ind <= 30) {query(works, where('__name__', 'in', c.works.slice(ind)));}
          else {query(works, where('__name__', 'in', c.works.slice(ind, ind+30)));}
          ind += 30;
        }
      }
    })
    return works;
  }

  select_campaign(c_id: string) {
    if (this.campaigns.has(c_id)) {
      this.selected_campaign = c_id;
      this.works = new Map();
      this.campaigns.get(c_id)?.works.forEach( w_id => {
        if (this.all_works.has(w_id)) {this.works.set(w_id, this.all_works.get(w_id)??{beholders:[], filterables:[], identifiers:[], info:"THIS SHOULD NOT HAPPEN", name:"Impossible", supervisible:true});}
      });
    }
    else {
      this.selected_campaign = "";
      this.works = new Map();
    }
  }

  upload_campaign(c: Campaign) {
    addDoc(this.campaigns_col, c).then( new_ref => {
      this.campaigns.set(new_ref.id, c);
    } )
  }

  upload_work(w: Work) {
    addDoc( this.works_col, w).then( new_ref => {
      this.all_works.set(new_ref.id, w);
    })
  }

}


export interface Campaign {
  name: string,
  owner: string,
  users: string[],
  works: string[]
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
