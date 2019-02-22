const config = {
    socketUrl: 'wss://34.223.242.105',
    socketPort: 8080,

    apiFlag: 'ws',
    apiVersion: 'v3',

    auth: {
        // projectName: 'test',
        apiKey: process.env.APIKEY,
        secretKey: process.env.SECRETKEY
    },

    _Encoding: {
        _enc: 'sha256',
        _base64: "base64",
        _hex: "hex"
    }
}

module.exports = config;