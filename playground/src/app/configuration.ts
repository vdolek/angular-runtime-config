import { ConfigurationBase } from 'angular-config';

export class Configuration extends ConfigurationBase {
  readonly cacheExpiration!: string;

  readonly backendUrl!: string;
  readonly webApiKey?: string;
}
