import { Component, Input, inject } from '@angular/core';
import { FirestoreService } from '../shared/firestore.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Campaign, Character, Work } from '../shared/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-character-page',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatChipsModule, MatDividerModule, MatSlideToggleModule],
  templateUrl: './player-character-page.component.html',
  styleUrl: './player-character-page.component.scss'
})
export class PlayerCharacterPageComponent {
  
  public router = inject(Router);
  public firestore = inject(FirestoreService);
  
  public edit_mode = false;
  public changes_made = false;

  invitee : string = "";

  @Input({required: true}) c_id = '';
  @Input({required: true}) pc_id = '';
  
  
  constructor() {
  }

  get character(): Character {
    return this.firestore.characters.get(this.c_id)?.get(this.pc_id) ?? {active: true, info: '', name: '', identifiers: [], filterables: []};
  }

 

  get characters(): Map<string, Character> {
    return this.firestore.characters.get(this.c_id) ?? new Map();
  }


  save() {
    if (this.changes_made) {
      this.firestore.upload_character_changes(this.c_id, this.pc_id);
      this.changes_made = false;
    }
  }


  update_name(name: string) {
    this.character.name = name;
    this.changes_made = true;
  }

  update_info(info: string) {
    this.changes_made = true;
    this.character.info = info;
  }

  edit() {
    this.edit_mode = !this.edit_mode;
  }

}
