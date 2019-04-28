const config = {
  socketUrl: 'api.wanchain.org',
  socketPort: 8443,

  apiFlag: 'ws',
  apiVersion: 'v3',

  _Encoding: {
    _enc: 'sha256',
    _base64: "base64",
    _hex: "hex"
  },

  maxTries: 3,
  pingTime: 30000
}

module.exports = config;