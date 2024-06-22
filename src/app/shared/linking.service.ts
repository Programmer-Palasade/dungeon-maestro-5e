import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class LinkingService {

  private firestore = inject(FirestoreService);
  
  constructor() { }

  private isolate_segments(keyword: string, link: string, seg: LinkedStringSegment): LinkedStringSegment[] {
    if (seg.link) { return [seg]; }
    
    var output: LinkedStringSegment[] = [];
    let str = seg.str;
    let j = 0;
    while (j < str.length && str.includes(keyword, j)) {
      let i = str.indexOf(keyword, j)

      output.push({
        ind: j + seg.ind,
        str: str.substring(j, i),
        link: undefined
      });
      output.push({
        ind: i + seg.ind,
        str: keyword,
        link: link
      })

      j = i + keyword.length;
    }

    if (j < str.length) {
      output.push({
        ind: j + seg.ind,
        str: str.substring(j, str.length),
        link: undefined
      })
    }

    return output;
  }

  public generate_links(c_id: string, str: string): LinkedStringSegment[] {
    var output: LinkedStringSegment[] = [ {ind: 0, str: str, link: undefined} ];

    for ( let entry of this.firestore.identifiers.get(c_id)??[] ) {
      let new_output: LinkedStringSegment[] = [];
      let id = entry[0];
      let link = entry[1];
      output.forEach( seg => {
        new_output = new_output.concat( this.isolate_segments(id, link, seg) );
      });
      output = new_output;
    }
    
    return output;
  }

}

interface LinkedStringSegment {
  ind: number,
  str: string,
  link: string|undefined
}
