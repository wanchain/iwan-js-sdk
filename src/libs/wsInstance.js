const config = require('../conf/config.js');

const WebSocket = require('ws');

const OPTIONS = {
    'handshakeTimeout': 12000,
    rejectUnauthorized: false
};

class WsInstance {
    constructor() {
        this.ws_url = config.socketUrl + ':' + config.socketPort;
        if (config.apiFlag) {
            this.ws_url += '/' + config.apiFlag;
        }

        if (config.auth.apiKey) {
            this.ws_url += '/' + config.apiVersion + '/' + config.auth.apiKey;

            this.lockReconnect = false;
            this.functionDict = {};
            this.heartCheck();
            this.createWebSocket();
        } else {
            console.log("Plz config 'APIKEY' and 'SECRETKEY' in env.");
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
        };

        this.wss.on('pong', () => {
            this.heartCheck.reset().start();
        });

        this.wss.onmessage = (message) => {
            console.log("websocket onmessage", message.data);
            this.heartCheck.reset().start();

            var re = JSON.parse(message.data);
            this.getMessage(re);
        };

        this.wss.onerror = (err) => {
            console.log("Error be got.", err);
            this.reconnect();
        };

        this.wss.onclose = () => {
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

    // send(data) {
    //     console.log("debug here");
    //     if (this.wss.readyState === WebSocket.OPEN) {
    //         this.wss.send(data);
    //     } else {
    //         this.reconnect();
    //         setTimeout(() => {
    //             this.wss.send(data);
    //         }, 2000);
    //     }
    // }

    sendMessage(message) {
        this.functionDict[message.message.id] = message;
        console.log("socket send message:", message.message);
        this.wss.send(JSON.stringify(message.message));
    }

    getMessage(message) {
        this.functionDict[message.id].onMessage(message);
        delete this.functionDict[message.id];
    }
}

module.exports = WsInstance;
