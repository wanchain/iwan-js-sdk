const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;

const config = require('../conf/config.js');

const OPTIONS = {
    'handshakeTimeout': 12000,
    rejectUnauthorized: false
};

class WsEvent extends EventEmitter {}

class WsInstance {
    constructor(apiKey, secretKey) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.open = false;
        this.events = new WsEvent();
        this.ws_url = config.socketUrl + ':' + config.socketPort;
        if (config.apiFlag) {
            this.ws_url += '/' + config.apiFlag;
        }

        if (this.apiKey) {
            this.ws_url += '/' + config.apiVersion + '/' + this.apiKey;

            this.lockReconnect = false;
            this.functionDict = {};
            this.heartCheck();
            this.createWebSocket();
        } else {
            throw new Error('Should config \'APIKEY\' and \'SECRETKEY\'');
            // console.log("Plz config 'APIKEY' and 'SECRETKEY'.");
            process.exit();
        }
    }

    createWebSocket() {
        try {
            console.log("Websocket url is ", this.ws_url);
            this.wss = new WebSocket(this.ws_url, OPTIONS);
            this.initEventHandle();
        } catch (e) {
            this.reconnect();
        }
    }

    initEventHandle() {
        this.wss.onopen = () => {
            console.log("Socket opened.");
            this.heartCheck.reset().start();
            this.open = true;
            this.events.emit("open");
        };

        this.wss.on('pong', () => {
            this.heartCheck.reset().start();
        });

        this.wss.onmessage = (message) => {
            this.heartCheck.reset().start();

            var re = JSON.parse(message.data);
            this.getMessage(re);
        };

        this.wss.onerror = (err) => {
            this.reconnect();
            this.open = false;
        };

        this.wss.onclose = () => {
            this.open = false;
            console.log("ApiInstance notified socket has closed.");
        };
    }

    heartCheck() {
        let that = this;
        let timeout = 20000;
        this.heartCheck = {
            timeout: timeout,
            timeoutObj: null,
            serverTimeoutObj: null,
            reset: () => {
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                return this.heartCheck;
            },
            start: () => {
                var self = this;
                this.timeoutObj = setTimeout(() => {
                    if (that.wss.readyState === WebSocket.OPEN) {
                        that.wss.ping('{"event": "ping"}');
                    }
                    self.serverTimeoutObj = setTimeout(() => {
                        that.wss.close();
                    }, timeout);
                }, timeout)
            }
        }
    }

    reconnect() {
        if (this.lockReconnect) {
            return;
        }
        this.lockReconnect = true;
        this.reTt && clearTimeout(this.reTt);
        this.reTt = setTimeout(() => {
            this.createWebSocket();
            this.lockReconnect = false;
        }, 2000);
    }

    close() {
        this.heartCheck.reset();
        this.wss.close();
    }

    sendMessage(message, callback) {
        let idx = message.id.toString()

        this.wss.send(JSON.stringify(message));
        this.functionDict[idx] = callback;
    }

    getMessage(message) {
        let idx = message.id.toString()
        let fn = this.functionDict[idx];

        delete this.functionDict[idx];
        fn(message);
    }
}

module.exports = WsInstance;
