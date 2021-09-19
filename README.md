# Angular Runtime Configuration

[![github version](https://img.shields.io/github/package-json/v/vdolek/angular-runtime-config/master?label=github)](https://github.com/vdolek/angular-runtime-config)
[![npm version](https://img.shields.io/npm/v/angular-runtime-config)](https://www.npmjs.com/package/angular-runtime-config)
[![build status](https://img.shields.io/github/workflow/status/vdolek/angular-runtime-config/CI/master)](https://github.com/vdolek/angular-runtime-config/actions?query=workflow%3ACI)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/vdolek/angular-runtime-config)](https://snyk.io/test/github/vdolek/angular-runtime-config)

TL;DR, Angular support for one deployment package for different environments with specific configurations.

Angular framework lacks support for runtime configuration management. Build-in environments structure is compiled
with the deployment package, so you have to build the application for every environment. It doesn't allow you
to build one package which could be deployed to different environments.

This library brings support for loading configuration in runtime. It also allows you to
load multiple configuration files and merge them into one configuration object.

## Playground

[StackBlitz playground](https://stackblitz.com/edit/angular-runtime-config-playground)

[Playground project](https://github.com/vdolek/angular-runtime-config/tree/master/playground)

## How does it work?

At the initialisation phase of Angular app request for JSON configuration file is made. The content of the file
is saved into configuration object that is resolvable by dependency injection.

By default, it looks for `config.json` file at the app root. But it can be changed to look for any other file,
or even for multiple files that will be merged into one configuration object. This way you can have some configuration
parameters shared between all environments and override only the specific parameters.

It can be as simple as:

```typescript
@Injectable({...})
export class SomeService {
  constructor(
    private readonly config: Configuration, // <-- look here
    private readonly http: HttpClient
  ) {}
  
  async getData(): Promise<any> {
    const baseUrl = this.config.apiUrl; // <-- look here
    var data = await this.http.get(apiUrl + '/data').toPromise();
    return data;
  }
}
```

## Basic usage

1. Install `angular-runtime-config` library.
   ```shell
   $ npm install angular-runtime-config
   ```

1. Create configuration class definition with your configuration parameters.
   
    ```typescript
    export class Configuration {
      readonly apiUrl!: string; // only example
      readonly apiKey?: string; // only example
      // add some other configuration parameters
    }
    ```

1. Import `AngularRuntimeConfigModule` in your `AppModule`. You have to specify configuration class from previous step 
   as a parameter for `forRoot()` method. 

    ```typescript
    import { AngularRuntimeConfigModule } from 'angular-runtime-config';
    
    @NgModule({
      declarations: [
        AppComponent
      ],
      imports: [
        ...,
    
        // specify AngularRuntimeConfigModule as an import
        AngularRuntimeConfigModule.forRoot(Configuration)
      ],
      providers: [],
      bootstrap: [ AppComponent ]
    })
    export class AppModule { }
    ```

1. Create `config.json` file at the root of your app.

   ```javascript
   {
     "apiUrl": "some url",
     "apiKey": "some key"
   }
   ```
   
1. Add `config.json` file to assets in `angular.json`

   ```javascript
   ...
   "assets": [
     "src/favicon.ico",
     "src/assets",
     "src/config.json" // <-- this line
   ],
   ...
   ```

1. Request your configuration class in any injection context.

   ```typescript
   @Injectable({...})
   export class SomeService {
     constructor(private readonly config: Configuration) {}
   }
   ```
   
With this basic usage it is the responsibility of deployment to change `config.json` appropriately.

If you want to make your deployment simple you can make the decision what configuration file to
load in runtime based on some information (for example current app URL or a query string).
For that look at the code examples next.

## Specifying which configuration file/files to load

### Load specific configuration file

Configuration file URL can be absolute or relative to app root url.

```typescript
AngularRuntimeConfigModule.forRoot(Configuration, {
  urlFactory: () => 'config/config.json'
})
```

### Load multiple configuration files

When using multiple configuration files, files are merged in returned array order.

```typescript
AngularRuntimeConfigModule.forRoot(Configuration, {
  urlFactory: () => [ 'config/config.common.json', 'config/config.DEV.json' ]
})
```

Don't forget to add all configuration files to assets in `angular.json`. You can also add whole folder.

```javascript
...
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/config" // <-- adds whole folder
],
...
```

### Load multiple configuration files based on environment

```typescript
AngularRuntimeConfigModule.forRoot(Configuration, {
  urlFactory: () => {
    const env = getEnvironment(); // your defined method that provides current environment name
    return ['/config/config.common.json', `/config/config.${env}.json`]
  }
})
```

Example of `getEnvironment()` function: (it can be implemented in any way)

```typescript
function getEnvironment(): string {
  switch (location.origin) {
    case 'http://localhost': return 'LOCAL';
    case 'https://dev.example.com': return 'DEV';
    case 'https://int.example.com': return 'INT';
    case 'https://www.example.com': return 'PROD';
    default: throw Error('Unexpected base URL');
  }
}
```

### Load multiple configuration files based on environment using injector

If you need to resolve some dependencies in order to determine url of configuration files, you can use Angular Injector.

```typescript
AngularRuntimeConfigModule.forRoot(Configuration, {
  urlFactory: (injector: Injector) => {
    const env = getEnvironment(injector); // your defined method that provides current environment name
    return ['/config/config.common.json', `/config/config.${env}.json`]
  }
})
```

### Async load multiple configuration files based on environment using injector

It is even possible to implement make `urlFactory` asynchronous.

```typescript
AngularRuntimeConfigModule.forRoot(Configuration, {
  urlFactory: async (injector: Injector) => {
    const env = await getEnvironment(injector); // your defined method that provides current environment name
    return ['/config/config.common.json', `/config/config.${env}.json`]
  }
})
```

## Problems and solutions

1. Injection of `Configuration` class does not work in `APP_INITIALIZERS` (error: `Configuration hasn't been initialized`).
   - This is because configuration is also loaded within `APP_INITIALIZERS` so other `APP_INITIALIZERS` cannot
     depend on `Configuration` class. The solution is to replace `APP_INITIALIZERS` with `CONFIGURATION_APP_INITIALIZERS`
     for initializers that depend (even transitively) on `Configuration` class.
     
     ```typescript
     {
       provide: CONFIGURATION_APP_INITIALIZER,
       useFactory: (config: Configuration) => () => ...,
       deps: [Configuration],
       multi: true
     }
     ```

## License

MIT © [Martin Volek](mailto:martin@vdolek.cz)
