import { TestBed } from '@angular/core/testing';

import { EmotionDetector } from './emotion-detector.service';

describe('EmotionDetectorService', () => {
  let service: EmotionDetector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmotionDetector);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
