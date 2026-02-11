import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TechnoDevPage } from './technodev.page';

const routes: Routes = [
  {
    path: '',
    component: TechnoDevPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechnoDevPageRoutingModule {}
