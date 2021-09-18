import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AngularConfigModule } from 'angular-config';
import { Configuration } from './configuration';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    AngularConfigModule.forRoot(Configuration, {
      urlFactory: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const env = urlParams.get('env') ?? 'LOCAL';
        return ['/config/config.common.json', `/config/config.${env}.json`]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
