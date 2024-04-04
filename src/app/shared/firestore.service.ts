import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, docData } from '@angular/fire/firestore';
import { Observable, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore = inject(Firestore);
  private readonly works_col = collection(this.firestore, 'works')

  constructor() { }

  get_visible(uid: string): Work[] {
    var works: Work[] = [];
    const works_data = collectionData(this.works_col) as unknown as Observable<Work>;
    works_data.pipe(timeout({first: 5000})).forEach( (data: Work) => {
      works.push( data )
    });
    return works;
  }

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
