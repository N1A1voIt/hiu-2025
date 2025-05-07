import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FermerComponent } from './fermer.component';

describe('FermerComponent', () => {
  let component: FermerComponent;
  let fixture: ComponentFixture<FermerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FermerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FermerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
