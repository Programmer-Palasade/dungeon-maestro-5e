import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, doc, query, or, where, onSnapshot, getDoc, setDoc, addDoc, getDocs, updateDoc, arrayUnion, arrayRemove, DocumentReference } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Campaign, CampaignRequest, User, Work } from './interfaces';
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
  private q_works: Map<string, Unsubscribe> = new Map();

  public user: User = {uid:"", name:"", email:"", requests:[],};
  private associated_users: Map<string, User> = new Map();
  public campaigns: Map<string, Campaign> = new Map();
  public works: Map<string, Map<string, Work>> = new Map();

  constructor() {
    this.user_sub = this.auth.user.subscribe(u => {
      if (u == null) {
        this.user = {uid:"", name:"", email:"", requests:[]};
        this.unlisten_campaigns();
      }
      else {
        const user_doc = doc(this.firestore, 'users/'.concat(u.uid));
        getDoc( user_doc ).then( snapshot => {
          if (!snapshot.exists()) {
            this.user = {uid:u.uid, name: u.displayName??"Unknown Adventurer", email: u.email??"", requests: []};
            setDoc( user_doc, {name: this.user.name, email: this.user.email, requests: this.user.requests});
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

  private user_listener(user_doc_ref: DocumentReference) {
    if (this.q_user) { this.q_user(); }
    this.q_user = onSnapshot(user_doc_ref, snapshot => {
      this.user = snapshot.data() as User;
    })
  }

  private listener() {
    this.unlisten_campaigns();
    const q_c = query( this.campaigns_col, or( where('owner', '==', this.user.uid), where('users', 'array-contains', this.user.uid) ) )
    this.q_campaign = onSnapshot( q_c, snapshot => {
      snapshot.docChanges().forEach( async change => {

        if (change.type == 'removed') {
          this.campaigns.delete(change.doc.id);
          this.unlisten_works(change.doc.id);
        }
        else {
          var new_campaign = change.doc.data() as Campaign;
          this.campaigns.set(change.doc.id, new_campaign);

          for (let u_id of new_campaign.users.concat(new_campaign.owner)) {
            const user_snap = await getDoc( doc(this.firestore, 'users/'.concat(u_id)) );
            if (user_snap.exists() && !this.associated_users.has(u_id)) {
              var user_data = user_snap.data() as User;
              user_data.uid = u_id;
              this.associated_users.set(u_id, user_data);
            }
          }

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

  async upload_new_campaign(c: Campaign): Promise<string> {
    return addDoc(this.campaigns_col, c).then( new_ref => { return new_ref.id; } );
  }

  upload_campaign_changes(c_id: string) {
    setDoc( doc(this.firestore, 'campaigns/'.concat(c_id)), this.campaigns.get(c_id) );
  }

  async upload_new_work(c_id: string, w: Work): Promise<string> {
    return addDoc( collection(this.firestore, 'campaigns/'.concat(c_id, '/works')), w).then( new_ref => { return new_ref.id; } );
  }

  upload_work_changes(c_id: string, w_id: string) {
    setDoc( doc(this.firestore, 'campaigns/'.concat(c_id, '/works', w_id)), this.works.get(c_id)?.get(w_id) );
  }

  get_username(u_id: string): string {
    return this.associated_users.get(u_id)?.name ?? 'Unknown Adventurer';
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

  accept_campaign_request(user_id: string, campaign_request: CampaignRequest) {
    const data = {
      users: arrayUnion(user_id)
    }
    updateDoc(doc(this.firestore, 'campaigns/'.concat(campaign_request.cid!)), data);
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

      setDoc( doc(this.firestore, "campaigns/".concat(campaignId,'/users/'), userId), data);
  
      addDoc( collection(this.firestore, 'campaigns/'.concat(campaignId, '/users/', userId,'/characters')), characterData);
  
      console.log('User document and character document created successfully');
    } catch (error) {
      console.error('Error creating new player character: ', error);
    }
  }
}