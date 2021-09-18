import { Inject, Injectable } from '@angular/core';
import { ConfigurationBase, ConfigurationJson } from './configuration.model';
import { PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CONFIGURATION_OPTIONS, CONFIGURATION_TYPE } from './configuration.injection-tokens';
import { ConfigurationOptions } from './configuration.options';
import { isPromise } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService<TConfiguration extends ConfigurationBase> {
  private config?: TConfiguration;

  public get configuration(): TConfiguration {
    if (this.config == null) {
      throw Error('Configuration haven\'t been initialized')
    }

    return this.config;
  }

  public constructor(
    private readonly http: HttpClient,
    private readonly platformLocation: PlatformLocation,
    @Inject(CONFIGURATION_TYPE) private readonly configurationType: { new(json: ConfigurationJson): TConfiguration },
    @Inject(CONFIGURATION_OPTIONS) private readonly configurationOptions: ConfigurationOptions | undefined
  ) {
  }

  public async init(): Promise<void> {
    const urls = await this.getUrls();
    const externalUrls = urls.map(x => this.ensureExternalUrl(x));

    const promises = externalUrls.map(url => this.http.get<ConfigurationJson>(url).toPromise());
    await Promise.all(promises);

    let config: ConfigurationJson = {};
    for (const promise of promises) {
      config = {
        ...config,
        ...await promise
      }
    }

    this.config = new this.configurationType(config);
  }

  private async getUrls(): Promise<string[]> {
    if (this.configurationOptions?.urlFactory == null) {
      return ['config.common.json'];
    }

    let result = this.configurationOptions.urlFactory();

    if (isPromise(result)) {
      result = await result;
    }

    if (typeof result === 'string') {
      return [result];
    }

    if (Array.isArray(result)) {
      return result;
    }

    throw new Error('Unexpected value returned from ConfigurationUrlFactory');
  }

  private ensureExternalUrl(url: string): string {
    if (url.indexOf('://')) {
      return url;
    }

    const baseHref = this.platformLocation.getBaseHrefFromDOM();
    const externalUrl = `${baseHref}${url}`;
    return externalUrl;
  }
}
