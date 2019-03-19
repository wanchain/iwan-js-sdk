# iWan-js-sdk

[![GitHub License][license]][license-url]

### JavaScript SDK for iWan RPC Server

## Install
Use NPM or Yarn to install the library:

```bash
npm install --save iwan-sdk
```
## Config
After installation, the iWan SDK can be used to connect to the iWan RPC server to call a method such as `getBalance`. The default config can be used or custom config parameters can be passed using the `option` object.
```bash
const iWanClient = require('iwan-sdk');
```
By default the SDK will connect to `api.wanchain.org`
```bash
let apiClient = new iWanClient(YourApiKey, YourSecretKey);

```
You can also specify a different URL in the `option` object.
```bash
let option = {
      url:"apitest.wanchain.org",
    };
apiClient = new iWanClient(YourApiKey, YourSecretKey, option);

```
Th client should be closed after all operations.
```bash
apiClient.close();
```
Instead of using the iWan SDK for connecting to the iWan RPC server, a raw WebSocket API can also be used, for more information, please see the documentation [iWan RPC API](https://iwan.wanchain.org/static/apidoc/docs.html). However, we strongly recommend using the iWan SDK.

### Details about `option`
The SDK object can accept an `option` object. See below for examples of usage.

- `option` {Object}
  - `url` {String}  The RPC server URL, default is 'api.wanchain.org'.
  - `port` {Number} The RPC server port, default is 443.
  - `flag` {String} The flag to connect the iWan RPC server, default is 'ws'.
  - `version` {String} The RPC method version, default is 'v3'.

### ApiKey and SecretKey
In order to get an `ApiKey`, sign up at [iWan](https://iwan.wanchain.org). Then create a new project to get a new `ApiKey` and `SecretKey` key pair.

## Basic Usage
Both `Promise` and `callback` are supported for each method. 

- `callback` {Function}
  - `err` {String}  in case of error, error details will be stored in `err`, `err` will contain `null` otherwise.
  - `result` {Object} if successful (in other words `err` is `null`), the `result` object will contain the result of the method called, such as `getBalance`.

The method `getBalance` is used as an example below to show the use of `callback` and `Promise` in the iWan SDK :

### Callback
`callback` can be used for asynchronous mode:
```bash
apiClient.getBalance('WAN', '0x0cc79fa3b80c5b9b02051facd02478ea88a78e2c', (err, balance) => {
  if (err) {
    console.log("err:" + err);
  } else {
    console.log("balance:" + balance);
  }
});
```
### Promise
`Promise` can be used for synchronous mode:
```bash
try {
  let balance = await apiClient.getBalance('WAN', '0x0cc79fa3b80c5b9b02051facd02478ea88a78e2c');
  console.log("Balance result is ", balance);
} catch (err) {
  console.log(err);
}
```
## Development
1. `git clone https://github.com/wanchain/iWan-js-sdk.git`
2. `npm install`
3. `npm test`

## Documentation

[iWan SDK API](https://wanchain.github.io/iWan-js-sdk/) : API details about iWan SDK

[license]: https://img.shields.io/badge/license-GNUGPL3-blue.svg
[license-url]:https://github.com/wanchain/iWan-js-sdk/blob/master/LICENSE
