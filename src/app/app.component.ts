import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass, NgFor } from '@angular/common';
import { ZonasVixComponent } from './zonas-vix/zonas-vix.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass, NgFor,ZonasVixComponent],
  template: `
    <main [ngClass]="{'dark-mode': isDarkMode, 'light-mode': !isDarkMode}">
      <header class="form-header">
        <img style="width:200px; margin-left: 5px" src="/assets/images-logo.png" aria-hidden="true">
        <div class="header-buttons">
          <button class="header-button" (click)="DarkMode()">Dark</button>
          <button class="header-button" (click)="LightMode()">Light</button>
        </div>
      </header>
      <section class="container">
        <app-zonas-vix></app-zonas-vix>
      </section>
    </main>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Vix3';
  isDarkMode=false;
  DarkMode(){
    this.isDarkMode=true;
  }
  LightMode(){
    this.isDarkMode=false;
  }
}
