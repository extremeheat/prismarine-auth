# prismarine-auth
[![NPM version](https://img.shields.io/npm/v/prismarine-auth.svg)](http://npmjs.com/package/prismarine-auth)
[![Build Status](https://github.com/PrismarineJS/prismarine-auth/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-auth/actions?query=workflow%3A%22CI%22)
[![Official Discord](https://img.shields.io/static/v1.svg?label=PrismarineJS&message=Discord&color=blue&logo=discord)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-auth)

Node.js library to authenticate with Microsoft services, including Xbox Live, Minecraft Java Edition, Minecraft Bedrock Edition, and Microsoft Azure Playfab,
with built-in caching support.

<!-- This library is designed to be used with the [PrismarineJS](https://github.com/PrismarineJS) ecosystem. -->

## Installation
```shell
npm install prismarine-auth
```

## Usage

### Authflow
**Parameters**
- username? {String} - Username for authentication
- cacherOrDir? {String | CacheFactory} - Where we will store your tokens (optional, defaults to node_modules) or a factory object that returns a Cache (see [API.md](docs/API.md))
- options {Object?}
    - [flow] {enum} Required if options is specified - see [API.md](docs/API.md) for options
    - [forceRefresh] {boolean} - Clear all cached tokens for the specified `username` to get new ones on subsequent token requests
    - [password] {string} - If passed we will do password based authentication.
    - [authTitle] {string} - See the [API.md](docs/API.md)
    - [deviceType] {string} - See the [API.md](docs/API.md)
    - [scopes] {string[]} - Extra scopes to add to the auth request. By default, this includes Xbox and offline_access scopes; setting this will replace those scopes (but keep `offline_access` on `msal` flow which is required for caching). *Note that the flows will differ depending on specified `flow`.*
    - [abortSignal] {AbortSignal} - (Optional) An AbortSignal to cancel the request.
- onMsaCode {Function} - (For device code auth) What we should do when we get the code. Useful for passing the code to another function.

### Simple login to a Microsoft account

We can obtain a Microsoft account auth token by calling .login() on the Authflow object.

Without specifying any options, the library will default to the `live` flow, and authenticate with client ID set to Minecraft for Nintendo Switch.

```js
const { Authflow } = require('prismarine-auth')
const flow = new Authflow('username', './') // Username and cache directory
// Initialize login process
flow.login().then(console.log)
```

In this example, as we don't pass any special code handling; the library will print a code and URL to the terminal
that the user can then visit to authenticate. Afterwards, the .login() Promise will resolve and return the following object:

```js
{
  accessToken: '...',
  accountUUID: '...',
  accountDisplayName: undefined,
  accountUsername: undefined
}
```

Note that `accountDisplayName` and `accountUsername` are not avaliable when using the `live` flow, which is the default.
`accountUUID` is visible and is the unique identifier for the account that you can use to uniquely identify the Microsoft account.

### Login with a custom client ID

To use a custom client ID, one which you can get from registering an Azure app at the [Microsoft Azure portal](https://portal.azure.com/),
you can pass the `flow` option to the Authflow constructor and specify the client ID under `authTitle` like this:

```js
const authflow = new Authflow('username', './', { flow: 'msal', authTitle: '10000000-2000-0000-0000-000000000000' })
```

and keep the rest of the code the same.

*Note: your Azure app must have non-interactive device code-flow based authentication enabled, under Manage -> Authentication -> "Allow public client flows".*

## API

See [docs/API.md](docs/API.md) and [types](./index.d.ts) for more information.

### getMsaToken
```js
const { Authflow, Titles } = require('prismarine-auth')

const userIdentifier = 'unique identifier for caching'
const cacheDir = './' // You can leave this as undefined unless you want to specify a caching directory
const flow = new Authflow(userIdentifier, cacheDir)
// Get a auth token, then log it
flow.getMsaToken().then(console.log)
```

**Note**: As noted above, by default, this library will authenticate as Minecraft for Nintendo Switch, with a `flow` set to `live`. For non-Minecraft applications you should
register for Microsoft Azure Oauth token. See https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app#register-an-application for more information 
on obtaining an Azure token. You then use it with the `msal` flow like this:

```js
const flow = new Authflow(userIdentifier, cacheDir, { flow: 'msal', authTitle: '000-000-000-000' })
```

If `flow` is `live`, the default, then you can only specify existing Microsoft client IDs. This library exposes some default Microsoft client IDs under the exported `Titles` object. See the [types](./index.d.ts) for more information.

### getXboxToken
See [docs/API.md](docs/API.md)


### getMinecraftJavaToken
```js
const { Authflow, Titles } = require('prismarine-auth')

const userIdentifier = 'any unique identifier'
const cacheDir = './' // You can leave this as undefined unless you want to specify a caching directory
const flow = new Authflow(userIdentifier, cacheDir)
// Get a Minecraft Java Edition auth token, then log it
flow.getMinecraftJavaToken({ fetchProfile: true }).then(console.log)
```

**Expected Response**
```json
{
    "token": "ey....................",
    "entitlements": {},
    "profile": {
        "id": "b945b6ed99b548675309473a69661b9a",
        "name": "Usname",
        "skins": [ [Object] ],
        "capes": []
    }
}
```

### getMinecraftBedrockToken
See [docs/API.md](docs/API.md) and [example](examples).

### getMinecraftBedrockServicesToken
```js
const { Authflow, Titles } = require('prismarine-auth')

const userIdentifier = 'any unique identifier'
const cacheDir = './' // You can leave this as undefined unless you want to specify a caching directory
const flow = new Authflow(userIdentifier, cacheDir)
// Get a Minecraft Services token, then log it
flow.getMinecraftBedrockServicesToken().then(console.log)
```

**Expected Response**
```json
{
    "mcToken": "MCToken eyJ...",
    "validUntil": "1970-01-01T00:00:00.000Z",
    "treatments": [
      "mc-enable-feedback-landing-page",
      "mc-store-enableinbox",
      "mc-nps-freeorpaid-paidaug24",
      // and more
    ],
    "configurations": {
      "validation": {
        "id": "Validation",
        "parameters": {
          "minecraftnetaatest": "false"
        }
      },
      "minecraft": {
        "id": "Minecraft",
        "parameters": {
          "with-spongebobadd-button-noswitch": "true",
          "sfsdfsdfsfss": "true",
          "fsdfd": "true",
          "mc-maelstrom-disable": "true",
          // and more
        }
      }
    },
    "treatmentContext": "mc-sunsetting_5:31118471;mc-..."
}
```

See the [types](./index.d.ts) to checkout the full API.

### More Examples
[View more examples here](https://github.com/PrismarineJS/prismarine-auth/tree/master/examples).

## Debugging

You can enable some debugging output using the `DEBUG` enviroment variable. Through node.js, you can add `process.env.DEBUG = 'prismarine-auth'` at the top of your code.


## Testing

Simply run `npm test` or `yarn test`

## License

[MIT](LICENSE)
