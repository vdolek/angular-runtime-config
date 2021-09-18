import { Injector } from '@angular/core';

export type ConfigurationUrlFactory = (injector: Injector) => string | string[] | Promise<string> | Promise<string[]>;

export interface ConfigurationOptions {
  urlFactory?: ConfigurationUrlFactory;
}
