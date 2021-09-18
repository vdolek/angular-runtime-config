import { TestBed } from '@angular/core/testing';

import { AngularConfigService } from './angular-config.service';

describe('AngularConfigService', () => {
  let service: AngularConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
