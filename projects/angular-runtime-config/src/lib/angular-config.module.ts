import { APP_INITIALIZER, Injector, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { CONFIGURATION_APP_INITIALIZER, CONFIGURATION_OPTIONS, CONFIGURATION_TYPE } from './configuration.injection-tokens';
import { HttpClientModule } from '@angular/common/http';
import { ConfigurationOptions } from './configuration.options';
import { isPromise } from './helpers';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ]
})
export class AngularConfigModule {
  public static forRoot<TConfiguration>(configurationType: Type<TConfiguration>, options?: ConfigurationOptions): ModuleWithProviders<AngularConfigModule> {
    return {
      ngModule: AngularConfigModule,
      providers: [
        ConfigurationService,
        {
          provide: CONFIGURATION_TYPE,
          useValue: configurationType
        },
        {
          provide: CONFIGURATION_OPTIONS,
          useValue: options
        },
        {
          provide: configurationType,
          useFactory: (configurationService: ConfigurationService<TConfiguration>) => configurationService.configuration,
          deps: [ConfigurationService]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: (configurationService: ConfigurationService<TConfiguration>, injector: Injector) => async () => {
            // first we initialize configurations
            await configurationService.init();

            // then we run other initializations
            const dispoAppInitializers = injector.get(CONFIGURATION_APP_INITIALIZER, []);
            const all = dispoAppInitializers.map(p => p());
            const promises = all.filter(x => isPromise(x));
            if (promises.length !== 0) {
              await Promise.all(promises);
            }
          },
          deps: [ConfigurationService, Injector],
          multi: true
        }
      ]
    };
  }
}
