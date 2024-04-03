import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dungeon-maestro-app';

  auth = inject(Auth);
  firestore = inject(Firestore);
  
}
