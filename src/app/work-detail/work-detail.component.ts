import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FirestoreService } from '../shared/firestore.service';
import { Campaign, Work } from '../shared/structure';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LinkingService } from '../shared/linking.service';

@Component({
  selector: 'app-work-detail',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatChipsModule, MatIconModule, MatDividerModule, MatSlideToggleModule],
  templateUrl: './work-detail.component.html',
  styleUrl: './work-detail.component.scss'
})
export class WorkDetailComponent {

  public router = inject(Router);
  public firestore = inject(FirestoreService);
  public linker = inject(LinkingService);
  public seperatorKeyCodes = [ENTER, COMMA];

  public edit_mode = false;
  public changes_made = false;

  @Input({required: true}) c_id = '';
  @Input({required: true}) w_id = '';

  get campaign(): Campaign {
    return this.firestore.campaigns.get(this.c_id) ?? new Campaign('', new Map());
  }

  get work(): Work {
    return this.firestore.campaigns.get(this.c_id)?.works?.get(this.w_id) ?? {beholders: [], filterables: [], identifiers: [], info: '', name: '', supervisible: false}
  }

  async save() {
    if (this.changes_made) {
      this.changes_made = false;
      this.firestore.upload_work_changes(this.c_id, this.w_id);
      // SAVE CONFIRMATION POPUP
    }
  }

  edit() {
    this.edit_mode = !this.edit_mode;
  }

  update_name(name: string) {
    this.changes_made = true;
    this.work.name = name;
  }

  update_info(info: string) {
    this.changes_made = true;
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
      this.changes_made = true;
      this.work.filterables.push(filter);
      this.work.filterables.sort();
    }
  }
  
  remove_filterable(filter: string) {
    if (this.work.filterables.indexOf(filter) != -1) {
      this.changes_made = true;
      this.work.filterables.splice( this.work.filterables.findIndex( i => { return i == filter }), 1);
    }
  }

  add_beholder(u_id: string) {
    if (u_id) {
      this.changes_made = true;
      this.work.beholders.push(u_id);
      this.work.beholders.sort();
    }
  }

  remove_beholder(u_id: string) {
    if (this.work.beholders.indexOf(u_id) != -1) {
      this.changes_made = true;
      this.work.beholders.splice( this.work.beholders.findIndex( i => {return i == u_id} ), 1);
    }
  }

  add_identifier(ident: string) {
    if (ident) {
      this.changes_made = true;
      this.work.identifiers.push(ident);
      this.work.identifiers.sort();
    }
  }

  remove_identifier(ident: string) {
    if (this.work.identifiers.indexOf(ident) != -1) {
      this.changes_made = true;
      this.work.identifiers.splice( this.work.identifiers.findIndex( i => {return i == ident;} ), 1);
    }
  }

}
