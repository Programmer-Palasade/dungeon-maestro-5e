import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCharacterPageComponent } from './player-character-page.component';

describe('PlayerCharacterPageComponent', () => {
  let component: PlayerCharacterPageComponent;
  let fixture: ComponentFixture<PlayerCharacterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerCharacterPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerCharacterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
