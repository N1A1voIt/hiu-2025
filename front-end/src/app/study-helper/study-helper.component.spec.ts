import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyHelperComponent } from './study-helper.component';

describe('StudyHelperComponent', () => {
  let component: StudyHelperComponent;
  let fixture: ComponentFixture<StudyHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyHelperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
