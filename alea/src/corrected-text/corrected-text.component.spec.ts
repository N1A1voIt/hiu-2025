import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectedTextComponent } from './corrected-text.component';

describe('CorrectedTextComponent', () => {
  let component: CorrectedTextComponent;
  let fixture: ComponentFixture<CorrectedTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrectedTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrectedTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
