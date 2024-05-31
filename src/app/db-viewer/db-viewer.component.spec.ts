import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbViewerComponent } from './db-viewer.component';

describe('DbViewerComponent', () => {
  let component: DbViewerComponent;
  let fixture: ComponentFixture<DbViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DbViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DbViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
