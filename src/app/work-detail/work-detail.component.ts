import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '../shared/firestore.service';

@Component({
  selector: 'app-work-detail',
  standalone: true,
  imports: [],
  templateUrl: './work-detail.component.html',
  styleUrl: './work-detail.component.scss'
})
export class WorkDetailComponent {

  public router = inject(Router);
  public firestore = inject(FirestoreService);

  @Input({required: true}) c_id = '';
  @Input({required: true}) w_id = '';


}
