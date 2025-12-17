import { Injectable, OnDestroy, inject, Signal, computed, Resource, resource, ResourceLoaderParams, ResourceStreamItem, signal, Query, WritableSignal, effect } from '@angular/core';
import { Firestore, collection, collectionChanges, doc, query, or, where, onSnapshot, getDoc, setDoc, addDoc, getDocs, updateDoc, arrayUnion, arrayRemove, DocumentReference, deleteDoc, docData, DocumentData, documentId, FieldPath } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { PublicUser } from './interfaces';
import { Campaign, CampaignRequest, Work } from './structure';
import { Unsubscribe, User, user } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService implements OnDestroy {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private readonly campaigns_col = collection(this.firestore, 'campaigns');
  private q_user: Unsubscribe|undefined;
  private q_campaign: Unsubscribe|undefined;

  public current_user: Signal<PublicUser>;
  public users: Signal<Map<string, PublicUser>>;
  private uid_list: WritableSignal<string[]> = signal([]);
  private readonly null_user: PublicUser = {uid: "null", name: "An Unknown Adventurer", email: "", requests: []};
  private users_map: Map<string, PublicUser> = new Map();
  
  private c_map: Map<string, Campaign> = new Map();
  public campaigns: Signal< Map<string, Campaign> >;

  constructor() {

    const user_changes = toSignal(
      collectionChanges(
        query(collection(this.firestore, 'users'), 
              where(documentId(), 'in', this.uid_list()) )
      )
    );
    this.users = computed( () => {
      user_changes()?.forEach( docChange => {
        var uid = docChange.doc.id;
        if (docChange.type == 'added' ||
            docChange.type == 'modified') this.users_map.set(uid, docChange.doc.data() as PublicUser);
        else this.users_map.delete(uid);
      });
      return this.users_map;
    });

    effect( async () => {
      if (this.auth.logged_in()) {
        const u = this.auth.user();
        const u_doc: DocumentReference = doc(this.firestore, 'users/'.concat(u?.uid??"null"))
        if (!await getDoc( u_doc ).then(data => data.exists())) {
          setDoc( u_doc, {name: u?.displayName, email: u?.email, requests: []} );
        }
        this.includeUser(this.auth.user()?.uid??"null");
      }
      else {
        this.uid_list.set([]);
      }
    });

    this.current_user = computed( () => {
      return this.users_map.get(this.auth.user()?.uid??"null")??this.null_user;
    });
    
    const docChanges = toSignal( 
      collectionChanges( 
        query( this.campaigns_col, 
          or( 
            where('owner', '==', this.current_user().uid),
            where('users', 'array-contains', this.current_user().uid)
          )
        )
      )
    );
    this.campaigns = computed( () => {
      docChanges()?.forEach( docChange => {
        const d_id = docChange.doc.id;
        if (docChange.type == 'added') {
          this.c_map.set( d_id, docChange.doc.data() as Campaign );
        }
        else if (docChange.type == 'modified') {
          this.c_map.set( d_id, this.c_map.get(d_id)?.update(docChange.doc.data() as Campaign)??docChange.doc.data() as Campaign );
        }
        else {
          this.c_map.delete(d_id);
        }
      });
      return this.c_map;
    });
  }

  ngOnDestroy(): void {
  }

  public docObservable(path: string) {
    return docData(doc(this.firestore, path));
  }

  public includeUser(uid: string) {
    if (!this.uid_list().includes(uid)) {
      this.uid_list.update( l => {
        l.push(uid);
        return l;
      });
    }
  }

  public excludeUser(uid: string) {
    if (this.uid_list().includes(uid)) {
      this.uid_list.update( l => {
        l.splice( l.indexOf(uid), 1);
        return l; 
      });
    }
  }

  async updateUserData(upd: PublicUser) {
    if (this.auth.logged_in()) {
      setDoc(doc(this.firestore, 'users/'.concat(this.current_user().uid??"null")),
        {name: upd.name, email: upd.email, requests: upd.requests});
    }
  }



  /**
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

  async upload_new_campaign(): Promise<string> {
    console.log('new campaign created, and owner set as', this.user.uid??'default');
    let new_c = { name: "New Adventure", owner: this.user.uid??'An Unknown Dungeon Architect', info: "A (mysterious/amazing/dramatic/heartwarming/comical/depressing) (adventure/quest/dungeon crawl/legend/business? venture)", users: [] }

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
    setDoc( doc(this.firestore, 'campaigns/'.concat(c_id, '/works/', w_id)), w );
  }

  async delete_work(c_id: string, w_id: string): Promise<void> {
    return deleteDoc( doc( this.firestore, 'campaigns', c_id, 'works', w_id ) );
  }

  get_username(u_id: string): string {
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

    this.add_new_user(campaign_request.cid!, user_id);

    this.create_new_player_character(campaign_request.cid!, user_id);

    this.delete_campaign_request(user_id, campaign_request);
  }

  delete_campaign_request(user_id: string, campaign_request: CampaignRequest) {
    const data = {
      requests: arrayRemove(campaign_request)
    }
    updateDoc(doc(this.firestore, 'users/'.concat(user_id)), data);
  }

  async add_new_user(campaignId: string, userId: string): Promise<void> {
    const data = {
      users: arrayUnion(userId)
    }
    updateDoc( doc(this.campaigns_col, campaignId), data );
  }

  async create_new_player_character(campaignId: string, userId: string): Promise<void> {
    try {
      const data = {
        name: "New Player",
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
  */
}