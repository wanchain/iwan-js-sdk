const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;
const JSON = require("circular-json");

const config = require('../conf/config.js');

const CONN_OPTIONS = {
    'handshakeTimeout': 12000,
    rejectUnauthorized: false
};

const PENDING_REPONSE = {"error": "Websocket closed"};

class WsEvent extends EventEmitter {}

class WsInstance {
    constructor(apiKey, secretKey, option) {
        this.intervalObj = null;
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

    handleFailure(log, functionName, err) {
        log.error('something is wrong when ' + functionName + ', ' + err);
        let error = (err.hasOwnProperty("message")) ? err.message : err;
        return error;
    }

    createWebSocket() {
        try {
            console.log("Websocket url is ", this.ws_url);
            this.wss = new WebSocket(this.ws_url, CONN_OPTIONS);
            this.wss.isAlive = true;
            this.wss.tries = config.maxTries;
            this.wss.activeClose = false;
            this.initEventHandle();
        } catch (e) {
            this.reconnect();
        }
    }

    initEventHandle() {
        let that = this;
        this.wss.onopen = () => {
            console.log("Socket opened.");
            that.events.emit("open");
        };

        this.wss.on('pong', () => {
            that.wss.tries = config.maxTries;
            that.wss.isAlive = true;
        });

        this.wss.onmessage = (message) => {
            var re = JSON.parse(message.data);
            that.getMessage(re);
        };

        this.wss.onerror = (err) => {
            console.error("ERROR: (%s)", JSON.stringify(err));
            that.reconnect();
        };

        this.wss.on("close", (code, reason) => {
            console.log("ApiInstance notified socket has closed. code: (%s), reason: (%s)", code, reason);
            if (!this.wss.activeClose) {
                that.reconnect();
            }
        });

        this.wss.on("unexpected-response", (req, response)=>{
            console.error("ERROR CODE : " + response.statusCode + " < " + response.statusMessage + " > ");
            that.reconnect();
        });

        this.heartCheck.reset().start();
    }

    heartCheck() {
        let that = this;
        
        this.heartCheck = {
            reset: () => {
                if (that.intervalObj) {
                    clearInterval(that.intervalObj);
                    that.intervalObj = null;
                }
                return this.heartCheck;
            },
            start: () => {
                that.intervalObj = setInterval(function ping() {
                    if (!that.wss.isAlive) {
                        --that.wss.tries;
                        if (that.wss.tries < 0) {
                            console.error("Server [%s] is unreachable", that.ws_url);
                            console.error("reconnect");
                            that.reconnect();
                        }
                    } else {
                        that.wss.isAlive = false;
                        if (that.isOpen()) {
                            that.wss.ping(function noop() {});
                            // that.wss.ping('{"event": "ping"}');
                        } else {
                            that.events.on("open", () => {
                                that.wss.ping(function noop() {});
                                // that.wss.ping('{"event": "ping"}');
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
            this.close();
        }
        this.reTt && clearTimeout(this.reTt);
        this.reTt = setTimeout(() => {
            this.clearPendingReq();
            this.createWebSocket();
            this.lockReconnect = false;
        }, 2000);
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

    close() {
        console.log("Websocket closed");      
        this.heartCheck.reset();
        if (this.wss) {
            this.wss.activeClose = true;
            this.wss.close(config.ws.code.normal, "client normal close");
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
        if (fn != undefined) {
            delete this.functionDict[idx];
            fn(message);
        } else {
            console.log("req %s has been cleared", idx);
        }
    }

    clearPendingReq() {
        let tempReq = this.functionDict;
        this.functionDict = [];
        for (let idx in tempReq) {
            console.log("clear pending req %s", idx);
            tempReq[idx](PENDING_REPONSE);
        }        
    }
}

module.exports = WsInstance;
