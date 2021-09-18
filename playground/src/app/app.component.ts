import { Component } from '@angular/core';
import { Configuration } from './configuration';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public readonly config: Configuration) {
  }
}
