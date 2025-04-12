import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBtnComponent } from './action-btn.component';

describe('ActionBtnComponent', () => {
  let component: ActionBtnComponent;
  let fixture: ComponentFixture<ActionBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
