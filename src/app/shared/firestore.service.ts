import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, doc, query, or, where, onSnapshot, getDoc, setDoc, addDoc, getDocs, updateDoc, arrayUnion, arrayRemove, DocumentReference, deleteDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Campaign, CampaignRequest, User, Work } from './structure';
import { Unsubscribe } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService implements OnDestroy {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private user_sub: Subscription;

  private readonly campaigns_col = collection(this.firestore, 'campaigns');
  private q_user: Unsubscribe|undefined;
  private q_campaign: Unsubscribe|undefined;

  public user: User = {uid:"", name:"", email:"", requests:[],};
  private associated_users: Map<string, User> = new Map();
  
  public campaigns: Map<string, Campaign> = new Map();

  constructor() {
    this.user_sub = this.auth.user.subscribe(u => {
      if (u == null) {
        this.user = {uid:"", name:"", email:"", requests:[]};
        this.unlisten_campaigns();
      }
      else {
        const user_doc = doc(this.firestore, 'users/'.concat(u.uid));
        getDoc( user_doc ).then( snapshot => {
          this.user.uid = snapshot.id;
          if (!snapshot.exists()) {
            setDoc( user_doc, {name: u.displayName??"Unknown Adventurer", email: u.email??"", requests: []});
          }
          this.user_listener( user_doc );
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
    for (let entry of this.campaigns) {
      entry[1].unsub();
    }
    this.campaigns = new Map();
  }

  private user_listener(user_doc_ref: DocumentReference) {
    if (this.q_user) { this.q_user(); }
    this.q_user = onSnapshot(user_doc_ref, snapshot => {
      this.user = snapshot.data() as User;
      this.user.uid = snapshot.id;
    })
  }

  private listener() {
    this.unlisten_campaigns();
    const q_c = query( this.campaigns_col, or( where('owner', '==', this.user.uid), where('users', 'array-contains', this.user.uid) ) )
    this.q_campaign = onSnapshot( q_c, ss => {
      ss.docChanges().forEach( change => {
        if (change.type != 'added') {
          this.campaigns.get(change.doc.id)?.unsub;
          this.campaigns.delete(change.doc.id);
        }
        let new_c = new Campaign(change.doc.id, this.associated_users);
        new_c.update( change.doc.data() as Campaign );
        new_c.listen(this.firestore, this);
        this.campaigns.set(change.doc.id, new_c);
      });
    });
  }

  async upload_new_campaign(c: Campaign): Promise<string> {
    let new_c = { name: c.name, owner: c.owner, users: c.users };

    return addDoc(this.campaigns_col, new_c).then( new_ref => { return new_ref.id; } );
  }

  upload_campaign_changes(c_id: string) {
    let c = this.campaigns.get(c_id)??new Campaign(c_id, new Map());
    let new_c = { name: c.name, owner: c.owner, users: c.users };
    updateDoc( doc(this.campaigns_col, c_id), new_c );
  }

  async delete_campaign(c_id: string): Promise<void> {
    if (this.user.uid != this.campaigns.get(c_id)?.owner) { return; }
    return deleteDoc( doc( this.campaigns_col, c_id ) );
  }

  async upload_new_work(c_id: string, w: Work): Promise<string> {
    return addDoc( collection(this.firestore, 'campaigns/'.concat(c_id, '/works')), w).then( new_ref => { return new_ref.id; } );
  }

  upload_work_changes(c_id: string, w_id: string) {
    let w = this.campaigns.get(c_id)?.works.get(w_id) ?? { beholders: [], filterables: [], identifiers: [], info: 'Description of some sort.', name: 'New Work', supervisible: false };
    setDoc( doc(this.firestore, 'campaigns/'.concat(c_id, '/works', w_id)), w );
  }

  async delete_work(c_id: string, w_id: string): Promise<void> {
    return deleteDoc( doc( this.firestore, 'campaigns', c_id, 'works', w_id ) );
  }

  get_username(u_id: string): string {
    console.log(this.associated_users);
    return this.associated_users.get(u_id)?.name ?? 'Unknown Adventurer';
  }

  async remove_user(c_id: string, u_id: string): Promise<void> {
    if (this.campaigns.get(c_id)?.users.find( str => { return (str == u_id); } )) {
      let c = this.campaigns.get(c_id)??new Campaign('', new Map());
      return updateDoc( doc(this.campaigns_col, c_id), { users: arrayRemove( u_id ) } ).then( _ => { return deleteDoc( doc(this.firestore, 'campaigns', c_id, 'players', u_id) ); });
    }
  }

  send_campaign_invite(u_id: string, c_id: string, c_name: string): void {
    const new_request = {
      cid: c_id,
      cname: c_name
    }
    
    const data = {
      requests: arrayUnion(new_request)
    }
    updateDoc(doc(this.firestore, 'users/'.concat(u_id)), data);
  }

  async get_user_id(email:string): Promise<string> {
    const q = query(collection(this.firestore, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.id;
    } else {
      return "";
    }
  }

  get_filtered_works(c_id: string, filters: string[]): Map<string, Work> {
    let works = this.campaigns.get(c_id)?.works ?? new Map<string, Work>();
    if (filters.length == 0) {return works;}
    var filtered: Map<string, Work> = new Map();
    for (let filter of filters) {
      for (let entry of works) {
        var key = entry[0]
        var w = entry[1];
        if (w && w.filterables.find( f => { return f == filter; } ) && !filtered.has(key) ) {
          filtered.set(key, w);
        }
      }
    }
    return filtered;
  }


  accept_campaign_request(user_id: string, campaign_request: CampaignRequest) {
    this.create_new_player_character(campaign_request.cid!, user_id);

    this.delete_campaign_request(user_id, campaign_request);
  }

  delete_campaign_request(user_id: string, campaign_request: CampaignRequest) {
    const data = {
      requests: arrayRemove(campaign_request)
    }
    updateDoc(doc(this.firestore, 'users/'.concat(user_id)), data);
  }

  async create_new_player_character(campaignId: string, userId: string): Promise<void> {
    try {
      const data = {
        notes: "These are your notes!"
      }

      const characterData = {
        active: true,
        info: 'Slightly better than an NPC',
        name: 'New Character'
      };

      setDoc( doc(this.firestore, "campaigns/".concat(campaignId,'/players/'), userId), data);
  
      addDoc( collection(this.firestore, 'campaigns/'.concat(campaignId, '/players/', userId,'/characters')), characterData);
  
      console.log('User document and character document created successfully');
    } catch (error) {
      console.error('Error creating new player character: ', error);
    }
  }

  getUserData(userId: string): User {
    return this.associated_users.get(userId)??{uid: userId, name:'Unknown Adventurer', email:'', requests: []}
  }

  update_user(uid: string) {
    setDoc( doc(this.firestore, 'users', uid), this.user);
  }
}