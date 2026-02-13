import { Component } from '@angular/core';
import { Navigation, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  constructor(
    private router: Router,
    private module: MenuController
  ) {}

  async ngOnInit(){
    await this.module.enable(false);
  }
  async goToLogin() {
    await this.module.enable(true);
     this.router.navigateByUrl('/login');
  }
}
