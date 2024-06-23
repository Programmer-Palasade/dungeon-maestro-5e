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
import { User } from '../shared/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatChipsModule, MatDividerModule, MatSlideToggleModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  
  public router = inject(Router);
  public firestore = inject(FirestoreService);
  
  public edit_mode = false;
  public changes_made = false;
  user!: User;


  @Input({required: true}) u_id = '';
  
  constructor() {
  }


  save() {
    if (this.changes_made) {
      this.firestore.update_user(this.user.uid);
      this.changes_made = false;
    }
  }


  update_name(name: string) {
    this.user.name = name;
    this.changes_made = true;
  }

  edit() {
    this.edit_mode = !this.edit_mode;
  }

  ngOnInit(): void {
    // Fetch user data from Firestore
    this.firestore.getUserData(this.u_id).then(data => {
      this.user = data;
      console.log(this.user); // Log the retrieved user data
    }).catch(error => {
      console.error("Error fetching user data: ", error);
    });
  }

}
