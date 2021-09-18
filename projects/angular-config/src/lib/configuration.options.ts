export type ConfigurationUrlFactory = () => string | string[] | Promise<string> | Promise<string[]>;

export interface ConfigurationOptions {
  urlFactory?: ConfigurationUrlFactory;
}
