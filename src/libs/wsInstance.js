const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;

const config = require('../conf/config.js');

const CONN_OPTIONS = {
    'handshakeTimeout': 12000,
    rejectUnauthorized: false
};

class WsEvent extends EventEmitter {}

class WsInstance {
    constructor(apiKey, secretKey, option) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.events = new WsEvent();
        this.option = Object.assign({url:config.socketUrl,port:config.socketPort,flag:config.apiFlag,version:config.apiVersion} ,option);
        this.ws_url = 'wss://' + this.option.url + ':' + this.option.port;
        if (this.option.flag) {
            this.ws_url += '/' + this.option.flag;
        }

        if (this.apiKey) {
            this.ws_url += '/' + this.option.version + '/' + this.apiKey;

            this.lockReconnect = false;
            this.functionDict = {};
            this.heartCheck();
            this.createWebSocket();
        } else {
            throw new Error('Should config \'APIKEY\' and \'SECRETKEY\'');
            process.exit();
        }
    }

    createWebSocket() {
        try {
            console.log("Websocket url is ", this.ws_url);
            this.wss = new WebSocket(this.ws_url, CONN_OPTIONS);
            this.initEventHandle();
        } catch (e) {
            this.reconnect();
        }
    }

    initEventHandle() {
        this.wss.onopen = () => {
            console.log("Socket opened.");
            this.heartCheck.reset().start();
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
        };

        this.wss.onclose = () => {
            console.log("ApiInstance notified socket has closed.");
            this.reconnect();
        };

        this.wss.on("unexpected-response", (req, response)=>{
            this.reconnect();
            console.log("ERROR CODE : " + response.statusCode + " < " + response.statusMessage + " > ");
        });
    }

    heartCheck() {
        let that = this;
        let timeout = 30000;
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
                        // that.wss.close();
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

    isOpen() {
        return this.wss.readyState === WebSocket.OPEN;
    }

    close() {
        this.heartCheck.reset();
        if (this.wss) {
            this.wss.close();
        }
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
