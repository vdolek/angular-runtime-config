# Angular Config

[![github version](https://img.shields.io/github/package-json/v/vdolek/angular-config/master?label=github)](https://github.com/vdolek/angular-config)
[![npm version](https://img.shields.io/npm/v/angular-config)](https://www.npmjs.com/package/angular-config)
[![build status](https://img.shields.io/github/workflow/status/vdolek/angular-config/CI/master)](https://github.com/vdolek/angular-config/actions?query=workflow%3ACI)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/vdolek/angular-config)](https://snyk.io/test/github/vdolek/angular-config)

Are you tired of default compiled-in environments in Angular apps? Do you want to have one package that you can
move between your environments without needing to compile it every time?

**`angular-config` library is here just for that!**

## Playground

[StackBlitz playground](https://stackblitz.com/edit/angular-config-playground)

[Playground project](https://github.com/vdolek/angular-config/tree/master/playground)

## How does it work?

At the initialisation phase of Angular app request for JSON configuration file is made. The content of the file
is saved for later use. The configuration parameters are the resolvable by dependency injection.

By default, it looks for `config.json` file at the app root. But it can be changed to look for any other file,
or even for multiple files that will be merged into one configuration. This way you can have some configuration
parameters shared between all environments and override only the different ones.

It can be as simple as:

```typescript
@Injectable({...})
export class SomeService {
  constructor(
    private readonly config: Configuration,
    private readonly http: HttpClient
  ) {}
  
  async getData(): Promise<any> {
    const baseUrl = this.config.apiUrl;
    var data = await this.http.get(apiUrl + '/data').toPromise();
    return data;
  }
}
```

## Basic usage

1. Install angular-config library.
   ```shell
   $ npm install angular-config
   ```

1. Create configuration class definition.
   
    ```typescript
    export class Configuration {
      readonly apiUrl!: string;
      readonly apiKey?: string;
      // some other configuration parameters
    }
    ```

1. Import `AngularConfigModule` in your `AppModule`. You have to specify configuration class from previous step 
   as a parameter for `forRoot()` method. 

    ```typescript
    import { AngularConfigModule } from 'angular-config';
    
    @NgModule({
      declarations: [
        AppComponent
      ],
      imports: [
        ...,
    
        // Specify AngularConfigModule as an import
        AngularConfigModule.forRoot(Configuration)
      ],
      providers: [],
      bootstrap: [ AppComponent ]
    })
    export class AppModule { }
    ```

1. Create `config.json` file at the root of your app.

   ```json
   {
     "apiUrl": "some url",
     "apiKey": "some key"
   }
   ```
   
1. Add `config.json` file to assets in `angular.json`

   ```json
   ...
   "assets": [
     "src/favicon.ico",
     "src/assets",
     "config.json"
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
For that read further.

## Specifying which configuration file to load

### Only change loaded configuration file
```typescript
AngularConfigModule.forRoot(Configuration, {
  urlFactory: () => 'config/config.json'
})
```

### Load multiple configuration files

When using multiple configuration files, files are merged in returned array order.

```typescript
AngularConfigModule.forRoot(Configuration, {
  urlFactory: () => [ 'config/config.common.json', 'config/config.DEV.json' ]
})
```

### Load multiple configuration files based on environment
```typescript
AngularConfigModule.forRoot(Configuration, {
  urlFactory: () => {
    const env = getEnvironment(); // your defined method that provides current environment name
    return ['/config/config.common.json', `/config/config.${env}.json`]
  }
})
```

Example of `getEnvironment()` function:
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
```typescript
AngularConfigModule.forRoot(Configuration, {
  urlFactory: (injector: Injector) => {
    const env = getEnvironment(injector); // your defined method that provides current environment name
    return ['/config/config.common.json', `/config/config.${env}.json`]
  }
})
```

### Async load multiple configuration files based on environment using injector
```typescript
AngularConfigModule.forRoot(Configuration, {
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
