const JSON = require("circular-json");

const WsInstanceBase = require('./wsInstanceBase');
const config = require('../conf/config.js');

class WsInstance extends WsInstanceBase {
    constructor(apiKey, secretKey, option) {
        super(apiKey, secretKey, option);

        this.requestCheck = this.createReqHeartCheck();
        this.createWebSocket();
        this.requestCheck.start();
    }

    createWebSocket() {
        try {
            console.log("Websocket url is ", this.ws_url);
            if (this.wss.removeAllListeners())
            this.wss = new WebSocket(this.ws_url);
            this.wss.activeClose = false;
            this.initEventHandle();
        } catch (e) {
            this.reconnect();
        }
    }

    initEventHandle() {
        let self = this;
        this.wss.onopen = () => {
            console.log("Socket opened.");
            self.events.emit("open");
        };

        this.wss.on('pong', () => {
            self.wss.tries = config.maxTries;
            self.wss.isAlive = true;
        });

        this.wss.onmessage = (message) => {
            var re = JSON.parse(message.data);
            self.getMessage(re);
        };

        this.wss.onerror = (err) => {
            console.error("ERROR: (%s)", JSON.stringify(err));
            self.clearPendingReq();
            self.reconnect();
        };

        this.wss.on("close", (code, reason) => {
            console.log("ApiInstance notified socket has closed. code: (%s), reason: (%s)", code, reason);
            self.clearPendingReq();
            if (!this.wss.activeClose) {
                self.reconnect();
            }
        });

        this.wss.on("unexpected-response", (req, response)=>{
            console.error("ERROR CODE : " + response.statusCode + " < " + response.statusMessage + " > ");
            self.clearPendingReq();
            self.reconnect();
        });

    }

    // initEventHandle() {
    //     let self = this;
    //     this.wss.onopen = () => {
    //         console.log("Socket opened.");
    //         self.events.emit("open");
    //     };

    //     this.wss.on('pong', () => {
    //         console.log("EVENT pong");
    //         self.wss.isAlive = true;
    //     });

    //     this.wss.onmessage = (message) => {
    //         console.log("receive message:", message.data);
    //         var re = JSON.parse(message.data);
    //         self.getMessage(re);
    //     };

    //     this.wss.onerror = (err) => {
    //         console.error("ERROR: (%s)", JSON.stringify(err));
    //         self.clearPendingReq();
    //         self.reconnect();
    //     };

    //     this.wss.on("close", (code, reason) => {
    //         console.log("ApiInstance notified socket has closed. code: (%s), reason: (%s)", code, reason);
    //         if (!this.wss.activeClose) {
    //             self.clearPendingReq();
    //             self.reconnect();
    //         }
    //     });

    //     this.wss.on("unexpected-response", (req, response)=>{
    //         console.error("ERROR CODE : " + response.statusCode + " < " + response.statusMessage + " > ");
    //         self.clearPendingReq();
    //         self.reconnect();
    //     });

    //     this.heartCheck.reset().start();
    // }

    reconnect() {
        if (this.lockReconnect) {
            return;
        }
        this.lockReconnect = true;
        if (!this.isClosed() && !this.isClosing()) {
            this.close();
        }
        this.reTt && clearTimeout(this.reTt);
        this.reTt = setTimeout(() => {
            if (!this.wss.activeClose) {
                this.createWebSocket();
            }
            this.lockReconnect = false;
        }, this.option.reconnectTimeoutOut);
    }

    status() {
        return this.wss.readyState;
    }

    isConnectionOpen() {
        return this.wss.readyState === WebSocket.OPEN;
    }

    isConnecting() {
        return this.wss.readyState === WebSocket.CONNECTING;
    }

    isConnected() {
        return this.wss.readyState === WebSocket.OPEN;
    }

    isClosed() {
        return this.wss.readyState === WebSocket.CLOSED;
    }

    isClosing() {
        return this.wss.readyState === WebSocket.CLOSEING;
    }

    close() {
        console.log("Websocket closed");
        this.clearPendingReq();
        if (this.wss) {
            this.wss.close(config.ws.code.normal, "client abnormal close");
            return ;
        }

        this.requestCheck.stop();
        if (this.wss) {
            this.wss.activeClose = true;
            this.wss.close(config.ws.code.normal, "client normal close");
        }
    }

    sendMessage(message, callback) {
        let idx = message.id.toString()
        console.log("send message:", JSON.stringify(message));

        this.wss.send(JSON.stringify(message));
        this.functionDict[idx] = {};
        this.functionDict[idx].fn = callback;
        this.functionDict[idx].time = Date.now();
    }

    getMessage(message) {
        let idx = message.id.toString();
        if (this.functionDict[idx]) {
            let fn = this.functionDict[idx].fn;
            delete this.functionDict[idx];
            fn(message);
        } else {
            console.log("req %s has been cleared", idx);
        }
    }

    clearPendingReq() {
        let tempReq = this.functionDict;
        this.functionDict = {};
        for (let idx in tempReq) {
            console.log("clear pending req %s", idx);
            tempReq[idx].fn(config.pendResponse.connLost);
        }
    }

    createReqHeartCheck() {
        return {
            stop: () => {
                if (this.intervalReq) {
                    clearInterval(this.intervalReq);
                    this.intervalReq = null;
                }
            },
            start: () => {
                this.intervalReq = setInterval(() => {
                    // console.log("=====check request status,", new Date());
                    for (let idx in this.functionDict) {
                        let fn = this.functionDict[idx].fn;
                        if (this.functionDict[idx].time + this.option.timeout < Date.now()) {
                            delete this.functionDict[idx];
                            fn(config.pendResponse.reqTimeout);
                        }
                    }
                }, this.option.reconnectTimeoutOut);
            }
        }
    }

    addConnectNotify(callback) {
        this.events.on('open', callback);
    }

}

module.exports = WsInstance;
