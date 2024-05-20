import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonasVixComponent } from './zonas-vix.component';

describe('ZonasVixComponent', () => {
  let component: ZonasVixComponent;
  let fixture: ComponentFixture<ZonasVixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonasVixComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ZonasVixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
