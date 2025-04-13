import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaToCorrectComponent } from './textarea-to-correct.component';

describe('TextareaToCorrectComponent', () => {
  let component: TextareaToCorrectComponent;
  let fixture: ComponentFixture<TextareaToCorrectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaToCorrectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextareaToCorrectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
