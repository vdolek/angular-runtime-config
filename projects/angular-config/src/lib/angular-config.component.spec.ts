import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularConfigComponent } from './angular-config.component';

describe('AngularConfigComponent', () => {
  let component: AngularConfigComponent;
  let fixture: ComponentFixture<AngularConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngularConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
