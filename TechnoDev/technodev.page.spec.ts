import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TechnoDevPage } from './technodev.page';

describe('TechnoDevPage', () => {
  let component: TechnoDevPage;
  let fixture: ComponentFixture<TechnoDevPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechnoDevPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TechnoDevPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
