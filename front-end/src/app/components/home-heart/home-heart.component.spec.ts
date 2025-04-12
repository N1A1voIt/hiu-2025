import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeHeartComponent } from './home-heart.component';

describe('HomeHeartComponent', () => {
  let component: HomeHeartComponent;
  let fixture: ComponentFixture<HomeHeartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHeartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeHeartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
