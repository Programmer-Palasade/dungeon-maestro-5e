import { TestBed } from '@angular/core/testing';

import { LinkingService } from './linking.service';

describe('LinkingService', () => {
  let service: LinkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
