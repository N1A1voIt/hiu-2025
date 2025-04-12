import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizableRoomComponent } from './customizable-room.component';

describe('CustomizableRoomComponent', () => {
  let component: CustomizableRoomComponent;
  let fixture: ComponentFixture<CustomizableRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomizableRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomizableRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
