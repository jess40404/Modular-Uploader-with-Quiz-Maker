import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TechnoDevPage } from './technodev.page';

import { TechnoDevPageRoutingModule } from './technodev-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TechnoDevPageRoutingModule
  ],
  declarations: [TechnoDevPage]
})
export class TechnoDevPageModule {}
