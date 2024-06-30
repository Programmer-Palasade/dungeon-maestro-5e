import { Component, Input, OnInit, inject } from '@angular/core';
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
import { User } from '../shared/structure';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatChipsModule, MatDividerModule, MatSlideToggleModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent {
  
  public router = inject(Router);
  public firestore = inject(FirestoreService);
  
  public edit_mode = false;
  public changes_made = false;
  


  @Input({required: true}) u_id = '';
  
  constructor() {
  }

  get user(){
    return this.firestore.user;
  }


  save() {
    if (this.changes_made) {
      this.firestore.update_user(this.u_id);
      this.changes_made = false;
      console.log(this.user)
    }
  }


  update_name(name: string) {
    this.user.name = name;
    console.log(this.user)
    this.changes_made = true;
  }

  edit() {
    this.edit_mode = !this.edit_mode;
  }
}