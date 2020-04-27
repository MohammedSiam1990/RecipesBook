import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapModelComponent } from './map-model.component';

describe('MapModelComponent', () => {
  let component: MapModelComponent;
  let fixture: ComponentFixture<MapModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapModelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
