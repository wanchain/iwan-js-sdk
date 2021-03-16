const EventEmitter = require('events').EventEmitter;
const config = require('../conf/config.js');

class WsEvent extends EventEmitter {}

class WsInstanceBase {
  constructor(apiKey, secretKey, option) {
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
      reconnectTimeoutOut: config.reconnTime
    }, option);

    this.ws_url = 'wss://' + this.option.url + ':' + this.option.port;
    if (this.option.flag) {
        this.ws_url += '/' + this.option.flag;
    }

    if (!this.apiKey) {
      throw new Error('Should config \'APIKEY\' and \'SECRETKEY\'');
    }

    this.ws_url += '/' + this.option.version + '/' + this.apiKey;
    this.lockReconnect = false;
    this.functionDict = {};
  }

  createWebSocket() {
    throw new Error("override createWebSocket")
  }

  initEventHandle() {
    this.wss.onopen = () => {
      console.log("Socket opened.");
      this.events.emit("open");
    };

    this.wss.on('pong', () => {
      self.wss.tries = config.maxTries;
      self.wss.isAlive = true;
    });

    this.wss.onmessage = (message) => {
      var re = JSON.parse(message.data);
      this.getMessage(re);
    };

    this.wss.onerror = (err) => {
      console.error("ERROR: (%s)", JSON.stringify(err));
      this.clearPendingReq();
      this.reconnect();
    };

    this.wss.on("close", (code, reason) => {
      console.log("ApiInstance notified socket has closed. code: (%s), reason: (%s)", code, reason);
      this.clearPendingReq();
      if (!this.wss.activeClose) {
        this.reconnect();
      }
    });

    this.wss.on("unexpected-response", (req, response)=>{
      console.error("ERROR CODE : " + response.statusCode + " < " + response.statusMessage + " > ");
      this.clearPendingReq();
      this.reconnect();
    });
  }

  clearPendingReq() {
    throw new Error("override clearPendingReq");
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
    }, this.option.reconnectTimeoutOut);
  }

  status() {
    throw new Error("override status");
  }

  isConnectionOpen() {
    throw new Error("override isConnectionOpen");
  }

  isConnecting() {
    throw new Error("override isConnecting");
  }

  isConnected() {
    throw new Error("override isConnected");
  }

  isClosed() {
    throw new Error("override isClosed");
  }

  isClosing() {
    throw new Error("override isClosing");
  }

  close(innerClose = false) {
    console.log("Websocket closed");
    this.clearPendingReq();
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
    throw new Error("override sendMessage");
  }

  getMessage(message) {
    throw new Error("override getMessage");
  }

  addConnectNotify(callback) {
    callback("override addConnectNotify")
    throw new Error("override addConnectNotify")
  }

  createReqHeartCheck() {
    throw new Error("override createReqHeartCheck");
  }

}

module.exports = WsInstanceBase;
