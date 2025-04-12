import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileClipComponent } from './file-clip.component';

describe('FileClipComponent', () => {
  let component: FileClipComponent;
  let fixture: ComponentFixture<FileClipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileClipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileClipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
