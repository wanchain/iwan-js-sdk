const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;
const JSON = require("circular-json");

const config = require('../conf/config.js');

class WsEvent extends EventEmitter {}

class WsInstance {
    constructor(apiKey, secretKey, option) {
        this.intervalObj = null;
        this.intervalReq = null;
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.events = new WsEvent();
        this.option = Object.assign({
            url:config.socketUrl,
            port:config.socketPort,
            flag:config.apiFlag,
            version:config.apiVersion,
            timeout:config.reqTimeout,
        } ,option);
        this.ws_url = 'wss://' + this.option.url + ':' + this.option.port;
        if (this.option.flag) {
            this.ws_url += '/' + this.option.flag;
        }
        if (this.option.clientType === undefined && this.option.clientVersion === undefined) {
            this.option.clientType = config.defaultCliType;
            this.option.clientVersion = config.defaultCliVersion;
        }

        if (this.apiKey) {
            this.ws_url += '/' + this.option.version + '/' + this.apiKey;

            this.lockReconnect = false;
            this.functionDict = {};
            this.requestCheck = this.createReqHeartCheck();
            this.heartCheck();
            this.createWebSocket();
            this.requestCheck.start();
        } else {
            throw new Error('Should config \'APIKEY\' and \'SECRETKEY\'');
            process.exit();
        }
    }

    handleFailure(log, functionName, err) {
        log.error('something is wrong when ' + functionName + ', ' + err);
        let error = (err.hasOwnProperty("message")) ? err.message : err;
        return error;
    }

    createWebSocket() {
        try {
            console.log("Websocket url is ", this.ws_url);
            this.wss = new WebSocket(this.ws_url, config.ws.connOption);
            this.wss.isAlive = true;
            this.wss.tries = config.maxTries;
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

        this.heartCheck.reset().start();
    }

    heartCheck() {
        let self = this;
        
        this.heartCheck = {
            reset: () => {
                if (self.intervalObj) {
                    clearInterval(self.intervalObj);
                    self.intervalObj = null;
                }
                return this.heartCheck;
            },
            start: () => {
                self.intervalObj = setInterval(function ping() {
                    if (!self.wss.isAlive) {
                        --self.wss.tries;
                        if (self.wss.tries < 0) {
                            console.error("Server [%s] is unreachable", self.ws_url);
                            self.clearPendingReq();
                            console.error("reconnect");
                            self.reconnect();
                        }
                    } else {
                        self.wss.isAlive = false;
                        if (self.isOpen()) {
                            self.wss.ping(function noop() {});
                            // self.wss.ping('{"event": "ping"}');
                        } else {
                            self.events.on("open", () => {
                                self.wss.ping(function noop() {});
                                // self.wss.ping('{"event": "ping"}');
                            });
                        }
                    }
                }, config.pingTime);
            }
        }
    }

    reconnect() {
        if (this.lockReconnect) {
            return;
        }
        this.lockReconnect = true;
        if (!this.isClosed() && !this.isClosing()) {
            this.close(true);
        }
        this.reTt && clearTimeout(this.reTt);
        this.reTt = setTimeout(() => {
            if (!this.wss.activeClose) {
              this.createWebSocket();
            }
            this.lockReconnect = false;
        }, config.reconnTime);
    }

    status() {
        return this.wss.readyState;
    }

    isOpen() {
        return this.wss.readyState === WebSocket.OPEN;
    }

    isClosed() {
        return this.wss.readyState === WebSocket.CLOSED;
    }

    isClosing() {
        return this.wss.readyState === WebSocket.CLOSEING;
    }

    close(innerClose = false) {
        console.log("Websocket closed");
        this.clearPendingReq();
        this.heartCheck.reset();
        if (innerClose && this.wss) {
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
        let self = this;
        return {
            stop: () => {
                if (self.intervalReq) {
                    clearInterval(self.intervalReq);
                    self.intervalReq = null;
                }
            },
            start: () => {
                self.intervalReq = setInterval(function loopCheck() {
                    for (let idx in self.functionDict) {
                        let fn = self.functionDict[idx].fn;
                        if (self.functionDict[idx].time + self.option.timeout < Date.now()) {
                            delete self.functionDict[idx];
                            fn(config.pendResponse.reqTimeout);
                        }
                    }
                }, config.reconnTime);
            }
        }
    }

}

module.exports = WsInstance;
