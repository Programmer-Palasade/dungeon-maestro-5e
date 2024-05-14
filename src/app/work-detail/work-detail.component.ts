import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '../shared/firestore.service';
import { Campaign, Work } from '../shared/interfaces';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-work-detail',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatChipsModule, MatIconModule],
  templateUrl: './work-detail.component.html',
  styleUrl: './work-detail.component.scss'
})
export class WorkDetailComponent {

  public router = inject(Router);
  public firestore = inject(FirestoreService);
  public seperatorKeyCodes = [ENTER, COMMA];

  @Input({required: true}) c_id = '';
  @Input({required: true}) w_id = '';

  get campaign() {
    return this.firestore.campaigns.get(this.c_id) ?? {name: 'Undefined', owner: 'Unknown', users: []};
  }

  get work() {
    return this.firestore.works.get(this.c_id)?.get(this.w_id) ?? {beholders: [], filterables: [], identifiers: [], info: '', name: '', supervisible: false}
  }

  update_name(name: string) {
    this.work.name = name;
  }

  update_info(info: string) {
    this.work.info = info;
  }

  get_value(event: MatChipInputEvent) {
    var val = event.value ?? '';
    event.chipInput!.clear();
    return val;
  }

  edit_value(str: string, event: MatChipEditedEvent) {
    const val = event.value.trim();
    if (val) {return '';}
    return str;
  }

  add_filterable(filter: string) {
    if (filter) {
      this.work.filterables.push(filter);
      this.work.filterables.sort();
    }
  }
  
  remove_filterable(filter: string) {
    if (this.work.filterables.indexOf(filter) != -1) {
      this.work.filterables.splice( this.work.filterables.findIndex( i => { return i == filter }), 1);
    }
  }

  add_beholder(u_id: string) {
    if (u_id) {
      this.work.beholders.push(u_id);
      this.work.beholders.sort();
    }
  }

  remove_beholder(u_id: string) {
    if (this.work.beholders.indexOf(u_id) != -1) {
      this.work.beholders.splice( this.work.beholders.findIndex( i => {return i == u_id} ), 1);
    }
  }

  // Not going to be relevant yet

  add_identifier(ident: string) {
    if (ident) {
      this.work.identifiers.push(ident);
      this.work.identifiers.sort();
    }
  }

  remove_identifier(ident: string) {
    if (this.work.identifiers.indexOf(ident) != -1) {
      this.work.identifiers.splice( this.work.identifiers.findIndex( i => {return i == ident;} ), 1);
    }
  }

}
