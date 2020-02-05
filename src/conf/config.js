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
  pingTime: 30000,
  reconnTime: 2000,
  reqTimeout: 30000,

  ws: {
    code: {
      normal:1000,
      abnormal:1006
    },
    connOption: {
      'handshakeTimeout': 12000,
      rejectUnauthorized: false
    }
  },

  pendResponse: {
    connLost: {"error": "Websocket closed"},
    reqTimeout: {"error": "request timeout"}
  }
}

module.exports = config;