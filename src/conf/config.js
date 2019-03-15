const config = {
    // socketUrl: 'wss://34.223.242.105',
    socketUrl: 'wss://192.168.47.159',
    socketPort: 8080,

    apiFlag: 'ws',
    apiVersion: 'v3',

    auth: {
        // projectName: 'test',
    },

    _Encoding: {
        _enc: 'sha256',
        _base64: "base64",
        _hex: "hex"
    }
}

module.exports = config;