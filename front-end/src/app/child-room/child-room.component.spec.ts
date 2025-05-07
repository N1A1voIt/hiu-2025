import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildRoomComponent } from './child-room.component';

describe('ChildRoomComponent', () => {
  let component: ChildRoomComponent;
  let fixture: ComponentFixture<ChildRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
