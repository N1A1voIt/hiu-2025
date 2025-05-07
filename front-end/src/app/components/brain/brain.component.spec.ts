import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrainComponent } from './brain.component';

describe('BrainComponent', () => {
  let component: BrainComponent;
  let fixture: ComponentFixture<BrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
