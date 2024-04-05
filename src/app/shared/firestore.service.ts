import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, or, where } from '@angular/fire/firestore';
import { Observable, Subscription, timeout } from 'rxjs';
import { AuthService } from './auth.service';

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

  private uid: string = "";
  private selected_campaign: string = "";

  constructor() {
    this.user_sub = this.auth.user.subscribe(u => {
      this.uid = u?.uid ?? "";
    })
  }

  ngOnDestroy(): void {
    this.user_sub.unsubscribe();
  }

  select_campaign(c_id: string) {
    this.selected_campaign = c_id;
  }

  async get_campaigns(): Promise<Campaign[]> {
    var campaigns: Campaign[] = [];
    if (!this.auth.logged_in) {return campaigns;}
    const campaign_data$ = collectionData(this.campaigns_col) as unknown as Observable<Campaign>;  // query here once tested
    await campaign_data$.pipe(timeout({first: 6000})).forEach( (data: Campaign) => { campaigns.push( data ) });
    return campaigns;
  }

  async get_visible_works(): Promise<Work[]> {
    var works: Work[] = [];
    if (!this.auth.logged_in) {return works;}
    const works_data$ = collectionData( query(this.works_col, where('campaigns', 'array-contains', this.selected_campaign)) ) as unknown as Observable<Work>;
    await works_data$.pipe(timeout({first: 6000})).forEach( (data: Work) => { works.push( data ) });
    return works;
  }

}


interface Campaign {
  name: string,
  owner: string,
  users: string[]
}


interface Work {
  beholders: string[],
  campaigns: string[],
  filterables: string[],
  identifiers: string[],
  info: string,
  name: string,
  supervisible: boolean
}
