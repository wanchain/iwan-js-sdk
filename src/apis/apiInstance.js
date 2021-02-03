const utils = require('../libs/utils');
const WsInstance = require('../libs/wsInstance');
const auth = require('../authorization/auth.js');

class ApiInstance extends WsInstance {
  constructor(apiKey, secretKey, option = {}) {
    super(apiKey, secretKey, option);
    this.index = 0;
  }

  _request(method, parameters, callback) {
    let message = {
        jsonrpc: "2.0",
        method: method,
        params: parameters,
        id: this.index
    };
    ++this.index;

    let jsonResult = auth.integrateJSON(message, this.secretKey);
    if (jsonResult.hasOwnProperty("error")) {
        callback(jsonResult["error"]);
    } else {
      if (this.isOpen()) {
        this._send(jsonResult["result"], callback);
      } else {
        this.events.once("open", () => {
          this._send(jsonResult["result"], callback);
        });
      }

    }
  }

  _send(message, callback) {
    try {
      this.sendMessage(message, (resMsg) => {
        if (resMsg.hasOwnProperty("error")) {
          callback(resMsg["error"]);
        } else {
          callback(null, resMsg["result"]);
        }
      });
    } catch (err) {
      callback(err);
    }
  }

  checkHash(hash) {
    // check if it has the basic requirements of a hash
    return /^(0x)?[0-9a-fA-F]{64}$/i.test(hash)
  }

  /**
   *
   * @apiName monitorEvent
   * @apiGroup Events
   * @api {CONNECT} /ws/v3/YOUR-API-KEY monitorEvent
   * @apiVersion 1.2.1
   * @apiDescription Subscribe to a smart contract event monitor. The server will push the event to the subscriber when the event occurs.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
   * @apiParam {string} address The contract address.
   * @apiParam {array} topics Array of values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x00...'].
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"monitorEvent","params":{"chainType":"WAN", "address": "0x0d18157D85c93A86Ca194DB635336E43B1Ffbd26", "topics": ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7"]},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.monitorEvent('WAN', '0x0d18157D85c93A86Ca194DB635336E43B1Ffbd26', ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.monitorEvent('WAN', '0x0d18157D85c93A86Ca194DB635336E43B1Ffbd26', ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7"]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [{
      "address": "0x0d18157d85c93a86ca194db635336e43b1ffbd26",
      "topics": ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7", "0x0000000000000000000000000d18157d85c93a86ca194db635336e43b1ffbd26"],
      "data": "0xf124b8ff25fd9c5e4f4e555232840d6a0fb89f4eb9e507ee15b5eff1336de212",
      "blockNumber": 685211,
      "transactionHash": "0xf5889525629718bc39cc26909012f1502826e2241d6f169ac6c229328d38245b",
      "transactionIndex": 0,
      "blockHash": "0x6b673291fe79e06323766d0966430cafd0baec742ec7532a10be74018ba1d785",
      "logIndex": 0,
      "removed": false
   * }]
   *
   */
  monitorEvent(chainType, address, topics, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'monitorEvent';
    let params = { chainType: chainType, address: address, topics: topics };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getScEvent
  * @apiGroup Events
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScEvent
  * @apiVersion 1.2.1
  * @apiDescription Get smart contract event log via topics.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} address The contract address.
  * @apiParam {array} topics An array of string values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x00...'].
  * @apiParam {object} [option] An object value which describes the range between fromBlock and toBlock.
  * <br>&nbsp;&nbsp;<code>fromBlock</code> - The number of the earliest block (latest may be given to mean the most recent, block). By default 0.
  * <br>&nbsp;&nbsp;<code>toBlock</code> - The number of the latest block (latest may be given to mean the most recent, block). By default latest.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScEvent","params":{"chainType":"WAN", "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167", "topics": ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getScEvent('WAN', '0xda5b90dc89be59365ec44f3f2d7af8b6700d1167', ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getScEvent('WAN', '0xda5b90dc89be59365ec44f3f2d7af8b6700d1167', ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  * [{
     "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
     "topics": ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"],
     "data": "0x54657374206d6573736167650000000000000000000000000000000000000000",
     "blockNumber": 1121916,
     "transactionHash": "0x6bdd2acf6e946be40e2b3a39d3aaadd6d615d59c89730196870f640990a57cbe",
     "transactionIndex": 0,
     "blockHash": "0xedda83000829f7d0a0820a7bdf2103a3142a70c404f78fd1dfc7751dc007f5a2",
     "logIndex": 0,
     "removed": false
  * }]
  *
  */
  getScEvent(chainType, address, topics, option, callback) {
    let method = 'getScEvent';
    let params = { chainType: chainType, address: address, topics: topics };

    if (option) {
      if (typeof(option) === "function") {
        callback = option;
      } else {
        params.fromBlock = option.fromBlock ? option.fromBlock : 0;
        params.toBlock = option.toBlock ? option.toBlock : 'latest';
      }
    }

    if (callback) {
      callback = utils.wrapCallback(callback);
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getScOwner
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScOwner
  * @apiVersion 1.2.1
  * @apiDescription Get the owner of the specified contract from the specified chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} scAddr The token contract address for the specified token.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScOwner","params":{"chainType":"WAN", "scAddr": "0x59adc38f0b3f64fb542b50e3e955e7a8c1eb3e3b"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getScOwner('WAN', '0x59adc38f0b3f64fb542b50e3e955e7a8c1eb3e3b', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getScOwner('WAN', '0x59adc38f0b3f64fb542b50e3e955e7a8c1eb3e3b');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0xbb8703ca8226f411811dd16a3f1a2c1b3f71825d"
  *
  */
  getScOwner(chainType, scAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getScOwner';
    let params = { chainType: chainType, scAddr: scAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getCoin2WanRatio
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getCoin2WanRatio
  * @apiVersion 1.2.1
  * @apiDescription Coin exchange ratio,such as 1 ETH to 880 WANs in ICO period, the precision is 10000, the ratio is 880*precision = 880,0000. The ratio would be changed according to the market value ratio periodically.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} crossChain The cross-chain native coin name that you want to search, should be <code>"ETH"</code> or <code>"BTC"</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getCoin2WanRatio","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getCoin2WanRatio('ETH', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getCoin2WanRatio('ETH');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "20"
  *
  */
  getCoin2WanRatio(crossChain, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getCoin2WanRatio';
    let params = { crossChain: crossChain };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getUTXO
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getUTXO
  * @apiVersion 1.2.1
  * @apiDescription Get the detail BTC UTXO info for BTC.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"BTC"</code>.
  * @apiParam {number} minconf The min confirm number of BTC UTXO, usually 0.
  * @apiParam {number} maxconf The max confirm number of BTC UTXO, usually the confirmed blocks you want to wait for the UTXO.
  * @apiParam {array} address The address array that you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getUTXO","params":{"chainType":"BTC", "minconf":0, "maxconf":100, "address":["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getUTXO('BTC', 0, 100, ["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getUTXO('BTC', 0, 100, ["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [{
     "txid": "302588f81dc5ad7972d3affc781adc6eb326227a6feda53a990e9b98b715edcc",
     "vout": 0,
     "address": "n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R",
     "account": "",
     "scriptPubKey": "76a914ec8626d9aa394317659a45cfcbd1f0762126c5e888ac",
     "amount": 0.079,
     "confirmations": 16,
     "spendable": false,
     "solvable": false,
     "safe": true,
     "value": 0.079
  * }]
  *
  */
  getUTXO(chainType, minconf, maxconf, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getUTXO';
    let params = { chainType: chainType, minconf: minconf, maxconf: maxconf, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getOpReturnOutputs
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getOpReturnOutputs
  * @apiVersion 1.2.1
  * @apiDescription Get the vout with OP_RETURN info for BTC.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"BTC"</code>.
  * @apiParam {object} options Optional:
  * <br>&nbsp;&nbsp;<code>address</code> - Optional, the address array that you want to search.
  * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
  * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getOpReturnOutputs","params":{"chainType":"BTC", "address":["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getOpReturnOutputs('BTC',{address:["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]}, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getOpReturnOutputs('BTC', {address:["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]});
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  * [{
      "txid": "2c7a583b84fe0732fe17017bf0b17437bb5dcdad3ca8a8d661e86be666c33cc0",
      "height": 101641,
      "vout": [
        {
          "scriptPubKey": {
            "addresses": [
              "mzW2hdZN2um7WBvTDerdahKqRgj3md9C29"
            ],
            "asm": "04ffd03de44a6e11b9917f3a29f9443283d9871c9d743ef30d5eddcd37094b64d1b3d8090496b53256786bf5c82932ec23c3b74d9f05a6f95a8b5529352656664b OP_CHECKSIG",
            "hex": "4104ffd03de44a6e11b9917f3a29f9443283d9871c9d743ef30d5eddcd37094b64d1b3d8090496b53256786bf5c82932ec23c3b74d9f05a6f95a8b5529352656664bac",
            "reqSigs": 1,
            "type": "pubkey"
          },
          "value": 0.49743473,
          "index": 1
        },
        {
          "scriptPubKey": {
            "asm": "OP_RETURN f25ce69be9489038099442ed615ca8b0003330821c2804f2763c7a8e72274d1c0000000000000a00",
            "hex": "6a28f25ce69be9489038099442ed615ca8b0003330821c2804f2763c7a8e72274d1c0000000000000a00",
            "type": "nulldata"
          },
          "value": 0,
          "index": 2
        }
      ]
    },
    ... ...
  ]
  *
  */
  getOpReturnOutputs(chainType, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getOpReturnOutputs';
    let params = { chainType: chainType, ...options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getStoremanGroups
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroups
  * @apiVersion 1.2.1
  * @apiDescription Get the detailed cross-chain storemanGroup info for one cross-chain native coin, like the quota, etc.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} crossChain The cross-chain name that you want to search, should be <code>"ETH"</code> or <code>"BTC"</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getStoremanGroups","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getStoremanGroups('ETH', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getStoremanGroups('ETH');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [{
     "wanAddress": "0x06daa9379cbe241a84a65b217a11b38fe3b4b063",
     "ethAddress": "0x41623962c5d44565de623d53eb677e0f300467d2",
     "deposit": "128000000000000000000000",
     "txFeeRatio": "10",
     "quota": "400000000000000000000",
     "inboundQuota": "290134198386719012352",
     "outboundQuota": "85607176846820246993",
     "receivable": "80000000000000000",
     "payable": "24178624766460740655",
     "debt": "109785801613280987648"
  * }]
  *
  */
  getStoremanGroups(crossChain, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroups';
    let params = { crossChain: crossChain };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTokenStoremanGroups
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenStoremanGroups
  * @apiVersion 1.2.1
  * @apiDescription Get the detail cross-chain storemanGroup info for one specific token contract, like the quota, etc.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} crossChain The cross-chain name that you want to search, should be <code>"ETH"</code> or <code>"EOS"</code>.
  * @apiParam {string} tokenScAddr The token contract address for the specified token.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTokenStoremanGroups","params":{"crossChain":"ETH", "tokenScAddr":"0x00f58d6d585f84b2d7267940cede30ce2fe6eae8"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTokenStoremanGroups('ETH', '0x00f58d6d585f84b2d7267940cede30ce2fe6eae8', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTokenStoremanGroups('ETH', '0x00f58d6d585f84b2d7267940cede30ce2fe6eae8');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [{
     "tokenOrigAddr": "0xdbf193627ee704d38495c2f5eb3afc3512eafa4c",
     "smgWanAddr": "0x765854f97f7a3b6762240c329331a870b65edd96",
     "smgOrigAddr": "0x38b6c9a1575c90ceabbfe31b204b6b3a3ce4b3d9",
     "wanDeposit": "5000000000000000000000",
     "quota": "10000000000000000000000",
     "txFeeRatio": "1",
     "inboundQuota": "9999500000000000000000",
     "outboundQuota": "500000000000000000",
     "receivable": "0",
     "payable": "0",
     "debt": "500000000000000000"
   }]
  *
  */
  getTokenStoremanGroups(crossChain, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenStoremanGroups';
    let params = { crossChain: crossChain, tokenScAddr: tokenScAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getGasPrice
  * @apiGroup Status
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getGasPrice
  * @apiVersion 1.2.1
  * @apiDescription Get the current gas price in wei as bigNumber type.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getGasPrice","params":{"chainType":"WAN"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getGasPrice('WAN', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getGasPrice('WAN');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "180000000000"
  *
  */
  getGasPrice(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getGasPrice';
    let params = { chainType: chainType};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getBalance
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBalance
  * @apiVersion 1.2.1
  * @apiDescription Get balance for a single address.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} address The account being queried.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getBalance","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","chainType":"WAN"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getBalance('WAN', '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getBalance('WAN', '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "10000000000000000000000"
  *
  */
  getBalance(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getBalance';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getMultiBalances
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiBalances
  * @apiVersion 1.2.1
  * @apiDescription Get balance for multiple Addresses in a single call.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {array} addressArray An array of addresses being queried.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getMultiBalances","params":{"address": ["0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","0x2cc79fa3b80c5b9b02051facd02478ea88a78e2d"],"chainType":"WAN"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getMultiBalances('WAN', ["0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","0x2cc79fa3b80c5b9b02051facd02478ea88a78e2d"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getMultiBalances('WAN', ["0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","0x2cc79fa3b80c5b9b02051facd02478ea88a78e2d"]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
  *    "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c": "10000000000000000000000",
  *    "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2d": "0"
  *  }
  *
  */
  getMultiBalances(chainType, addrArray, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMultiBalances';
    let params = { chainType: chainType, address: addrArray };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTokenBalance
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenBalance
  * @apiVersion 1.2.1
  * @apiDescription Get token balance for a single address of a specified token on Wanchain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>, default: <code>'WAN'</code>.
  * @apiParam {string} address The account being queried.
  * @apiParam {string} tokenScAddr The token contract address for specified token. I.e., If chainType is <code>'WAN'</code>, it should be the token address for <code>"WETH"</code> or <code>"WBTC"</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTokenBalance","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTokenBalance("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTokenBalance("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "10000000000000000000000"
  *
  */
  getTokenBalance(chainType, address, tokenScAddr, symbol, callback) {
    if (symbol && typeof(symbol) === "function") {
      callback = symbol;
      symbol = undefined;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }

    let method = 'getTokenBalance';
    let params = { chainType: chainType, address: address, tokenScAddr: tokenScAddr };
    if (symbol) {
      params.symbol = symbol;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getMultiTokenBalance
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiTokenBalance
  * @apiVersion 1.2.1
  * @apiDescription Gets token balance for multiple addresses of specified token on Wanchain in a single call.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>, default: <code>'WAN'</code>.
  * @apiParam {array} addressArray An array of addresses being queried.
  * @apiParam {string} tokenScAddr The token contract address for specified token. I.e., If chainType is <code>'WAN'</code>, it should be the token address for <code>"WETH"</code> or <code>"WBTC"</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getMultiTokenBalance","params":{"address": ["0xfac95c16da814d24cc64b3186348afecf527324f","0xfac95c16da814d24cc64b3186348afecf527324e"],"tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getMultiTokenBalance("WAN", ["0xfac95c16da814d24cc64b3186348afecf527324f","0xfac95c16da814d24cc64b3186348afecf527324e"], "0x63eed4943abaac5f43f657d8eec098ca6d6a546e", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getMultiTokenBalance("WAN", ["0xfac95c16da814d24cc64b3186348afecf527324f","0xfac95c16da814d24cc64b3186348afecf527324e"], "0x63eed4943abaac5f43f657d8eec098ca6d6a546e");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
  *    "0xfac95c16da814d24cc64b3186348afecf527324f": "10000000000000000000000",
  *    "0xfac95c16da814d24cc64b3186348afecf527324e": "0"
  *  }
  *
  */
  getMultiTokenBalance(chainType, addrArray, tokenScAddr, symbol, callback) {
    if (symbol && typeof(symbol) === "function") {
      callback = symbol;
      symbol = undefined;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMultiTokenBalance';
    let params = { chainType: chainType, address: addrArray, tokenScAddr: tokenScAddr };
    if (symbol) {
      params.symbol = symbol;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTokenSupply
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenSupply
  * @apiVersion 1.2.1
  * @apiDescription Get total amount of certain token on Wanchain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>, default: <code>'WAN'</code>.
  * @apiParam {string} tokenScAddr The token contract address for the specified token.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTokenSupply","params":{"tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  * or
  * {"jsonrpc":"2.0","method":"getTokenSupply","params":{"chainType":"WAN", "tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTokenSupply("WAN", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTokenSupply("WAN", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "30000000000000000000000"
  *
  */
  getTokenSupply(chainType, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenSupply';
    let params = { chainType: chainType, tokenScAddr: tokenScAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getNonce
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getNonce
  * @apiVersion 1.2.1
  * @apiDescription Get the nonce of an account.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} address The account being queried.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getNonce","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","chainType":"WAN"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getNonce("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getNonce("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0x0"
  *
  */
  getNonce(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getNonce';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getNonceIncludePending
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getNonceIncludePending
  * @apiVersion 1.2.1
  * @apiDescription Get the pending nonce of an account.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} address The account being queried.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getNonceIncludePending","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","chainType":"WAN"}, "id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getNonceIncludePending("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getNonceIncludePending("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0x0"
  *
  */
  getNonceIncludePending(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getNonceIncludePending';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getBlockNumber
  * @apiGroup Blocks
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockNumber
  * @apiVersion 1.2.1
  * @apiDescription Get the current latest block number.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code> or <code>"BTC"</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getBlockNumber","params":{"chainType":"WAN"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getBlockNumber("WAN", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getBlockNumber("WAN");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "119858"
  *
  */
  getBlockNumber(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getBlockNumber';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName sendRawTransaction
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY sendRawTransaction
  * @apiVersion 1.2.1
  * @apiDescription Submit a pre-signed transaction for broadcast to certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code> or <code>"BTC"</code>.
  * @apiParam {string} signedTx The signedTx you want to send.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"sendRawTransaction","params":{"chainType":"WAN", "signedTx":"0xf86e0109852e90edd000832dc6c0946ed9c11cbd8a6ae8355fa62ebca48493da572661880de0b6b3a7640000801ca0bd349ec9f51dd171eb5c59df9a6b8c5656eacb6793bed945a7ec69135f191abfa0359da11e8a4fdd51b52a8752ac32f9125d168441546d011406736bce67b8a356"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.sendRawTransaction('WAN', '0xf86e0109852e90edd000832dc6c0946ed9c11cbd8a6ae8355fa62ebca48493da572661880de0b6b3a7640000801ca0bd349ec9f51dd171eb5c59df9a6b8c5656eacb6793bed945a7ec69135f191abfa0359da11e8a4fdd51b52a8752ac32f9125d168441546d011406736bce67b8a356', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.sendRawTransaction('WAN', '0xf86e0109852e90edd000832dc6c0946ed9c11cbd8a6ae8355fa62ebca48493da572661880de0b6b3a7640000801ca0bd349ec9f51dd171eb5c59df9a6b8c5656eacb6793bed945a7ec69135f191abfa0359da11e8a4fdd51b52a8752ac32f9125d168441546d011406736bce67b8a356');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"
  *
  */
  sendRawTransaction(chainType, signedTx, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'sendRawTransaction';
    let params = { chainType: chainType, signedTx: signedTx };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTxInfo
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTxInfo
  * @apiVersion 1.2.1
  * @apiDescription Get the transaction detail via txHash on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code> or <code>"BTC"</code>.
  * @apiParam {string} txHash The txHash you want to search.
  * @apiParam {object} [options] Optional.
  * <br>&nbsp;&nbsp;<code>format</code> - Whether to get the serialized or decoded transaction, in this case, the <code>chainType</code> should be <code>"BTC"</code>:
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;
  * Set to <code>false</code> (the default) to return the serialized transaction as hex.
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;
  * Set to <code>true</code> to return a decoded transaction.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTxInfo","params":{"chainType":"WAN", "txHash":"0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTxInfo("WAN", "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTxInfo("WAN", "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
      "txType": "0x1",
      "blockHash": "0xcb76ea6649d801cc45294f4d0858bad1ca0c2b169b20c4beae2852c57a7f69c9",
      "blockNumber": 1137680,
      "from": "0xed1baf7289c0acef52db0c18e1198768eb06247e",
      "gas": 1000000,
      "gasPrice": "320000000000",
      "hash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da",
      "input": "0x642b273754657374206d6573736167650000000000000000000000000000000000000000",
      "nonce": 26,
      "to": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
      "transactionIndex": 0,
      "value": "0",
      "v": "0x1b",
      "r": "0xe3a5a5d73d0b6512676723bc4bab4f7ffe01476f8cbc9631976890e175d487ac",
      "s": "0x3a79e17290fe2a9f4e5b5c5431eb322882729d68ca0d736c5d9b1f3285c9169e"
    }
  *
  */
  getTxInfo(chainType, txHash, options, callback) {
    let method = 'getTxInfo';

    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }

    let params = { chainType: chainType, txHash: txHash, ...options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getBlockByNumber
  * @apiGroup Blocks
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockByNumber
  * @apiVersion 1.2.1
  * @apiDescription Get the block information about a block by block number on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code>.
  * @apiParam {number} blockNumber The blockNumber you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getBlockByNumber","params":{"chainType":"WAN", "blockNumber":"670731"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getBlockByNumber("WAN", "670731", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getBlockByNumber("WAN", "670731");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
      "size": 727,
      "timestamp": 1522575814,
      "transactions": ["0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"],
      "uncles": [],
      "difficulty": "5812826",
      "extraData": "0xd783010004846765746887676f312e392e32856c696e75780000000000000000de43ad982c5ccfa922f701d9ac91d47ceaaeeea7e1cc092b1ff6c3c5dcce70a07cf5a79886ff0cc02254ec0de51f1a6881a69a38cd2866a5c0dddbe0dd0f2ce301",
      "gasLimit": 4712388,
      "gasUsed": 21000,
      "hash": "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8",
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "miner": "0x321a210c019790308abb948360d144e7e00b7dc5",
      "mixHash": "0x691299af763a758e94200545b8a5fe9d4f2cedbbfea031a1bbc540cbde4631d1",
      "nonce": "0x2c8dd099eda5b188",
      "number": 670731,
      "parentHash": "0xd907820c7a46ba668a7e5bda8c6a23ec250877b853a85d8343688337f967b2d9",
      "receiptsRoot": "0x056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2",
      "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
      "stateRoot": "0xafbfae425a7fed863662f88d64819132079b43ac4d85988ab6cce7f9342348af",
      "totalDifficulty": "3610551057115",
      "transactionsRoot": "0x96fc902544191c38f1c9a2725ea2ae29e34246fb4e95728f3e72added7c9574b"
    }
  *
  */
  getBlockByNumber(chainType, blockNumber, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getBlockByNumber';
    let params = { chainType: chainType, blockNumber: blockNumber };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getBlockByHash
  * @apiGroup Blocks
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockByHash
  * @apiVersion 1.2.1
  * @apiDescription Get the block information about a block by block hash on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code>.
  * @apiParam {string} blockHash The blockHash you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getBlockByHash","params":{"chainType":"WAN", "blockHash":"0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getBlockByHash("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getBlockByHash("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
      "size": 727,
      "timestamp": 1522575814,
      "transactions": ["0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"],
      "uncles": [],
      "difficulty": "5812826",
      "extraData": "0xd783010004846765746887676f312e392e32856c696e75780000000000000000de43ad982c5ccfa922f701d9ac91d47ceaaeeea7e1cc092b1ff6c3c5dcce70a07cf5a79886ff0cc02254ec0de51f1a6881a69a38cd2866a5c0dddbe0dd0f2ce301",
      "gasLimit": 4712388,
      "gasUsed": 21000,
      "hash": "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8",
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "miner": "0x321a210c019790308abb948360d144e7e00b7dc5",
      "mixHash": "0x691299af763a758e94200545b8a5fe9d4f2cedbbfea031a1bbc540cbde4631d1",
      "nonce": "0x2c8dd099eda5b188",
      "number": 670731,
      "parentHash": "0xd907820c7a46ba668a7e5bda8c6a23ec250877b853a85d8343688337f967b2d9",
      "receiptsRoot": "0x056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2",
      "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
      "stateRoot": "0xafbfae425a7fed863662f88d64819132079b43ac4d85988ab6cce7f9342348af",
      "totalDifficulty": "3610551057115",
      "transactionsRoot": "0x96fc902544191c38f1c9a2725ea2ae29e34246fb4e95728f3e72added7c9574b"
    }
  *
  */
  getBlockByHash(chainType, blockHash, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getBlockByHash';
    let params = { chainType: chainType, blockHash: blockHash };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getBlockTransactionCount
  * @apiGroup Blocks
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockTransactionCount
  * @apiVersion 1.2.1
  * @apiDescription Get the number of transaction in a given block by block number or block hash on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code>.
  * @apiParam {string} blockHashOrBlockNumber The blockHash or the blockNumber you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getBlockTransactionCount","params":{"chainType":"WAN", "blockNumber":"670731"},"id":1}
  * or
  * {"jsonrpc":"2.0","method":"getBlockTransactionCount","params":{"chainType":"WAN", "blockHash":"0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getBlockTransactionCount("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8", (err, result) => {
  *   // apiTest.getBlockTransactionCount("WAN", "670731", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getBlockTransactionCount("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8");
  *   // let result = await apiTest.getBlockTransactionCount("WAN", "670731");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   1
  *
  */
  getBlockTransactionCount(chainType, blockHashOrBlockNumber, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getBlockTransactionCount';
    let params = {};
    if (this.checkHash(blockHashOrBlockNumber)) {
        params = { chainType: chainType, blockHash: blockHashOrBlockNumber };
    } else {
        params = { chainType: chainType, blockNumber: blockHashOrBlockNumber };
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTransactionConfirm
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransactionConfirm
  * @apiVersion 1.2.1
  * @apiDescription Get the transaction mined result on certain chain.
  * When the receipt not existed, return directly with 'no receipt was found';
  * If receipt existed, the receipt will be returned after confirm-block-number blocks.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {number} waitBlocks The confirm-block-number you want to set.
  * @apiParam {string} txHash The txHash you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransactionConfirm","params":{"chainType":"WAN", "waitBlocks": 6, "txHash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTransactionConfirm("WAN", 6, "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTransactionConfirm("WAN", 6, "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
      "blockHash": "0xcb76ea6649d801cc45294f4d0858bad1ca0c2b169b20c4beae2852c57a7f69c9",
      "blockNumber": 1137680,
      "contractAddress": null,
      "cumulativeGasUsed": 29572,
      "from": "0xed1baf7289c0acef52db0c18e1198768eb06247e",
      "gasUsed": 29572,
      "logs": [{
        "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
        "topics": ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000005"],
        "data": "0x54657374206d6573736167650000000000000000000000000000000000000000",
        "blockNumber": 1137680,
        "transactionHash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da",
        "transactionIndex": 0,
        "blockHash": "0xcb76ea6649d801cc45294f4d0858bad1ca0c2b169b20c4beae2852c57a7f69c9",
        "logIndex": 0,
        "removed": false
      }],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000001000000800000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000200000000000",
      "status": "0x1",
      "to": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
      "transactionHash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da",
      "transactionIndex": 0
    }
  *
  */
  getTransactionConfirm(chainType, waitBlocks, txHash, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransactionConfirm';
    let params = { chainType: chainType, waitBlocks: waitBlocks, txHash: txHash, ...options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTransactionReceipt
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransactionReceipt
  * @apiVersion 1.2.1
  * @apiDescription Get the receipt of a transaction by transaction hash on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} txHash The txHash you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransactionReceipt","params":{"chainType":"WAN", "txHash":"0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTransactionReceipt("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTransactionReceipt("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
      "logs": [],
      "blockHash": "0x18198d5e42859067db405c9144306f7da87210a8604aac66ef6759b14a199d6b",
      "blockNumber": 2548378,
      "contractAddress": null,
      "cumulativeGasUsed": 21000,
      "from": "0xdcfffcbb1edc98ebbc5c7a6b3b700a6748eca3b0",
      "gasUsed": 21000,
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "status": "0x1",
      "to": "0x157908807e95f864284e84cc5d307ce6f3574532",
      "transactionHash": "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe",
      "transactionIndex": 0
    }
  *
  */
  getTransactionReceipt(chainType, txHash, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransactionReceipt';
    let params = { chainType: chainType, txHash: txHash, ...options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTransByBlock
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransByBlock
  * @apiVersion 1.2.1
  * @apiDescription Get transaction information in a given block by block number or block hash on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code>.
  * @apiParam {string} blockHashOrBlockNumber The blockHash or the blockNumber you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransByBlock","params":{"chainType":"WAN", "blockNumber":"984133"},"id":1}
  * or
  * {"jsonrpc":"2.0","method":"getTransByBlock","params":{"chainType":"WAN", "blockHash":"0xaa0fc2a8a868566f2e4888b2942ec05c47c2254e8b81e43d3ea87420a09126c2"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTransByBlock("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe", (err, result) => {
  *   // apiTest.getTransByBlock("WAN", "984133", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTransByBlock("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe");
  *   //let result = await apiTest.getTransByBlock("WAN", "984133");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [{
      "blockNumber": 984133,
      "gas": 4700000,
      "nonce": 414,
      "transactionIndex": 0,
      "txType": "0x1",
      "blockHash": "0xaa0fc2a8a868566f2e4888b2942ec05c47c2254e8b81e43d3ea87420a09126c2",
      "from": "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d",
      "gasPrice": "180000000000",
      "hash": "0x2c6dee69c9cc5676484d80d173d683802a4f761d5785a694b4262fbf39dff8fe",
      "input": "0xfdacd5760000000000000000000000000000000000000000000000000000000000000002",
      "to": "0x92e8ae701cd081ae8f0cb03dcae2e57b9b261667",
      "value": "0",
      "v": "0x29",
      "r": "0x1c1ad7e8ee64fc284adce0910d6f811933af327b20cb8adba392a1b24a15054f",
      "s": "0x690785383bed28c9a951b30329a066cb78062f63febf5aa1ca7e7ef62a2108cb"
    }]
  *
  */
  getTransByBlock(chainType, blockHashOrBlockNumber, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransByBlock';
    let params = {};
    if (this.checkHash(blockHashOrBlockNumber)) {
        params = { chainType: chainType, blockHash: blockHashOrBlockNumber };
    } else {
        params = { chainType: chainType, blockNumber: blockHashOrBlockNumber };
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTransByAddress
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransByAddress
  * @apiVersion 1.2.1
  * @apiDescription Get transaction information via the specified address on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code>.
  * @apiParam {string} address The account's address that you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransByAddress","params":{"chainType":"WAN", "address":"0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTransByAddress("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTransByAddress("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [{
      "blockNumber": 1004796,
      "gas": 90000,
      "nonce": 505,
      "transactionIndex": 0,
      "txType": "0x1",
      "blockHash": "0x604e45aa6b67b1957ba793e534878d94bfbacd38eed2eb51990de097595a334e",
      "from": "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d",
      "gasPrice": "180000000000",
      "hash": "0x353545658d513ff4fe1db9b0f979a24a831ae0949b37bc1afefc8179fc29b358",
      "input": "0x",
      "to": "0x8fbc408bef86476e3098dc539762d4021092bbde",
      "value": "100000000000000000000",
      "v": "0x2a",
      "r": "0xbe8f287930782cff4d2e12e4a55c46765b610b88d13bc1a060a4565f3316e933",
      "s": "0x7a297e96c54fffd124833462e03725ea8d168465d34a3e577afbaa9d05a99cd0"
    }, {
      "blockNumber": 1004818,
      "gas": 21000,
      "nonce": 0,
      "transactionIndex": 0,
      "txType": "0x1",
      "blockHash": "0xbb5769654036fdb768ede5b1a172298d408808e7dcb78a82b3c8d5ef32fc67cb",
      "from": "0x8fbc408bef86476e3098dc539762d4021092bbde",
      "gasPrice": "200000000000",
      "hash": "0xee3371655a53e6d413c3b9d570fee8852989554989fde51136cf3b9c672e272d",
      "input": "0x",
      "to": "0xc68b75ca4e4bf0b71e3594452a5e47b11d287724",
      "value": "1000000000000000000",
      "v": "0x2a",
      "r": "0x4341dcd4156050b664b9c977644756201a6357c7b12e5db86b370a38b1ed6dfb",
      "s": "0x43b380fc67394e8b9483af97f5de067ef6617b17cfaa75517f07ec8d166f3c65"
    }]
  *
  */
  getTransByAddress(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransByAddress';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTransByAddressBetweenBlocks
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransByAddressBetweenBlocks
  * @apiVersion 1.2.1
  * @apiDescription Get transaction information via the specified address between the specified startBlockNo and endBlockNo on certain chain.
  * <br>Comments:
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no <code>startBlockNo</code> given, <code>startBlockNo</code> will be set to 0;
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no <code>endBlockNo</code> given, <code>endBlockNo</code> will be set to the newest blockNumber.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code>.
  * @apiParam {string} address The account's address that you want to search.
  * @apiParam {number} startBlockNo The start block number that you want to search from.
  * @apiParam {number} endBlockNo The end block number that you want to search to.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransByAddressBetweenBlocks","params":{"chainType":"WAN", "address":"0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", "startBlockNo":984119, "endBlockNo":984120},"id":1}
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransByAddress","params":{"chainType":"WAN", "address":"0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTransByAddressBetweenBlocks("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", 984119, 984120, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTransByAddressBetweenBlocks("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", 984119, 984120);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [{
      "blockNumber": 984119,
      "gas": 4700000,
      "nonce": 407,
      "transactionIndex": 0,
      "txType": "0x1",
      "blockHash": "0xdf59acacabe8c1b64ca6ff611c629069731d9dae60f4b0cc753c4a0571ea7f27",
      "from": "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d",
      "gasPrice": "180000000000",
      "hash": "0xf4610446d836b95d577ba723e1df55258e4f602cfa26d5ada3b50fa2fe82b469",
      "input": "0x6060604052341561000f57600080fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506102d78061005e6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630900f01014610067578063445df0ac146100a05780638da5cb5b146100c9578063fdacd5761461011e575b600080fd5b341561007257600080fd5b61009e600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610141565b005b34156100ab57600080fd5b6100b3610220565b6040518082815260200191505060405180910390f35b34156100d457600080fd5b6100dc610226565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561012957600080fd5b61013f600480803590602001909190505061024b565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561021c578190508073ffffffffffffffffffffffffffffffffffffffff1663fdacd5766001546040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180828152602001915050600060405180830381600087803b151561020b57600080fd5b5af1151561021857600080fd5b5050505b5050565b60015481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102a857806001819055505b505600a165627a7a72305820de682f89b485041a9206a7304a95a151cd2363297029280359a4ca996dcaeda20029",
      "to": null,
      "value": "0",
      "v": "0x29",
      "r": "0xd14dfde02e305a945e6a09b6dbd5fe1f1bd5a6dc0721c15f72732aa10a3829b3",
      "s": "0x56923b20a15f02633295b415ae52161529d560580dfcd62a97bc394c841bea37"
    }]
  *
  */
  getTransByAddressBetweenBlocks(chainType, address, startBlockNo, endBlockNo, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransByAddressBetweenBlocks';
    let params = { chainType: chainType, address: address, startBlockNo: startBlockNo, endBlockNo: endBlockNo };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTransCount
  * @apiGroup Transactions
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransCount
  * @apiVersion 1.2.1
  * @apiDescription Get transaction count on certain chain.
  * <br>Comments:
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no <code>startBlockNo</code> given, <code>startBlockNo</code> will be set to 0;
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no <code>endBlockNo</code> given, <code>endBlockNo</code> will be set to the newest blockNumber.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code>, if <code>"ETH"</code>, only return the count about ETH-Cross transaction.
  * @apiParam {object} [options] Optional.
  * <br>&nbsp;&nbsp;<code>address</code> - The account's address that you want to search.
  * <br>&nbsp;&nbsp;<code>startBlockNo</code> - The start block number that you want to search from.
  * <br>&nbsp;&nbsp;<code>endBlockNo</code> - The end block number that you want to search to.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransCount","params":{"chainType":"WAN", "address":"0x0b80f69fcb2564479058e4d28592e095828d24aa", "startBlockNo":3607100, "endBlockNo":3607130},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTransCount("WAN", {"address":"0x0b80f69fcb2564479058e4d28592e095828d24aa", "startBlockNo":3607100, "endBlockNo":3607130}, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTransCount("WAN", {"address":"0x0b80f69fcb2564479058e4d28592e095828d24aa", "startBlockNo":3607100, "endBlockNo":3607130});
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   1
  *
  */
  getTransCount(chainType, option, callback) {
    if (option && typeof(option) === "function") {
      callback = option;
      option = undefined;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransCount';
    let params = { chainType: chainType };

    if (option && typeof (option.address) !== "undefined") {
      params["address"] = option.address;
    }
    if (option && typeof (option.startBlockNo) !== "undefined") {
      params["startBlockNo"] = option.startBlockNo;
    }
    if (option && typeof (option.endBlockNo) !== "undefined") {
      params["endBlockNo"] = option.endBlockNo;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getScVar
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScVar
  * @apiVersion 1.2.1
  * @apiDescription Get the specific public parameter value of one contract on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} scAddr The token contract address for the specified token.
  * @apiParam {string} name The name of the specific contract parameter.
  * @apiParam {array} abi The abi of the specific contract.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScVar","params":{"chainType": "WAN", "scAddr": "0x55ba61f4da3166487a804bccde7ee4015f609f45", "name": "addr", "abi": [/The Abi of the contracts/]},"id":1}
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransByAddress","params":{"chainType":"WAN", "address":"0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getScVar("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "addr", [/The Abi of the contracts/], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getScVar("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "addr", [/The Abi of the contracts/]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
  *
  */
  getScVar(chainType, scAddr, name, abi, version, callback) {
    if (typeof (version) === "function") {
      callback = version;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getScVar';
    let params = { chainType: chainType, scAddr: scAddr, name: name, abi: abi };
    if (typeof (version) === "function") {
     params.version = version;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getScMap
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScMap
  * @apiVersion 1.2.1
  * @apiDescription Get the specific public map value of one contract on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} scAddr The token contract address for the specified token.
  * @apiParam {string} name The name of the specific contract public map.
  * @apiParam {string} key The key of parameter of the specific contract public map.
  * @apiParam {array} abi The abi of the specific contract.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScMap","params":{"chainType": "WAN", "scAddr": "0x55ba61f4da3166487a804bccde7ee4015f609f45", "name": "mapAddr", "key": "", "abi": [/The Abi of the contracts/]},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getScMap("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "mapAddr", "key", [/The Abi of the contracts/], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getScMap("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "mapAddr", "key", [/The Abi of the contracts/]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
  *
  */
  getScMap(chainType, scAddr, name, key, abi, version, callback) {
    if (typeof (version) === "function") {
      callback = version;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getScMap';
    let params = { chainType: chainType, scAddr: scAddr, name: name, key: key, abi: abi };
    if (typeof (version) === "function") {
      params.version = version;
     }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName callScFunc
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY callScFunc
  * @apiVersion 1.2.1
  * @apiDescription Call the specific public function of one contract on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} scAddr The token contract address for the specified token.
  * @apiParam {string} name The name of the specific contract public function.
  * @apiParam {array} args The parameters array a of the specific contract public function.
  * @apiParam {array} abi The abi of the specific contract.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"callScFunc","params":{"chainType": "WAN", "scAddr": "0x55ba61f4da3166487a804bccde7ee4015f609f45", "name": "getPriAddress", "args": [], "abi": [/The Abi of the contracts/]},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.callScFunc("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "getPriAddress", [], [/The Abi of the contracts/]), (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.callScFunc("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "getPriAddress", [], [/The Abi of the contracts/]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0x8cc420e422b3fa1c416a14fc600b3354e3312524"
  *
  */  
  callScFunc(chainType, scAddr, name, args, abi, version, callback) {
    if (typeof (version) === "function") {
      callback = version;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'callScFunc';
    let params = { chainType: chainType, scAddr: scAddr, name: name, args: args, abi: abi };
    if (typeof (version) !== "function") {
      params.version = version;
     }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getP2shxByHashx
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getP2shxByHashx
  * @apiVersion 1.2.1
  * @apiDescription Get the x value of p2sh by hash(x) from BTC.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiIgnore Comment out this function
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"BTC"</code>.
  * @apiParam {string} hashX The certain hashX that you want to search.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getP2shxByHashx","params":{"chainType":"BTC","hashx":"d2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getP2shxByHashx("BTC", "d2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getP2shxByHashx("BTC", "d2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "2ecb855170c941f239ffe3495f3e07cceabd8421"
  *
  */
  //Get the x value of p2sh by hash(x) from BTC
  getP2shxByHashx(chainType, hashX, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getP2shxByHashx';
    let params = { chainType: chainType, hashX: hashX };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName importAddress
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY importAddress
  * @apiVersion 1.2.1
  * @apiDescription Send a <code>'import address'</code> command to BTC.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"BTC"</code>.
  * @apiParam {string} address The BTC account address you want to import to the node to scan transactions.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"importAddress","params":{"chainType":"BTC","address":"mmmmmsdfasdjflaksdfasdf"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.importAddress("BTC", "mmmmmsdfasdjflaksdfasdf", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.importAddress("BTC", "mmmmmsdfasdjflaksdfasdf");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "success"
  *
  */
  importAddress(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'importAddress';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName estimateSmartFee
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY estimateSmartFee
  * @apiVersion 1.2.1
  * @apiDescription Query a <code>'estimatesmartfee'</code> command to BTC.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"BTC"</code>.
  * @apiParam {object} options Optional:
  * <br>&nbsp;&nbsp;<code>target</code> - The numeric of confirmation target in blocks (1 - 1008).
  * <br>&nbsp;&nbsp;<code>mode</code> - The string of fee estimate mode.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   * @apiIgnore Comment out this function
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"estimateSmartFee","params":{"chainType":"BTC"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.estimateSmartFee("BTC", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.estimateSmartFee("BTC");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "success"
  *
  */
 estimateSmartFee(chainType, options, callback) {
  if (typeof(options) === "function") {
    callback = options;
    options = {};
  }
  if (!options || typeof(options) !== "object") {
    options = {};
  }
  if (callback) {
    callback = utils.wrapCallback(callback);
  }
  let method = 'estimateSmartFee';
  let params = {chainType: chainType, ...options};

  return utils.promiseOrCallback(callback, cb => {
    this._request(method, params, (err, result) => {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
    });
  });
}

  /**
  *
  * @apiName getRegTokens
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegTokens
  * @apiVersion 1.2.1
  * @apiDescription Get the information of tokens which are supported for cross-chain ability.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} crossChain The cross-chain name that you want to search, should be <code>"ETH"</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getRegTokens","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getRegTokens("ETH", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getRegTokens("ETH");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  [
  *    {
  *      "tokenOrigAddr": "0x54950025d1854808b09277fe082b54682b11a50b",
  *      "tokenWanAddr": "0x67f3de547c7f3bc77095686a9e7fe49397e59cdf",
  *      "ratio": "15000000",
  *      "minDeposit": "10000000000000000000",
  *      "origHtlc": "0x149f1650f0ff097bca88118b83ed58fb1cfc68ef",
  *      "wanHtlc": "0x27feb1785f61504619a105faa00f57c49cc4d9c3",
  *      "withdrawDelayTime": "259200",
  *      "tokenHash": "0xe6bb4913c8cfb38d44a01360bb7874c58812e14b9154543bb67783e611e0475b",
  *      "name": "Wanchain MKR Crosschain Token",
  *      "symbol": "MKR",
  *      "decimals": "18",
  *      "iconData": "/9j/4AAQ...",
  *      "iconType": "jpg"
  *    },
  *    {
  *      "tokenOrigAddr": "0xdbf193627ee704d38495c2f5eb3afc3512eafa4c",
  *      "tokenWanAddr": "0xda16e66820a3c64c34f2b35da3f5e1d1742274cb",
  *      "ratio": "20000",
  *      "minDeposit": "10000000000000000000",
  *      "origHtlc": "0x149f1650f0ff097bca88118b83ed58fb1cfc68ef",
  *      "wanHtlc": "0x27feb1785f61504619a105faa00f57c49cc4d9c3",
  *      "withdrawDelayTime": "259200",
  *      "tokenHash": "0x0cfee48dd8c8e32ad342c0f4ee723df9c2818d02734e28897ad0295bb458d4bc",
  *      "name": "Wanchain SAI Crosschain Token",
  *      "symbol": "SAI",
  *      "decimals": "18",
  *      "iconData": "/9j/4AAQ...",
  *      "iconType": "jpg"
  *    },
  *   ... ...
  *  ]
  *
  */
  getRegTokens(crossChain, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRegTokens';
    let params = { crossChain: crossChain };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTokenAllowance
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenAllowance
  * @apiVersion 1.2.1
  * @apiDescription Get the token allowance for one specific account on one contract for one specific spender account on a certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} tokenScAddr The token contract address for the specified token.
  * @apiParam {string} ownerAddr The owner address on the specified contract.
  * @apiParam {string} spenderAddr The spender address on the specified contract.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTokenAllowance","params":{"chainType":"ETH", "tokenScAddr":"0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "ownerAddr":"0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "spenderAddr":"0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTokenAllowance("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTokenAllowance("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "999999999999980000000000000"
  *
  */
  getTokenAllowance(chainType, tokenScAddr, ownerAddr, spenderAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenAllowance';
    let params = { chainType: chainType, tokenScAddr: tokenScAddr, ownerAddr: ownerAddr, spenderAddr: spenderAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTokenInfo
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenInfo
  * @apiVersion 1.2.1
  * @apiDescription Get the info of token contract, like symbol and decimals, on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} tokenScAddr The token contract address for the specified token.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTokenInfo","params":{"chainType":"ETH", "tokenScAddr":"0xc5bc855056d99ef4bda0a4ae937065315e2ae11a"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTokenInfo("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getTokenInfo("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
  *    "symbol": "WCT",
  *    "decimals": "18"
  *  }
  */
  getTokenInfo(chainType, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenInfo';
    let params = { chainType: chainType, tokenScAddr: tokenScAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getMultiTokenInfo
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiTokenInfo
  * @apiVersion 1.2.1
  * @apiDescription Get the information for multiple tokens.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {array} tokenScAddrArray The token address array for the tokens that you want to query.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getMultiTokenInfo","params":{"tokenScAddrArray":["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"],"chainType":"ETH"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getMultiTokenInfo("ETH", ["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getMultiTokenInfo("ETH", ["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
     "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a": {
       "symbol": "WCT",
       "decimals": "18"
     },
     "0x7017500899433272b4088afe34c04d742d0ce7df": {
       "symbol": "WCT_One",
       "decimals": "18"
     }
   }
  *
  */
  getMultiTokenInfo(chainType, tokenScAddrArray, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMultiTokenInfo';
    let params = { chainType: chainType, tokenScAddrArray: tokenScAddrArray };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getToken2WanRatio
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getToken2WanRatio
  * @apiVersion 1.2.1
  * @apiDescription Token exchange ratio,such as 1 token to 880 WANs, the precision is 10000, the ratio is 880*precision = 880,0000. The ratio would be changed accoring to the market value ratio periodically.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} crossChain The cross-chain name that you want to search, should be <code>"ETH"</code>.
  * @apiParam {string} tokenScAddr The token contract address for the specified token.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getToken2WanRatio","params":{"crossChain":"ETH", "tokenScAddr":"0x00f58d6d585f84b2d7267940cede30ce2fe6eae8"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getToken2WanRatio("ETH", "0x00f58d6d585f84b2d7267940cede30ce2fe6eae8", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getToken2WanRatio("ETH", "0x00f58d6d585f84b2d7267940cede30ce2fe6eae8");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "3000"
  *
  */
  getToken2WanRatio(crossChain, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getToken2WanRatio';
    let params = { crossChain: crossChain, tokenScAddr: tokenScAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getOTAMixSet
  * @apiGroup PrivateTrans
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getOTAMixSet
  * @apiVersion 1.2.1
  * @apiDescription Returns an array about OTA mix set.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} otaAddress OtaAddress
  * @apiParam {string} number privateTx:ringSize.
  * @apiParam {string} chainType Optional, the chain being queried. Currently supports <code>'WAN'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getOTAMixSet","params":{"otaAddress":"0x02539dD49A75d6Cf4c5cc857bc87BC3836E74F1c845A08eC5E009A4dCa59D47C7c0298697d22cfa7d35A670B45C3531ea9D3aAc39E58c929d440Ac1392BDeB8926e7","number":8},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getOTAMixSet("0x02539dD49A75d6Cf4c5cc857bc87BC3836E74F1c845A08eC5E009A4dCa59D47C7c0298697d22cfa7d35A670B45C3531ea9D3aAc39E58c929d440Ac1392BDeB8926e7", 8, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getOTAMixSet("0x02539dD49A75d6Cf4c5cc857bc87BC3836E74F1c845A08eC5E009A4dCa59D47C7c0298697d22cfa7d35A670B45C3531ea9D3aAc39E58c929d440Ac1392BDeB8926e7", 8);
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [ '0x02a0ab76c74fc379743bdc958d806c9062f3fc68b097fe8e91453d7324f7ae648702a20af02d1fe495036b38ab8c44b5676c1c0158f0057b6500150374b6f19ab2ba',
  '0x020317c92daac5ad9cc5377bc4f493197772e9459fb737e1c26c7e6f030f21b7d002c5d50ef420e818f58c87a3f57cb1167adf268911021e9d0c3cf9aea7e06ac1ad',
  '0x02c6fa830d978e20bff8e993356d3456aa6c6f1dab966d20953bac55b7526ab0f203719139be2bc3660a8841fcf3d34d9043693e48b6cfebeaa4447cb1d72f809139',
  '0x03039ca6d4c95e75b7b6e131bf2af3d84b8d1807c34ed04fc637e57e45f5b590e503db2ce78d660ed6e230feb4ea91d8f7662315731d625d4a7d771cf82b686fb0a9',
  '0x03f0ee5da723151435e287a616e4502642315c9ed933569402ad0f838db0fd597a0325b3cb82275a6aa6cc1f1edc9675fc7201f5e9e589a34ed676f4400f2a081129',
  '0x038b3c1fada7710a519c4bb7929c8d08a8e9e17fcf7ea510043d00a6844a06155c02ec1e571a8f3a1471461cf74ecc4568d4009a3fc910c29c30bfdfb05f79924b12',
  '0x036d369b2a0e4fbd0e270c5d78e8fc53c1b0f1d58878f1a106812380325493fec3020f00e39b4e76169433289f92ee0fea44e1e0f26b87420c6f897489f6975621b6',
  '0x03bf32510e236f8bafd3127a3598f9c36f60612371f798ed766214183d1d2c3f1b027de375bc1112030300b843172f39031a735fc626f76e823e6b3e0367d89b269d' ]
  *
  */
  getOTAMixSet(address, number, chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getOTAMixSet';
    let params = { otaAddress: address, number:number };
    if (chainType) {
      if (typeof(chainType) === "function") {
        callback = chainType;
      } else {
        params.chainType = chainType;
      }
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName estimateGas
  * @apiGroup PrivateTrans
  * @api {CONNECT} /ws/v3/YOUR-API-KEY estimateGas
  * @apiVersion 1.2.1
  * @apiDescription Executes a message call or transaction and returns the amount of the gas used.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> or <code>'ETH'</code>.
  * @apiParam {object} txObject The transaction object see web3.eth.sendTransaction, with the difference that for calls the from property is optional as well.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"estimateGas","params":{"chainType":"WAN","from":"0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe","to":"0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe","value":"1000000000000000"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.estimateGas("WAN", {from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      value: '1000000000000000'}, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.estimateGas("WAN", {from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      value: '1000000000000000'});
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   21000
  *
  */
  estimateGas(chainType, txObject, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'estimateGas';

    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      Object.assign(params, txObject);
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getChainInfo
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getChainInfo
  * @apiVersion 1.2.1
  * @apiDescription Returns an object containing various details about the blockchain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getChainInfo","params":{"chainType":"EOS"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getChainInfo("EOS", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getChainInfo("EOS");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  {
  *     server_version: 'aa60b9ca',
  *     chain_id: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  *     head_block_num: 84031197,
  *     last_irreversible_block_num: 84030870,
  *     last_irreversible_block_id: '05023596ebe1b775a39a0ab380a0fd95bf435fbe9eccbf2b3e38c44a0cdc6a0d',
  *     head_block_id: '050236dd683c4f98c9f5965910bf941d67b8fe6469a149114a3f0053779461da',
  *     head_block_time: '2020-04-02T11:35:25.000',
  *     head_block_producer: 'five.cartel',
  *     virtual_block_cpu_limit: 500000000,
  *     virtual_block_net_limit: 524288000,
  *     block_cpu_limit: 499990,
  *     block_net_limit: 524288,
  *     server_version_string: 'v2.0.2',
  *     fork_db_head_block_num: 84031197,
  *     fork_db_head_block_id: '050236dd683c4f98c9f5965910bf941d67b8fe6469a149114a3f0053779461da',
  *     server_full_version_string: 'v2.0.2-aa60b9caf9b7e2bd2411bb199c0c1d9fd8f085d5'
  *  }
  *
  */
  getChainInfo(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getChainInfo';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getStats
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getStats
  * @apiVersion 1.2.1
  * @apiDescription Returns an object with one member labeled as the symbol you requested, the object has three members: supply (Symbol), max_supply (Symbol) and issuer (Name).
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} tokenScAddr EOS contract code.
  * @apiParam {string} symbol A string representation of an EOSIO symbol.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getCurrencyStats","params":{"chainType":"EOS","tokenScAddr":"eosio.token","symbol":"EOS"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getStats("EOS", "eosio.token", "EOS", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getStats("EOS", "eosio.token", "EOS");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  {
  *      "supply": "10756688680.6257 EOS",
  *      "max_supply": "100000000000.0000 EOS",
  *      "issuer": "eosio"
  *  }
  *
  */
  getStats(chainType, tokenScAddr, symbol, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getCurrencyStats';
    let params = { chainType: chainType, tokenScAddr:tokenScAddr, symbol:symbol };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getAccountInfo
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getAccountInfo
  * @apiVersion 1.2.1
  * @apiDescription Returns an object containing various details about a specific account on the blockchain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} address The account code.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getAccountInfo","params":{"chainType":"EOS","address":"aarontestnet"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getAccountInfo("EOS", "aarontestnet", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getAccountInfo("EOS", "aarontestnet");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  {
  *     account_name: 'aarontestnet',
  *     head_block_num: 84039011,
  *     head_block_time: '2020-04-02T12:40:32.000',
  *     privileged: false,
  *     last_code_update: '1970-01-01T00:00:00.000',
  *     created: '2019-04-22T03:47:11.500',
  *     core_liquid_balance: '148.3494 EOS',
  *     ram_quota: 7517,
  *     net_weight: 340000,
  *     cpu_weight: 2230000,
  *     net_limit: { used: 520, available: 2188721, max: 2189241 },
  *     cpu_limit: { used: 935, available: 13184853, max: 13185788 },
  *     ram_usage: 3894,
  *     permissions:
  *     [ { perm_name: 'active', parent: 'owner', required_auth: [Object] },
  *     { perm_name: 'owner', parent: '', required_auth: [Object] } ],
  *     total_resources:
  *     {
  *       owner: 'aarontestnet',
  *       net_weight: '34.0000 EOS',
  *       cpu_weight: '223.0000 EOS',
  *       ram_bytes: 6117
  *     },
  *     self_delegated_bandwidth:
  *     {
  *       from: 'aarontestnet',
  *       to: 'aarontestnet',
  *       net_weight: '24.0000 EOS',
  *       cpu_weight: '73.0000 EOS'
  *     },
  *     refund_request: null,
  *     voter_info:
  *     {
  *       owner: 'aarontestnet',
  *       proxy: '',
  *       producers: [],
  *       staked: 2010000,
  *       last_vote_weight: '0.00000000000000000',
  *       proxied_vote_weight: '0.00000000000000000',
  *       is_proxy: 0,
  *       flags1: 0,
  *       reserved2: 0,
  *       reserved3: '0'
  *     },
  *     rex_info: null
  *   }
  *
  */
  getAccountInfo(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getAccountInfo';
    let params = { chainType: chainType, address:address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getAccounts
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getAccounts
  * @apiVersion 1.2.1
  * @apiDescription Returns an array containing account names which is related to the public key, or owned by the given account.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} addressOrPublicKey The account name or the public key.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getAccounts","params":{"chainType":"EOS","publicKey":"EOS6yEsFdisRXLpk4xg4AEnYJDW5bLrjwBDoHNREsDsxcwFEncErK"},"id":1}
  * or
  * {"jsonrpc":"2.0","method":"getAccounts","params":{"chainType":"EOS","address":"aarontestnet"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getAccounts("EOS", "EOS6yEsFdisRXLpk4xg4AEnYJDW5bLrjwBDoHNREsDsxcwFEncErK", (err, result) => {
  *   // apiTest.getAccounts("EOS", "aarontestnet", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getAccounts("EOS", "EOS6yEsFdisRXLpk4xg4AEnYJDW5bLrjwBDoHNREsDsxcwFEncErK");
  *   // let result = await getAccounts("EOS", "aarontestnet");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [
  *     "wanchainbbbb",
  *     "wanchainaaaa"
  *   ]
  *
  */
  getAccounts(chainType, addressOrPublicKey, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getAccounts';

    let params = { chainType: chainType };
    if (addressOrPublicKey.indexOf("EOS") === 0) {
      params.publicKey = addressOrPublicKey;
    } else {
      params.address = addressOrPublicKey;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getRequiredKeys
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRequiredKeys
  * @apiVersion 1.2.1
  * @apiDescription Returns the required keys needed to sign a transaction.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {object} txArgs Optional, transaction arguments.
  * <br>&nbsp;&nbsp;<code>expiration</code> - required string (DateTime) ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$ Time that transaction must be confirmed by.
  * <br>&nbsp;&nbsp;<code>ref_block_num</code> - required integer.
  * <br>&nbsp;&nbsp;<code>ref_block_prefix</code> - required integer.
  * <br>&nbsp;&nbsp;<code>max_net_usage_words</code> - required string or integer (WholeNumber) A whole number.
  * <br>&nbsp;&nbsp;<code>max_cpu_usage_ms</code> - required string or integer (WholeNumber) A whole number.
  * <br>&nbsp;&nbsp;<code>delay_sec</code> - required integer.
  * <br>&nbsp;&nbsp;<code>context_free_actions</code> - required Array of objects (Action).
  * <br>&nbsp;&nbsp;<code>actions</code> - required Array of objects (Action).
  * <br>&nbsp;&nbsp;<code>transaction_extensions</code> - Array of Array of integers or strings (Extension).
  * <br>&nbsp;&nbsp;<code>available_keys</code> - Array of strings (PublicKey) Provide the available keys.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getRequiredKeys","params":{"chainType":"EOS","txArgs":{"transaction":{"expiration":"2020-04-03T06:06:41","ref_block_num":15105,"ref_block_prefix":2116318876,"max_net_usage_words":"","max_cpu_usage_ms":"","delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"cuiqiangtest","permission":"active"}],"data":"90D5CC58E549AF3180626ED39986A6E1010000000000000004454F530000000000"}],"transaction_extensions":[]},"available_keys":["EOS7MiJnddv2dHhjS82i9SQWMpjLoBbxP1mmpDmwn6ALGz4mpkddv"]},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getRequiredKeys("EOS", {"transaction":{"expiration":"2020-04-03T06:06:41","ref_block_num":15105,"ref_block_prefix":2116318876,"max_net_usage_words":"","max_cpu_usage_ms":"","delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"cuiqiangtest","permission":"active"}],"data":"90D5CC58E549AF3180626ED39986A6E1010000000000000004454F530000000000"}],"transaction_extensions":[]},"available_keys":["EOS7MiJnddv2dHhjS82i9SQWMpjLoBbxP1mmpDmwn6ALGz4mpkddv"]}, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getRequiredKeys("EOS", {"transaction":{"expiration":"2020-04-03T06:06:41","ref_block_num":15105,"ref_block_prefix":2116318876,"max_net_usage_words":"","max_cpu_usage_ms":"","delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"cuiqiangtest","permission":"active"}],"data":"90D5CC58E549AF3180626ED39986A6E1010000000000000004454F530000000000"}],"transaction_extensions":[]},"available_keys":["EOS7MiJnddv2dHhjS82i9SQWMpjLoBbxP1mmpDmwn6ALGz4mpkddv"]});
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   ['PUB_K1_69X3383RzBZj41k73CSjUNXM5MYGpnDxyPnWUKPEtYQmVzqTY7']
  *
  */
  getRequiredKeys(chainType, txArgs, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRequiredKeys';

    let params = { chainType: chainType, txArgs:txArgs };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getRawCodeAndAbi
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRawCodeAndAbi
  * @apiVersion 1.2.1
  * @apiDescription Retrieves raw code and ABI for a contract based on account name.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} scAddr contract account name.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getRawCodeAndAbi","params":{"chainType":"EOS","scAddr":"wanchainhtlc"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getRawCodeAndAbi("EOS", "wanchainhtlc", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getRawCodeAndAbi("EOS", "wanchainhtlc");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
        "account_name": "wanchainhtlc",
        "wasm": "...",
        "abi": "..."
      }
  *
  */
  getRawCodeAndAbi(chainType, scAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRawCodeAndAbi';

    let params = { chainType: chainType, scAddr:scAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getAbi
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getAbi
  * @apiVersion 1.2.1
  * @apiDescription Retrieves the ABI for a contract based on its account name.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} scAddr contract account name.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getAbi","params":{"chainType":"EOS","scAddr":"wanchainhtlc"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getAbi("EOS", "wanchainhtlc", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getAbi("EOS", "wanchainhtlc");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   { "version": "eosio::abi/1.1",
			  "types": [ { "new_type_name": "time_t", "type": "uint32" } ],
			  "structs":
			   [ { "name": "asset_t", "base": "", "fields": ["Array"] },
			     { "name": "debt_t", "base": "", "fields": ["Array"] },
			     { "name": "fee_t", "base": "", "fields": ["Array"] },
			     { "name": "inlock", "base": "", "fields": ["Array"] },
			     { "name": "inredeem", "base": "", "fields": ["Array"] },
			     { "name": "inrevoke", "base": "", "fields": ["Array"] },
			     { "name": "lockdebt", "base": "", "fields": ["Array"] },
			     { "name": "num64_t", "base": "", "fields": ["Array"] },
			     { "name": "outlock", "base": "", "fields": ["Array"] },
			     { "name": "outredeem", "base": "", "fields": ["Array"] },
			     { "name": "outrevoke", "base": "", "fields": ["Array"] },
			     { "name": "pk_t", "base": "", "fields": ["Array"] },
			     { "name": "redeemdebt", "base": "", "fields": ["Array"] },
			     { "name": "regsig", "base": "", "fields": ["Array"] },
			     { "name": "revokedebt", "base": "", "fields": ["Array"] },
			     { "name": "setratio", "base": "", "fields": ["Array"] },
			     { "name": "signature_t", "base": "", "fields": ["Array"] },
			     { "name": "transfer_t", "base": "", "fields": ["Array"] },
			     { "name": "unregsig", "base": "", "fields": ["Array"] },
			     { "name": "updatesig", "base": "", "fields": ["Array"] },
			     { "name": "withdraw", "base": "", "fields": ["Array"] } ],
			  "actions":
			   [ { "name": "inlock", "type": "inlock", "ricardian_contract": "" },
			     { "name": "inredeem", "type": "inredeem", "ricardian_contract": "" },
			     { "name": "inrevoke", "type": "inrevoke", "ricardian_contract": "" },
			     { "name": "lockdebt", "type": "lockdebt", "ricardian_contract": "" },
			     { "name": "outlock", "type": "outlock", "ricardian_contract": "" },
			     { "name": "outredeem", "type": "outredeem", "ricardian_contract": "" },
			     { "name": "outrevoke", "type": "outrevoke", "ricardian_contract": "" },
			     { "name": "redeemdebt",
			       "type": "redeemdebt",
			       "ricardian_contract": "" },
			     { "name": "regsig", "type": "regsig", "ricardian_contract": "" },
			     { "name": "revokedebt",
			       "type": "revokedebt",
			       "ricardian_contract": "" },
			     { "name": "setratio", "type": "setratio", "ricardian_contract": "" },
			     { "name": "unregsig", "type": "unregsig", "ricardian_contract": "" },
			     { "name": "updatesig", "type": "updatesig", "ricardian_contract": "" },
			     { "name": "withdraw", "type": "withdraw", "ricardian_contract": "" } ],
			  "tables":
			   [ { "name": "assets",
			       "index_type": "i64",
			       "key_names": [],
			       "key_types": [],
			       "type": "asset_t" },
			     { "name": "debts",
			       "index_type": "i64",
			       "key_names": [],
			       "key_types": [],
			       "type": "debt_t" },
			     { "name": "fees",
			       "index_type": "i64",
			       "key_names": [],
			       "key_types": [],
			       "type": "fee_t" },
			     { "name": "longlongs",
			       "index_type": "i64",
			       "key_names": [],
			       "key_types": [],
			       "type": "num64_t" },
			     { "name": "pks",
			       "index_type": "i64",
			       "key_names": [],
			       "key_types": [],
			       "type": "pk_t" },
			     { "name": "signer",
			       "index_type": "i64",
			       "key_names": [],
			       "key_types": [],
			       "type": "signature_t" },
			     { "name": "transfers",
			       "index_type": "i64",
			       "key_names": [],
			       "key_types": [],
			       "type": "transfer_t" } ],
			  "ricardian_clauses": [],
			  "error_messages": [],
			  "abi_extensions": [],
			  "variants": [] }
  *
  */
  getAbi(chainType, scAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getAbi';

    let params = { chainType: chainType, scAddr:scAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getRawAbi
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRawAbi
  * @apiVersion 1.2.1
  * @apiDescription Returns an object containing buffer ABI for a contract based on its account name.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} scAddr contract account name.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getRawAbi","params":{"chainType":"EOS","scAddr":"wanchainhtlc"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getRawAbi("EOS", "wanchainhtlc", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getRawAbi("EOS", "wanchainhtlc");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
        "0": 14,
        "1": 101,
        "2": 111,
        "3": 115,
        "…": "...",
        "1557": 0
    }

  *
  */
  getRawAbi(chainType, scAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRawAbi';

    let params = { chainType: chainType, scAddr:scAddr };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  // getJson2Bin(chainType, scAddr, action, args, callback) {
  //   if (callback) {
  //     callback = utils.wrapCallback(callback);
  //   }
  //   let method = 'getJson2Bin';

  //   let params = { chainType: chainType, scAddr:scAddr, action:action, args:args };

  //   return utils.promiseOrCallback(callback, cb => {
  //     this._request(method, params, (err, result) => {
  //       if (err) {
  //         return cb(err);
  //       }
  //       return cb(null, result);
  //     });
  //   });
  // }

  /**
  *
  * @apiName getActions
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getActions
  * @apiVersion 1.2.1
  * @apiDescription Returns an array of actions based on notified account..
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} address account name you want to query.
  * @apiParam {object} options Optional, the filter for actions.
  * <br>&nbsp;&nbsp;<strong>For eosjs 16.0.0</strong>:
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>pos</code> - An int32 that is absolute sequence positon, -1 is the end/last action.
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>offset</code> - The number of actions relative to pos, negative numbers return [pos-offset,pos), positive numbers return [pos,pos+offset).

  * <br>&nbsp;&nbsp;<strong>For eosjs 20</strong>:
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>filter</code> - The string for code::name filter.
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>skip</code> - The number to skip [n] actions (pagination).
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>limit</code> - The number to limit of [n] actions per page.
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>sort</code> - The string to sort direction.
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>after</code> - The string to filter after specified date (ISO8601).
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>before</code> - The string to filter before specified date (ISO8601).
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>transfer_to</code> - The string to transfer filter to.
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>transfer_from</code> - The string to transfer filter from. 
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>transfer_symbol</code> - The string to transfer filter symbol.
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>act_name</code> - The string for act name. 
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>act_account</code> - The string for act account. 
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getActions","params":{"chainType":"EOS","address":"wanchainhtlc","options":{"filter":"wanchainhtlc:outlock","limit":2}},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getActions("EOS", "wanchainhtlc", {filter: "wanchainhtlc:outlock", limit: 2}, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getActions("EOS", "wanchainhtlc", {filter: "wanchainhtlc:outlock", limit: 2});
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   [
  *     {
  *       act: { authorization: [Array],
  *       data: [Object],
  *       account: 'wanchainhtlc',
  *       name: 'outlock'
  *     },
  *     cpu_usage_us: 504,
  *     net_usage_words: 65,
  *     account_ram_deltas: [ [Object] ],
  *     global_sequence: 564872608,
  *     '@timestamp': '2020-02-20T03:19:58.500',
  *     block_num: 76739261,
  *     producer: 'eight.cartel',
  *     trx_id: '20bd931ce948c57614f9c6b617532f806a59314ebfe0cacea13be461e0806034',
  *     action_ordinal: 1,
  *     creator_action_ordinal: 0,
  *     notified: [ 'wanchainhtlc' ]
  *   },
  *   ... ...
  *  ]
  *
  */
  // getActions(chainType, address, indexPos, offset, callback) {
  getActions(chainType, address, options = {}, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    let method = 'getActions';

    let params = { chainType: chainType, address:address };

    // for (let key in options) {
    //   params[key] = options[key];
    // }

    params.options = options;
    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getResource
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getResource
  * @apiVersion 1.2.1
  * @apiDescription Returns an object containing rows from the specified table eosio.table.global.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getResource","params":{"chainType":"EOS"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getResource("EOS", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getResource("EOS");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
        "max_block_net_usage": 524288,
        "target_block_net_usage_pct": 1000,
        "max_transaction_net_usage": 524287,
        "base_per_transaction_net_usage": 12,
        "net_usage_leeway": 500,
        "context_free_discount_net_usage_num": 20,
        "context_free_discount_net_usage_den": 100,
        "max_block_cpu_usage": 500000,
        "target_block_cpu_usage_pct": 10,
        "max_transaction_cpu_usage": 200000,
        "min_transaction_cpu_usage": 10,
        "max_transaction_lifetime": 3600,
        "deferred_trx_expiration_window": 600,
        "max_transaction_delay": 3888000,
        "max_inline_action_size": 524287,
        "max_inline_action_depth": 16,
        "max_authority_depth": 6,
        "max_ram_size": "68719476736",
        "total_ram_bytes_reserved": "31287726990",
        "total_ram_stake": "8358873421",
        "last_producer_schedule_update": "2020-04-05T13:19:05.500",
        "last_pervote_bucket_fill": "2020-04-05T13:12:01.000",
        "pervote_bucket": 2472797114,
        "perblock_bucket": "2207987466943",
        "total_unpaid_blocks": 13819603,
        "total_activated_stake": "2480152949826",
        "thresh_activated_stake_time": "2018-11-23T17:21:01.000",
        "last_producer_schedule_size": 21,
        "total_producer_vote_weight": "460825067195145191424.00000000000000000",
        "last_name_close": "2020-04-04T13:37:20.500"
    }

  *
  */
  getResource(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getResource';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getResourcePrice
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getResourcePrice
  * @apiVersion 1.2.1
  * @apiDescription Returns an object containing net/cpu/ram price(cpu in ms/EOS, net/ram in KB/EOS) by provide one producer's account.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} address one producer's account.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getResourcePrice","params":{"chainType":"EOS","address":"junglesweden"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getResourcePrice("EOS", "junglesweden", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getResourcePrice("EOS", "junglesweden");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
        "net": "0.005301073461471487",
        "cpu": "0.005637367015436455",
        "ram": "0.050223917691993435"
    }

  *
  */
  getResourcePrice(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getResourcePrice';
    let params = { chainType: chainType, address:address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

   /**
  *
  * @apiName getBandwidthPrice
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBandwidthPrice
  * @apiVersion 1.2.1
  * @apiDescription Returns an object containing net/cpu price(cpu in ms/EOS, net in KB/EOS) by provide one producer's account.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} address one producer's account.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getBandwidthPrice","params":{"chainType":"EOS","address":"junglesweden"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getBandwidthPrice("EOS", "junglesweden", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getBandwidthPrice("EOS", "junglesweden");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
        "net": "0.005301073461471487",
        "cpu": "0.005637367015436455"
    }

  *
  */
  getBandwidthPrice(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getBandwidthPrice';
    let params = { chainType: chainType, address:address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
  *
  * @apiName getRamPrice
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRamPrice
  * @apiVersion 1.2.1
  * @apiDescription Returns ram price(in KB/EOS).
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getRamPrice","params":{"chainType":"EOS"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getRamPrice("EOS", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getRamPrice("EOS");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   "0.05022503944229491"

  *
  */
  getRamPrice(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRamPrice';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

   /**
  *
  * @apiName getTotalSupply
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTotalSupply
  * @apiVersion 1.2.1
  * @apiDescription Returns an object with one member labeled as 'EOS' you requested, the object has three members: supply (Symbol), max_supply (Symbol) and issuer (Name).
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTotalSupply","params":{"chainType":"EOS"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTotalSupply("EOS", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getTotalSupply("EOS");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *   {
        "supply": "10757681325.5591 EOS",
        "max_supply": "100000000000.0000 EOS",
        "issuer": "eosio"
    }

  *
  */
  getTotalSupply(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTotalSupply';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTotalStaked
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTotalStaked
  * @apiVersion 1.2.1
  * @apiDescription Returns current 'EOS' stake amount.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTotalStaked","params":{"chainType":"EOS"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTotalStaked("EOS", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getTotalStaked("EOS");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  "2868049208.8674 EOS"

  *
  */
  getTotalStaked(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTotalStaked';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

   /**
  *
  * @apiName getTotalStakedPercent
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTotalStakedPercent
  * @apiVersion 1.2.1
  * @apiDescription Returns an object with current 'EOS' stake info, the object has three members: totalStaked, totalSup and staked percent.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTotalStakedPercent","params":{"chainType":"EOS"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTotalStakedPercent("EOS", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getTotalStakedPercent("EOS");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  {
        "totalStaked": 2868049208.8674,
        "totalSup": 10757681325.5591,
        "percent": 0.266604774957706
    }
  *
  */
  getTotalStakedPercent(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTotalStakedPercent';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName getTableRows
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTableRows
  * @apiVersion 1.2.1
  * @apiDescription Returns an object containing rows from the specified table.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {string} scAddr The name of the smart contract that controls the provided table.
  * @apiParam {string} scope The account to which this data belongs.
  * @apiParam {string} table The name of the table to query.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTableRows","params":{"chainType":"EOS","scAddr":"wanchainhtlc","scope":"wanchainhtlc","table":"transfers"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.getTableRows("EOS", "wanchainhtlc", "wanchainhtlc", "transfers", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await getTableRows("EOS", "wanchainhtlc", "wanchainhtlc", "transfers");
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  {
        "rows": [
            {
                "id": 0,
                "pid": 0,
                "quantity": "5.0000 EOS",
                "user": "cuiqiangtest",
                "lockedTime": 7200,
                "beginTime": "2019-12-26T13:59:24",
                "status": "inlock",
                "xHash": "e4b7be8900393ef6b09a172a21be3b4f1b814ff580dbaeba130484fa99b2da7c",
                "wanAddr": "25f2845ad9da78ebaa0e077404d35933f75422b8",
                "account": "eosio.token"
            },
            {
                "id": 1,
                "pid": 0,
                "quantity": "5.0000 EOS",
                "user": "cuiqiangtest",
                "lockedTime": 7200,
                "beginTime": "2019-12-30T12:23:25",
                "status": "inlock",
                "xHash": "2be3dee75ddc370d301e55fb74644bab9b1bac9883cb92c4c57a35f4543ce8f6",
                "wanAddr": "25f2845ad9da78ebaa0e077404d35933f75422b8",
                "account": "eosio.token"
            }
        ],
        "more": true,
        "next_key": "3"
    }
  *
  */
  getTableRows(chainType, scAddr, scope, table, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTableRows';
    let params = { chainType: chainType, scAddr: scAddr, scope: scope, table: table, ...options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
  *
  * @apiName packTransaction
  * @apiGroup EOS
  * @api {CONNECT} /ws/v3/YOUR-API-KEY packTransaction
  * @apiVersion 1.2.1
  * @apiDescription Returns an object with serializedTransaction(buffer) and empty signatures for the given actions with blocksBehind and expireSeconds.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'EOS'</code>.
  * @apiParam {object} tx The transaction to be packed.
  * <br>&nbsp;&nbsp;<code>actions</code> - required Array of objects (Action).
  * <br>&nbsp;&nbsp;<code>blocksBehind</code> - Optional, default is 3.
  * <br>&nbsp;&nbsp;<code>expireSeconds</code> - Optional, default is 30.
  * <br> If <code>blocksBehind</code> and <code>expireSeconds</code> are set, the block <code>blocksBehind</code> the head block retrieved from JsonRpc's <code>get_info</code> is set as the reference block and the transaction header is serialized using this reference block and the expiration field.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters:
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"packTransaction","params":{"chainType":"EOS","tx":{"actions":[{"account":"eosio","name":"delegatebw","authorization":[{"actor":"aarontestnet","permission":"active"}],"data":{"from":"aarontestnet","receiver":"aarontestnet","stake_net_quantity":"0.0001 EOS","stake_cpu_quantity":"0.0001 EOS","transfer":false}}]}},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   apiTest.packTransaction("EOS", {
            "actions": [
                {
                    "account": "eosio",
                    "name": "delegatebw",
                    "authorization": [
                        {
                            "actor": "aarontestnet",
                            "permission": "active"
                        }
                    ],
                    "data": {
                        "from": "aarontestnet",
                        "receiver": "aarontestnet",
                        "stake_net_quantity": "0.0001 EOS",
                        "stake_cpu_quantity": "0.0001 EOS",
                        "transfer": false
                    }
                }
            ]
        }, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await packTransaction("EOS", {
            "actions": [
                {
                    "account": "eosio",
                    "name": "delegatebw",
                    "authorization": [
                        {
                            "actor": "aarontestnet",
                            "permission": "active"
                        }
                    ],
                    "data": {
                        "from": "aarontestnet",
                        "receiver": "aarontestnet",
                        "stake_net_quantity": "0.0001 EOS",
                        "stake_cpu_quantity": "0.0001 EOS",
                        "transfer": false
                    }
                }
            ]
        });
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  * {
        "serializedTransaction": {
            "0": 177,
            "1": 226,
            "2": 138,
            "3": 94,
            "4": 122,
            "5": 95,
            "...": "...",
            "98": 0
        },
        "signatures": []
    }
  *
  */
  packTransaction(chainType, trans, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'packTransaction';
    let params = { chainType: chainType, tx: trans, ...options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  //POS

  /**
   *
   * @apiName getEpochID
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getEpochID
   * @apiVersion 1.2.1
   * @apiDescription Get the current Epoch ID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochID","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getEpochID("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getEpochID("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *   18102
   *
   */
  getEpochID(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getEpochID';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getSlotID
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getSlotID
   * @apiVersion 1.2.1
   * @apiDescription Get the current epoch slot ID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotID","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getSlotID("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getSlotID("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *   2541
   *
   */
  getSlotID(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getSlotID';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getEpochLeadersByEpochID
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getEpochLeadersByEpochID
   * @apiVersion 1.2.1
   * @apiDescription Get the public key list of the epoch leaders of the specified EpochID with the input parameter as EpochID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochLeadersByEpochID","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getEpochLeadersByEpochID("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getEpochLeadersByEpochID("WAN", 18102);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "000000": "046c0979fbcd38b7887076db6b08adbbaae45189ac4239d2c06749b634dbeaafdf2b229b6c4eda1ab6ede7e46cbd9ab3ac35df1ac2a6f650bac39fd8474d85524e",
   *    "000001": "04dac7b023f0e9fb5be91b48e5d546b2f2eb91029705f6055c24b3c804a49cf83f7cd584a96346ca42a94a02456444b7df4e280d2726971bf267f8182341ff81b9",
   *    "000002": "042b7d4be32d25769472ea7c8d432bbad5abee051c048e4de425e6feb288fde6f33a16269e4e85fbda4f857a7d5eca8d33793b9249c83517a3214b64475cd50176",
   *    ... ...
   *    "000047": "046351650f15b8de869d89c572dc093000794e75e7f4a7c9f10e9b35f24694fa7555c143e4c4dd4548c0d06be2b2e6c536b37acf0c0ad4806e6c48f23ade4e4d9a",
   *    "000048": "04fdb485b566c2ddb40e2f4341b1e5746479a7c45e3d8101b1360b8bdba6206deee520ceecc9e9897e3b05b53e3ffa6fa659bef47c384984c0bc021a843df10847",
   *    "000049": "04fdb485b566c2ddb40e2f4341b1e5746479a7c45e3d8101b1360b8bdba6206deee520ceecc9e9897e3b05b53e3ffa6fa659bef47c384984c0bc021a843df10847"
   *  }
   *
   */
  getEpochLeadersByEpochID(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getEpochLeadersByEpochID';
    let params = { chainType: chainType, epochID:epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRandomProposersByEpochID
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRandomProposersByEpochID
   * @apiVersion 1.2.1
   * @apiDescription Gets Random Number Proposer public keys of the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRandomProposersByEpochID","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRandomProposersByEpochID("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRandomProposersByEpochID("WAN", 18102);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "000000": "29e0660fe921282b2d64c6adaf0b24945eee6d9fcdb419c39f84a551ed44151d27f786e5df7abcff94bbed2cbc2791bc76db21b5be469874be181e4fa234fb3e",
   *    "000001": "26a70d685549ffe982df0d66a88f36ac3fca6e488bf69eb6de62a37b97f3f56e2b6b56f47e817c01225ad5549f1ca9751dc1f65559f1a81639c6a4126c9df3ce",
   *    "000002": "21f4f0c4da56206685e94354acba851aab7dc7c090898f6bbb1fc42df986764b055f09e97ceb4c90976a1219ab749dd0b008d47f9c18b962a6056e66de8d858f",
   *    ... ...
   *    "000022": "1c96a7abf1424d0c5316fc74eb39022648062fc88997896bdeae70c4e008b3700136608e2ab653c037d144979403061d3247d6298bfdf0b26c9829db3175531e",
   *    "000023": "00e0c4fae08f124f7a8fe82988a385d9723bea14c8a6e2996a684846ae8d0d4e27abedb7d2f7150bd42ba830e960774b873de74b1d91d7c5ea1ba349a849e575",
   *    "000024": "2094589617397846c5125cf5922ba993643c401998ae8817d5005fe21245f4bc0fbb25158c54446757d2b03d89da10d7dfbbaa23afa38c6e87115dcebe2a8e4d"
   *  }
   *
   */
  getRandomProposersByEpochID(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRandomProposersByEpochID';
    let params = { chainType: chainType, epochID:epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getStakerInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStakerInfo
   * @apiVersion 1.2.1
   * @apiDescription Returns an array of validator information for all validators in the specified block number.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} blockNumber The blockNumber you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStakerInfo","params":{"chainType":"WAN", "blockNumber":3496619},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStakerInfo("WAN", 3496619, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStakerInfo("WAN", 3496619);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   *      "pubSec256": "0x04b7bf8d3868333f70a30041423c7db204b80b9be2e585c344cf3f391cbf77b17fd14f3058d4475d546355bf8c2709ed9ecf5f0cee9d021c90988af0e8cf52001b",
   *      "pubBn256": "0x289787688eb80c1e223375a71f8d17110d638a9143afa190dc11b3c1e64cf92b21feb02ab7a1dcb31892210dfda458aff890fe9e7508292099ae6256f197b325",
   *      "amount": "0xa968163f0a57b400000",
   *      "votingPower": "0x297116712be7b468800000",
   *      "lockEpochs": 7,
   *      "maxFeeRate": 1500,
   *      "nextLockEpochs": 7,
   *      "from": "0xdbb2d6199457d11288f0097659bcec24738e158f",
   *      "stakingEpoch": 0,
   *      "feeRate": 1500,
   *      "feeRateChangedEpoch": 0,
   *      "clients":
   *      [
   *        {
   *          "address": "0xfcc3736dc29bf9af7556fcc1dea10b53edaab51d",
   *          "amount": "0x56bc75e2d63100000",
   *          "votingPower": "0x1537da569da5bca00000",
   *          "quitEpoch": 18071
   *        }
   *      ],
   *      "partners": []
   *    },
   *    ... ...
   *  ]
   *
   */
  getStakerInfo(chainType, blockNumber, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStakerInfo';
    let params = { chainType: chainType, blockNumber:blockNumber };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getEpochIncentivePayDetail
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getEpochIncentivePayDetail
   * @apiVersion 1.2.1
   * @apiDescription Get the reward information of the specified epoch, enter epochID, and reward payment details (including RNP reward, EL reward and chunk reward) will be returned for all the verification nodes and clients working in the epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochIncentivePayDetail","params":{"chainType":"WAN", "epochID":18101},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getEpochIncentivePayDetail("WAN", 18101, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getEpochIncentivePayDetail("WAN", 18101);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "delegators": [
   *        {
   *          "address": "0x81ad5c65a815f8dc28e0fd1d17ac4fa38f8a6838",
   *          "incentive": "0x78b093af02e111",
   *          "type": "delegator"
   *        },
   *        {
   *          "address": "0x4e6b5f1abdd517739889334df047113bd736c546",
   *          "incentive": "0x13afa1b719d597636",
   *          "type": "delegator"
   *        },
   *        ... ...
   *        {
   *          "address": "0x8bf12b4cd3b41d40b2adfdf2857b2077d4194a44",
   *          "incentive": "0x1922a4583a858b0",
   *          "type": "delegator"
   *        },
   *        {
   *          "address": "0x51253d40bb113827781de47e5a2d41f41924431d",
   *          "incentive": "0x28376d59f73c11",
   *          "type": "delegator"
   *        }
   *      ],
   *      "address": "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   *      "stakeInFromAddr": "0xdbb2d6199457d11288f0097659bcec24738e158f",
   *      "incentive": "0xaf6f730467435b9f",
   *      "type": "validator"
   *    },
   *    ... ...
   *  ]
   *
   */
  getEpochIncentivePayDetail(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getEpochIncentivePayDetail';
    let params = { chainType: chainType, epochID:epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getActivity
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getActivity
   * @apiVersion 1.2.1
   * @apiDescription Get the activity information of the specified epoch. For historical epochs the values are fixed, while the current epoch will update the latest current values in real time.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getActivity","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getActivity("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getActivity("WAN", 18102);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "epLeader":
   *    [
   *      "0x28c12c7b51860b9d5aec3a0ceb63c6e187c00aac",
   *      "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   *      "0x0e92d125ba28852a11428fcb63b6f0e44a52962f",
   *      "0xee1ad9c4f9d81f900221e95ee04246b6254b0c6f",
   *      "0xb58230a7923a6a1941016aa1682e212def899ed1",
   *      "0xb9d6c1a6e52119026cb5d2a82457f5fd6bc7e0c9",
   *      "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "0x1b7740df685f9d34773d5a2aba6ab3a2c1407f40",
   *      "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "0x266ddcfdbe3ded75e0e511e6356bca052b221c6b",
   *      "0x1ae5a38b4a5ca0aefbb1c17fd27073ab00fd2a3f",
   *      "0x2866bca06ff1d6afe52298f9fc759ea9b80f6902",
   *      "0xf0e02c3640020f083a314547ae99483aa2c7cd01",
   *      "0x2a6e8c39d4e9f9152958649fc5dbdb9c68cfcb0b",
   *      "0x0081a626fecff225cd87d3f23c0dd47a9fe243ac",
   *      "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "0x2a6e8c39d4e9f9152958649fc5dbdb9c68cfcb0b",
   *      "0xa3fb8f5e1fadfe104e4b1da91e8d96aab52faaf3",
   *      "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   *      "0x85dae7e5c7b433a1682c54eee63adf63d835d272"
   *    ],
   *    "epActivity":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   *    "rpLeader":
   *    [
   *      "0x89a7588529eb7aaea0a229f2dfbb277b15649969",
   *      "0x3dabf8331afbc553a1e458e37a6c9c819c452d55",
   *      "0x010ee9abdf364972ac8d279ab96fd1d167a4d830",
   *      "0x7815f56468915a08edb505fffa9d376ad21a9617",
   *      "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   *      "0x9ce4664e9d7346869797b7d9fc8c7a0212d5ff44",
   *      "0xbdada4f58d17ce602cb0d2db2a55c3e4f47e397f",
   *      "0xa923ac48439add7124763b3682f4505044c81ae3",
   *      "0xf1d6ffc8a2276b7e0784973a1a07a26e75200edd",
   *      "0x5e165460b15f02d84a67f81b29517671989d2492",
   *      "0x8289e2141c10832e7c9b108317eae0dec2011c67",
   *      "0xb019a99f0653973ddb2d983a26e0970587d08447",
   *      "0x8289e2141c10832e7c9b108317eae0dec2011c67",
   *      "0xa4ebf5bbb131179b69bbf33319257728cdada5cf",
   *      "0x3dabf8331afbc553a1e458e37a6c9c819c452d55",
   *      "0x5e165460b15f02d84a67f81b29517671989d2492",
   *      "0xa4539e1bdffceb3557ffb81f87a92e2159f6d637",
   *      "0x7815f56468915a08edb505fffa9d376ad21a9617",
   *      "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   *      "0xf90cc528e5f4811c8c1f1a69b990b9a58039f7cf",
   *      "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   *      "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   *      "0x57dca45124e253bfa93d7571b43555a861c7455f",
   *      "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547"
   *    ],
   *    "rpActivity":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   *    "sltLeader":[],
   *    "slBlocks":[],
   *    "slActivity":0,
   *    "slCtrlCount":0
   *  }
   *
   */
  getActivity(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getActivity';
    let params = { chainType: chainType, epochID:epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getSlotActivity
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getSlotActivity
   * @apiVersion 1.2.1
   * @apiDescription Get the slot leader activity information of the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotActivity","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getSlotActivity("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getSlotActivity("WAN", 18102);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "sltLeader":
   *    [
   *      "0xdf24acd01f69d93ad440c8e9ccf5ac6a32d672d4",
   *      "0x3628bf135f36c6e26a824ec9152885505f3fbc2a",
   *      "0xeb55839c891286d4d5bb11737fca1136797eaf83",
   *      "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   *      "0xee1ad9c4f9d81f900221e95ee04246b6254b0c6f",
   *      "0xcd54e0c35b122860d8fe2eb41f2e8e3e79c085ba",
   *      "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   *      "0x375369561dd38fd1a8c93cade745443558fff0bb",
   *      "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce",
   *      "0x57dca45124e253bfa93d7571b43555a861c7455f",
   *      "0x2866bca06ff1d6afe52298f9fc759ea9b80f6902",
   *      "0xbee03f252dfd38f4f8d10d0664fb50c36526a611",
   *      "0x0081a626fecff225cd87d3f23c0dd47a9fe243ac",
   *      "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "0x6273ce1f6f32e129f295f138d6e4ba6f0e19333e"
   *    ],
   *    "slBlocks": [336, 1085, 359, 671, 693, 366, 349, 53, 74, 70, 364, 347, 339, 337, 339],
   *    "slActivity": 0.8467013888888889,
   *    "slCtrlCount": 8849
   *  }
   *
   */
  getSlotActivity(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getSlotActivity';
    let params = { chainType: chainType, epochID:epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getValidatorActivity
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getValidatorActivity
   * @apiVersion 1.2.1
   * @apiDescription Get the validator activity information of the Epoch Leaders and Random Number Proposers of the specified epoch. Returns null for the current Epoch or future Epochs.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorActivity","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getValidatorActivity("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getValidatorActivity("WAN", 18102);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "epLeader":
   *    [
   *      "0x880d861a8bb6909885bbc65f9fc255bbd11a5825",
   *      "0xc7afae3c9e99af27fe3eaa10f6ec73cd2dbe003b",
   *      "0x882c9c16c05496d7b5374840936aec1af2a16553",
   *      "0x54945447375e25d03033099c540f0998dfa4152d",
   *      "0x71d063d48ac747dd9ef455cc5a58272c04660983",
   *      "0xd5551afd5c976a8eaac478f438f51aea4547eda9",
   *      "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   *      "0x73494477f3a099415348cd33e3d46a07f4052600",
   *      "0x847437144ab96c6c499cdee9edc4d64032d06c86",
   *      "0x0b80f69fcb2564479058e4d28592e095828d24aa",
   *      "0x54945447375e25d03033099c540f0998dfa4152d",
   *      "0x742d898d2ee28a338f03af79c47762a908281a6a",
   *      "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   *      "0x5c1f00ff943de649519ff1ff35ac5b4c62b90964",
   *      "0x2a6e8c39d4e9f9152958649fc5dbdb9c68cfcb0b",
   *      "0xc46b1935326ba2423a9f4bbabf97f74d47f37d59",
   *      "0xbeb30b68160d845593f01aeb6ad9b6e3cc2e3277",
   *      "0x3daddc5a590808694eb1b732636a70194ad3d98e",
   *      "0x266ddcfdbe3ded75e0e511e6356bca052b221c6b",
   *      "0xb9d6c1a6e52119026cb5d2a82457f5fd6bc7e0c9",
   *      "0xb44a825eb3f0539f6593ea05740c9f2686973f3c",
   *      "0xa4539e1bdffceb3557ffb81f87a92e2159f6d637",
   *      "0xb64b60ba915bc16dc71ea59c9950c1538dcead9c"
   *    ],
   *    "epActivity":[0,1,0,1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,1,0,0],
   *    "rpLeader":
   *    [
   *      "0xee1ad9c4f9d81f900221e95ee04246b6254b0c6f",
   *      "0xaadb06ebb95f165155f12a38bdcb092ac66e0344",
   *      "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   *      "0xb44a825eb3f0539f6593ea05740c9f2686973f3c",
   *      "0x3628bf135f36c6e26a824ec9152885505f3fbc2a",
   *      "0x2866bca06ff1d6afe52298f9fc759ea9b80f6902",
   *      "0x0b80f69fcb2564479058e4d28592e095828d24aa",
   *      "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   *      "0x36fad9acaf51a13527375b1ffc3d5a749153efdb",
   *      "0xf8fff523fb1450942dd2cd2b29837eaec2c4c860",
   *      "0x71d063d48ac747dd9ef455cc5a58272c04660983",
   *      "0x1b7740df685f9d34773d5a2aba6ab3a2c1407f40",
   *      "0xb58230a7923a6a1941016aa1682e212def899ed1",
   *      "0x54945447375e25d03033099c540f0998dfa4152d",
   *      "0x742d898d2ee28a338f03af79c47762a908281a6a",
   *      "0x85bbe8f965b1719f7089ee9912e7c9b10fe0a999",
   *      "0xbee03f252dfd38f4f8d10d0664fb50c36526a611",
   *      "0x2f13896d55ea42b58578cd835064233f8e80a929",
   *      "0xf543da34477455ccd0ce9b153baaf344cefd9413",
   *      "0xef09644a88ace467475c2f333f7bb8ffc9427452",
   *      "0x0adc1b8d04d3856b394c8a170fbaea68589c4de6",
   *      "0xaadb06ebb95f165155f12a38bdcb092ac66e0344",
   *      "0x38550ef70511ff71924c4b58220b54e65720384f",
   *      "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce"
   *    ],
   *    "rpActivity":[1,1,1,1,0,1,1,1,1,0,1,0,0,1,0,0,1,1,0,0,0,0,1,1,1]
   *  }
   *
   */
  getValidatorActivity(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getValidatorActivity';
    let params = { chainType: chainType, epochID:epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getMaxStableBlkNumber
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getMaxStableBlkNumber
   * @apiVersion 1.2.1
   * @apiDescription Get the current highest stable block number (no rollback).
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getMaxStableBlkNumber","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getMaxStableBlkNumber("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getMaxStableBlkNumber("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  4018017
   *
   */
  getMaxStableBlkNumber(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMaxStableBlkNumber';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRandom
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRandom
   * @apiVersion 1.2.1
   * @apiDescription Get the random number of the queried epochID and block number.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {number} blockNumber The blockNumber you want to search. If blockNumber is -1, use the latest block.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRandom","params":{"chainType":"WAN", "epochID":18102, "blockNumber":-1},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRandom("WAN", 18102, -1, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRandom("WAN", 18102, -1);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  "0x3a4277627fa45c3bf691014d79c05da2427f8eb115a076b71af7690cdb3a0b5e"
   *
   */
  getRandom(chainType, epochID, blockNumber, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRandom';
    let params = { chainType: chainType, epochID:epochID, blockNumber:blockNumber };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getValidatorInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getValidatorInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the specified validator info by the validator address.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The validator address you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorInfo","params":{"chainType":"WAN", "address":"0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getValidatorInfo("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getValidatorInfo("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "address": "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce",
   *    "amount": "5.01e+22",
   *    "feeRate": 1500
   *  }
   *
   */
  getValidatorInfo(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getValidatorInfo';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getValidatorStakeInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getValidatorStakeInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the specified validator staking info by the validator owner's address.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The validator owner address you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorStakeInfo","params":{"chainType":"WAN", "address":"0x086b4cfadfd9f232b068c2e8263d608baee85163"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getValidatorStakeInfo("WAN", "0x086b4cfadfd9f232b068c2e8263d608baee85163", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getValidatorStakeInfo("WAN", "0x086b4cfadfd9f232b068c2e8263d608baee85163");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "partners": [],
   *      "address": "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce",
   *      "pubSec256": "0x04c5b937557d0f5f4d75831d746fc0197cba50c5a98cb901e941956240d45ea374c6ba5919bc3e57de69f9813f99f6658dc86433b6d1156298cbf2b7087429dcc1",
   *      "pubBn256": "0x0effcb9cb449235ff25108e0d8968b24a52402f4c6a8c67e4c0c71ac2558369d1ccd2e2f5b90613ef05d0594b675a5b7326dce01304f3c0c0b35f5bdc4a7f930",
   *      "amount": "0xa9bed2b4ed2de500000",
   *      "votingPower": "0x2a4544f88e102dc6c00000",
   *      "lockEpochs": 10,
   *      "nextLockEpochs": 10,
   *      "from": "0x086b4cfadfd9f232b068c2e8263d608baee85163",
   *      "stakingEpoch": 18098,
   *      "feeRate": 1500,
   *      "clients":
   *      [
   *        {
   *          "address": "0xf99a8bc18061812e09652f5855908e35d034154b",
   *          "amount": "0x3635c9adc5dea00000",
   *          "votingPower": "0xd42e876228795e400000",
   *          "quitEpoch": 0
   *        },
   *        {
   *          "address": "0xa078ecadd6011a0d8df127cb0be12b03f2db0599",
   *          "amount": "0x3635c9adc5dea00000",
   *          "votingPower": "0xd42e876228795e400000",
   *          "quitEpoch": 0
   *        },
   *        {
   *          "address": "0xa373c8e5cbbe161cebbaa5d44f991cd265dcf87d",
   *          "amount": "0x431cb388cb7d980000",
   *          "votingPower": "0x106ae56b56c7994f00000",
   *          "quitEpoch": 0
   *        },
   *        {
   *          "address": "0xe57fcb59c510354b414b2c982ae1ddc4b0f3d329",
   *          "amount": "0x3635c9adc5dea00000",
   *          "votingPower": "0xd42e876228795e400000",
   *          "quitEpoch": 0
   *        },
   *        ... ...
   *      ],
   *      "maxFeeRate": 1500,
   *      "feeRateChangedEpoch": 18098
   *    }
   *  ]
   *
   */
  getValidatorStakeInfo(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getValidatorStakeInfo';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getValidatorTotalIncentive
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getValidatorTotalIncentive
   * @apiVersion 1.2.1
   * @apiDescription Get the specified validator's total incentives.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string/array} address The validator address you want to search.
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>from</code> - The number that begin epochID you want to search.
   * <br>&nbsp;&nbsp;<code>to</code> - The number that end epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorTotalIncentive","params":{"chainType":"WAN", "address":"0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getValidatorTotalIncentive("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getValidatorTotalIncentive("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce",
   *       "amount": "1.828058184231574257465e+21",
   *       "minEpochId": 18080,
   *       "epochCount": 21
   *    }
   *  ]
   *
   */
  getValidatorTotalIncentive(chainType, address, options, callback) {
    if (options && typeof(options) === "function") {
      callback = options;
      options = undefined;
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getValidatorTotalIncentive';
    let params = { chainType: chainType, address: address };
    if (options) {
      typeof(options.from) !== "undefined" && (params.from = options.from);
      typeof(options.to) !== "undefined" && (params.to = options.to);
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getDelegatorStakeInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getDelegatorStakeInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the identified delegator's staking info.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The delegator address you want to query.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorStakeInfo","params":{"chainType":"WAN", "address":"0xa6de4408d9003ee992b5dc0e1bf27968e48727dc"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getDelegatorStakeInfo("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getDelegatorStakeInfo("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   *      "amount": "0xa968163f0a57b400000",
   *      "quitEpoch": 0
   *    },
   *    {
   *      "address": "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "amount": "0x3f870857a3e0e3800000",
   *      "quitEpoch": 0
   *    },
   *    {
   *      "address": "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   *      "amount": "0xa968163f0a57b400000",
   *      "quitEpoch": 0
   *    },
   *    {
   *      "address": "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   *      "amount": "0xa968163f0a57b400000",
   *      "quitEpoch": 0
   *    },
   *  ]
   *
   */
  getDelegatorStakeInfo(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getDelegatorStakeInfo';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getDelegatorIncentive
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getDelegatorIncentive
   * @apiVersion 1.2.1
   * @apiDescription Get the identified delegator rewards over a specified range of epochs.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The delegator address you want to query.
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>from</code> - The number that starting epochID you want to query.
   * <br>&nbsp;&nbsp;<code>to</code> - The number that ending epochID you want to query.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorIncentive","params":{"chainType":"WAN", "address":"0xa6de4408d9003ee992b5dc0e1bf27968e48727dc"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getDelegatorIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getDelegatorIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   *      "amount": "0x3217e1b255185bf07",
   *      "epochId": 18088
   *    },
   *    {
   *      "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   *      "amount": "0x19029a8c0503573f2",
   *      "epochId": 18090
   *    },
   *    {
   *      "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   *      "amount": "0x1902ee870d0bbf9fc",
   *      "epochId": 18091
   *    },
   *    {
   *      "address": "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "amount": "0x2e2c02cc97b59ff49",
   *      "epochId": 18091
   *    },
   *    {
   *      "address": "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   *      "amount": "0xd9861c084d353afe",
   *      "epochId": 18091
   *    },
   *    {
   *      "address": "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   *      "amount": "0xa4d86dec9cf006aa",
   *      "epochId": 18091
   *    },
   *    ... ...
   *  ]
   *
   */
  getDelegatorIncentive(chainType, address, options, callback) {
    if (options && typeof(options) === "function") {
      callback = options;
      options = undefined;
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getDelegatorIncentive';
    let params = { chainType: chainType, address: address };
    if (options) {
      if (options.validatorAddress) {
        params.validatorAddress = options.validatorAddress;
      }
      typeof(options.from) !== "undefined" && (params.from = options.from);
      typeof(options.to) !== "undefined" && (params.to = options.to);
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getDelegatorTotalIncentive
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getDelegatorTotalIncentive
   * @apiVersion 1.2.1
   * @apiDescription Get the identified delegator's total incentives.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The delegator's address you want to query.
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>validatorAddress</code> - The validator's address you want to query.
   * <br>&nbsp;&nbsp;<code>from</code> - The number that starting epochID you want to query.
   * <br>&nbsp;&nbsp;<code>to</code> - The number that ending epochID you want to query.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorTotalIncentive","params":{"chainType":"WAN", "address":"0xa6de4408d9003ee992b5dc0e1bf27968e48727dc"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getDelegatorTotalIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getDelegatorTotalIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "amount": "233401766511923724414",
   *      "minEpochId": 18080,
   *      "epochCount": 6
   *    },
   *    {
   *      "address": "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   *      "amount": "516430866915939128625",
   *      "minEpochId": 18088,
   *      "epochCount": 12
   *    },
   *    {
   *      "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   *      "amount": "662440812840446730555",
   *      "minEpochId": 18088,
   *      "epochCount": 10
   *    },
   *    {
   *      "address": "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   *      "amount": "514597535375473288151",
   *      "minEpochId": 18088,
   *      "epochCount": 13
   *    },
   *    {
   *      "address": "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   *      "amount": "6.026970402596349056462e+21",
   *      "minEpochId": 18082,
   *      "epochCount": 20
   *    },
   *    ... ...
   *  ]
   *
   */
  getDelegatorTotalIncentive(chainType, address, options, callback) {
    if (options && typeof(options) === "function") {
      callback = options;
      options = undefined;
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getDelegatorTotalIncentive';
    let params = { chainType: chainType, address: address };
    if (options) {
      if (options.validatorAddress) {
        params.validatorAddress = options.validatorAddress;
      }
      typeof(options.from) !== "undefined" && (params.from = options.from);
      typeof(options.to) !== "undefined" && (params.to = options.to);
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getLeaderGroupByEpochID
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getLeaderGroupByEpochID
   * @apiVersion 1.2.1
   * @apiDescription Get the Epoch Leader and Random Number Proposer addresses and public key lists in the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getLeaderGroupByEpochID","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getLeaderGroupByEpochID("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getLeaderGroupByEpochID("WAN", 18102);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "pubBn256": "0x0342c5f001e6970037de3d9de692cb89284435df28e63657f88c8e99893be7960006f8cf93c699856ff8aeffcd64531ce0071cdf09a38d043b33bbbf4cd469ed",
   *      "pubSec256": "0x046c0979fbcd38b7887076db6b08adbbaae45189ac4239d2c06749b634dbeaafdf2b229b6c4eda1ab6ede7e46cbd9ab3ac35df1ac2a6f650bac39fd8474d85524e",
   *      "secAddr": "0x28c12c7b51860b9d5aec3a0ceb63c6e187c00aac",
   *      "type": 0
   *    },
   *    {
   *      "pubBn256": "0x093e87d8f1cf8d967be90fc841b73180e8185e480e5b1937c5bd0bf5b47288500598f33d4142bf226b2c8ddaf7358c3093423efdeb1b0a74bfba9d5749ecdf9c",
   *      "pubSec256": "0x04dac7b023f0e9fb5be91b48e5d546b2f2eb91029705f6055c24b3c804a49cf83f7cd584a96346ca42a94a02456444b7df4e280d2726971bf267f8182341ff81b9",
   *      "secAddr": "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "type": 0
   *    },
   *    {
   *      "pubBn256": "0x00e0c4fae08f124f7a8fe82988a385d9723bea14c8a6e2996a684846ae8d0d4e27abedb7d2f7150bd42ba830e960774b873de74b1d91d7c5ea1ba349a849e575",
   *      "pubSec256": "0x047aa28ac3bf36c51e7781984e2843bdb78bf7d78e3e3f2fe5522581e8f94725749d81b6f2dd3068a02f95b9dddb5e3a97f9c6e22edf5a78e25339c3c94aeb31f1",
   *      "secAddr": "0x57dca45124e253bfa93d7571b43555a861c7455f",
   *      "type": 1
   *    },
   *    {
   *      "pubBn256": "0x2094589617397846c5125cf5922ba993643c401998ae8817d5005fe21245f4bc0fbb25158c54446757d2b03d89da10d7dfbbaa23afa38c6e87115dcebe2a8e4d",
   *      "pubSec256": "0x04428597d2d6ab60894c592951337243424637c8b65cc0057215f481dcb78b3e96268365c9bac17bc32b6c08e2c135ca231f636653040f995e8d4e03f6d4b8d812",
   *      "secAddr": "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   *      "type": 1
   *    },
   *    ... ...
   *  ]
   *
   */
  getLeaderGroupByEpochID(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getLeaderGroupByEpochID';
    let params = { chainType: chainType, epochID: epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getCurrentEpochInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getCurrentEpochInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the current epoch info.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getCurrentEpochInfo","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getCurrentEpochInfo("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getCurrentEpochInfo("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "blockNumber": 3938057,
   *    "slotId": 5661,
   *    "epochId": 18102
   *  }
   *
   */
  getCurrentEpochInfo(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getCurrentEpochInfo';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getCurrentStakerInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getCurrentStakerInfo
   * @apiVersion 1.2.1
   * @apiDescription Returns an array with information on each of the current validators.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getCurrentStakerInfo","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getCurrentStakerInfo("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getCurrentStakerInfo("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   *      "pubSec256": "0x04b7bf8d3868333f70a30041423c7db204b80b9be2e585c344cf3f391cbf77b17fd14f3058d4475d546355bf8c2709ed9ecf5f0cee9d021c90988af0e8cf52001b",
   *      "pubBn256": "0x289787688eb80c1e223375a71f8d17110d638a9143afa190dc11b3c1e64cf92b21feb02ab7a1dcb31892210dfda458aff890fe9e7508292099ae6256f197b325",
   *      "amount": "0xa968163f0a57b400000",
   *      "votingPower": "0x297116712be7b468800000",
   *      "lockEpochs": 7,
   *      "maxFeeRate": 1500,
   *      "nextLockEpochs": 7,
   *      "from": "0xdbb2d6199457d11288f0097659bcec24738e158f",
   *      "stakingEpoch": 0,
   *      "feeRate": 1500,
   *      "feeRateChangedEpoch": 0,
   *      "clients":
   *      [
   *        {
   *          "address": "0xfcc3736dc29bf9af7556fcc1dea10b53edaab51d",
   *          "amount": "0x56bc75e2d63100000",
   *          "votingPower": "0x1537da569da5bca00000",
   *          "quitEpoch": 18071
   *        }
   *      ],
   *      "partners": []
   *    },
   *    ... ...
   *  ]
   *
   */
  getCurrentStakerInfo(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getCurrentStakerInfo';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getSlotCount
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getSlotCount
   * @apiVersion 1.2.1
   * @apiDescription Returns the total number of slots in an epoch. This is a constant.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotCount","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getSlotCount("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getSlotCount("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  17280
   *
   */
  getSlotCount(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getSlotCount';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getSlotTime
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getSlotTime
   * @apiVersion 1.2.1
   * @apiDescription Get the time span of a slot in seconds.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotTime","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getSlotTime("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getSlotTime("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  5
   *
   */
  getSlotTime(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getSlotTime';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getTimeByEpochID
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTimeByEpochID
   * @apiVersion 1.2.1
   * @apiDescription Returns the specified epoch's start time in UTC time seconds.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTimeByEpochID","params":{"chainType":"WAN", "epochID":18108},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getTimeByEpochID("WAN", 18108, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getTimeByEpochID("WAN", 18108);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  1564531200
   *
   */
  getTimeByEpochID(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTimeByEpochID';
    let params = { chainType: chainType, epochID: epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getEpochIDByTime
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getEpochIDByTime
   * @apiVersion 1.2.1
   * @apiDescription Calculates the Epoch ID according to the time. Enter the UTC time in seconds to get the corresponding Epoch ID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} time The UTC time seconds you want to query.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochIDByTime","params":{"chainType":"WAN", "time":1564550000},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getEpochIDByTime("WAN", 1564550000, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getEpochIDByTime("WAN", 1564550000);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  18108
   *
   */
  getEpochIDByTime(chainType, time, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getEpochIDByTime';
    let params = { chainType: chainType, time: time };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRegisteredValidator
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegisteredValidator
   * @apiVersion 1.2.1
   * @apiDescription Get records of registered validators information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} [address] The validator address you want to search.
   * @apiParam {number} [after] The timestamp after you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRegisteredValidator","params":{"after":1503780889497},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRegisteredValidator(1503780889497, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRegisteredValidator(1503780889497);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0x17d47c6ac4f72d43420f5e9533b526b2dee626a6",
   *      "name": "MatPool",
   *      "iconData": "iVBORw0KGgoAAAANSUhEUgAAAEwAAABQCAYAAACzg5PLAAAABGd ... ...",
   *      "iconType": "png",
   *      "url": "https://matpool.io/",
   *      "updatedAt": 1563780889497
   *    },
   *    ... ...
   *  ]
   *
   */
  getRegisteredValidator(address, after, callback) {
    let method = 'getRegisteredValidator';
    let params = {};

    if (typeof (address) === "function") {
      callback = address;
      address = undefined;
      after = undefined;
    }
    if (typeof (after) === "function") {
      callback = after;
      after = undefined;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    if (typeof(address) !== "undefined" && typeof(after) !== "undefined") {
      params.address = address;
      params.after = after;
    } else if (typeof(address) !== "undefined") {
      (typeof(address) === "string" || Array.isArray(address)) ? (params.address = address) : (params.after = address);
    } else if (typeof(after) !== "undefined") {
      params.after = after;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRegisteredToken
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegisteredToken
   * @apiVersion 1.2.1
   * @apiDescription Get records of registered tokens information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} [tokenOrigAccount] The token account of original chain.
   * @apiParam {number} [after] The timestamp after you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRegisteredToken","params":{"after":1577155812700},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRegisteredToken(1577155812700, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRegisteredToken(1577155812700);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "tokenOrigAccount": "0x00f58d6d585f84b2d7267940cede30ce2fe6eae8",
   *      "decimals": 18,
   *      "deposit": "10000000000000000000",
   *      "iconData": "/9j/4AAQSkZJ ... ...",
   *      "iconType": "jpg",
   *      "name": "Wanchain ZRX Crosschain Token",
   *      "symbol": "ZRX",
   *      "token2WanRatio": "20000",
   *      "tokenWanAddr": "0x2a4359d8b84b270eb112b54273439ac538f32733",
   *      "updatedAt": 1577155812722,
   *      "withDrawDelayTime": "259200"
   *    },
   *    ... ...
   *  ]
   *
   */
  getRegisteredToken(tokenOrigAccount, after, callback) {
    let method = 'getRegisteredToken';
    let params = {};

    if (typeof (tokenOrigAccount) === "function") {
      callback = tokenOrigAccount;
      tokenOrigAccount = undefined;
      after = undefined;
    }
    if (typeof (after) === "function") {
      callback = after;
      after = undefined;
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    if (typeof(tokenOrigAccount) !== "undefined" && typeof(after) !== "undefined") {
      params.tokenOrigAccount = tokenOrigAccount;
      params.after = after;
    } else if (typeof(tokenOrigAccount) !== "undefined") {
      (typeof(tokenOrigAccount) === "string" || Array.isArray(tokenOrigAccount)) ? (params.tokenOrigAccount = tokenOrigAccount) : (params.after = tokenOrigAccount);
    } else if (typeof(after) !== "undefined") {
      params.after = after;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRegisteredDapp
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegisteredDapp
   * @apiVersion 1.2.1
   * @apiDescription Get records of registered Dapps information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>chainType</code> - The chain type being queried. Currently supports <code>'WAN'</code>.
   * <br>&nbsp;&nbsp;<code>url</code> - The URL being queried.
   * <br>&nbsp;&nbsp;<code>language</code> - The supported language being queried.
   * <br>&nbsp;&nbsp;<code>name</code> - The name being fuzzy queried.
   * <br>&nbsp;&nbsp;<code>platform</code> - The supported platform being queried. Currently supports <code>'desktop'</code> and <code>'mobile'</code>.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>pageIndex</code> - The page index you want to search. If you want to query with the <code>pageIndex</code>, <code>page</code> is needed.
   * <br>&nbsp;&nbsp;<code>page</code> - The page size you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRegisteredDapp","params":{"after":1577155812700, "platform":["desktop"]},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRegisteredDapp({after:1577155812700, platform:["desktop"]}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRegisteredDapp({after:1577155812700, platform:["desktop"]});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "langInfo": [
   *        {
   *          "language": "en",
   *          "name": "WRDEX",
   *          "summary": "A Crosschain Dex in wanchain.",
   *          "detail": "A Crosschain Dex in wanchain."
   *        },
   *        {
   *          "language": "zh",
   *          "name": "WRDEX",
   *          "summary": "一款万维链上基于链下撮合链上结算原理的去中心化交易所。",
   *          "detail": "一款万维链上基于链下撮合链上结算原理的去中心化交易所。"
   *        }
   *      ],
   *      "platform":["desktop","mobile"],
   *      "url": "https://exchange.wrdex.io",
   *      "chainType": "wan",
   *      "type": "Exchange",
   *      "creator": "rivex.io",
   *      "creatorWebsite": "https://wrdex.io",
   *      "scAddress": [
   *        "0x8786038ef9c2f659772c6c2ee8402bdfdc511bb8"
   *      ],
   *      "iconType": "jpg",
   *      "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   *      "updatedAt": 1586226464996
   *    },
   *    ... ...
   *  ]
   *
   */
  getRegisteredDapp(options, callback) {
    let method = 'getRegisteredDapp';
    let params = {};

    if (typeof (options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    params = utils.newJson(options);

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRegisteredAds
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegisteredAds
   * @apiVersion 1.2.1
   * @apiDescription Get records of registered advertisements information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>name</code> - The advertisement name you want to search.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRegisteredAds","params":{"after":######},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRegisteredAds(######, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRegisteredAds(######);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "name": "test",
   *      "iconData": "iVBORw0KGgoAAAGG ... ...",
   *      "iconType": "png",
   *      "url": "https://test.io/",
   *      "updatedAt": 1563780893497
   *    },
   *    ... ...
   *  ]
   *
   */
  getRegisteredAds(options, callback) {
    let method = 'getRegisteredAds';
    let params = {};

    if (typeof (options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    params = utils.newJson(options);

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRegisteredCoinGecko
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegisteredCoinGecko
   * @apiVersion 1.2.1
   * @apiDescription Get records of registered coingecko information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>address</code> - The array of coingecko address you want to search.
   * <br>&nbsp;&nbsp;<code>symbol</code> - The array of coingecko symbol you want to search.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRegisteredCoinGecko","params":{"symbol":######},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRegisteredCoinGecko({symbol:######}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRegisteredCoinGecko({symbol:######});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "id": "wanchain",
   *      "symbol": "wan",
   *      "name": "Wanchain"
   *      "updatedAt": 1563780893497
   *    },
   *    ... ...
   *  ]
   *
   */
  getRegisteredCoinGecko(options, callback) {
    let method = 'getRegisteredCoinGecko';
    let params = {};

    if (typeof (options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    params = utils.newJson(options);

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getPosInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getPosInfo
   * @apiVersion 1.2.1
   * @apiDescription Returns the epoch ID and block number when the switch from POW to the POS protocol occurred.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getPosInfo","params":{"chainType":"WAN"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getPosInfo("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getPosInfo("WAN");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "firstBlockNumber": 3560000,
   *    "firstEpochId": 18078
   *  }
   *
   */
  getPosInfo(chainType, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getPosInfo';
    let params = { chainType: chainType };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getMaxBlockNumber
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getMaxBlockNumber
   * @apiVersion 1.2.1
   * @apiDescription Get the highest block number of the specified epoch ID(s).
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number/array} epochID The epochID(s) you want to query.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getMaxBlockNumber","params":{"chainType":"WAN", "epochID":[18102, 18101]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getMaxBlockNumber("WAN", [18102, 18101], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getMaxBlockNumber("WAN", [18102, 18101]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "epochId": 18102,
   *      "blockNumber": 3938057,
   *    },
   *    {
   *      "epochId": 18101,
   *      "blockNumber": 3933152,
   *    }
   *  ]
   *
   */
  getMaxBlockNumber(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMaxBlockNumber';
    let params = { chainType: chainType, epochID: epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getValidatorSupStakeInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getValidatorSupStakeInfo
   * @apiVersion 1.2.1
   * @apiDescription Get supplementary information for the specified validator.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string/array} address The validator address you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorSupStakeInfo","params":{"chainType":"WAN", "address":["0x158bae682e6278a16d09d7c7311074585d38b54d","0x85dae7e5c7b433a1682c54eee63adf63d835d272"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getValidatorSupStakeInfo("WAN", ["0x158bae682e6278a16d09d7c7311074585d38b54d","0x85dae7e5c7b433a1682c54eee63adf63d835d272"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getValidatorSupStakeInfo("WAN", ["0x158bae682e6278a16d09d7c7311074585d38b54d","0x85dae7e5c7b433a1682c54eee63adf63d835d272"]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0x158bae682e6278a16d09d7c7311074585d38b54d",
   *      "stakeIn": 3778078,
   *      "stakeInTimestamp": 1563134885
   *    },
   *    {
   *      "address": "0x85dae7e5c7b433a1682c54eee63adf63d835d272",
   *      "stakeIn": 3905210,
   *      "stakeInTimestamp": 1563848135
   *    }
   *  ]
   *
   */
  getValidatorSupStakeInfo(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getValidatorSupStakeInfo';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getDelegatorSupStakeInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getDelegatorSupStakeInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the specified delegator's supplementary information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string/array} address The delegator's address you want to query.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorSupStakeInfo","params":{"chainType":"WAN", "address":["0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getDelegatorSupStakeInfo("WAN", ["0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getDelegatorSupStakeInfo("WAN", ["0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0"]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0",
   *      "vAddress": "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   *      "delegateIn": 3788629,
   *      "delegateInTimestamp": 1563190930
   *    },
   *    {
   *      "address": "0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0",
   *      "vAddress": "0x1e1e954883d02fba32fa1f7d0d6314156aa2a4e8",
   *      "delegateIn": 3788635,
   *      "delegateInTimestamp": 1563190970
   *    },
   *    ... ...
   *  ]
   *
   */
  getDelegatorSupStakeInfo(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getDelegatorSupStakeInfo';
    let params = { chainType: chainType, address: address };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getEpochIncentiveBlockNumber
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getEpochIncentiveBlockNumber
   * @apiVersion 1.2.1
   * @apiDescription Get the block number which contains the incentives transactions for the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to query.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochIncentiveBlockNumber","params":{"chainType":"WAN", "epochID":18106},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getEpochIncentiveBlockNumber("WAN", 18106, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getEpochIncentiveBlockNumber("WAN", 18106);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  4003788
   *
   */
  getEpochIncentiveBlockNumber(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getEpochIncentiveBlockNumber';
    let params = { chainType: chainType, epochID: epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getEpochStakeOut
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getEpochStakeOut
   * @apiVersion 1.2.1
   * @apiDescription Get the record of stake out transactions for the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochStakeOut","params":{"chainType":"WAN", "epochID":18106},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getEpochStakeOut("WAN", 18106, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getEpochStakeOut("WAN", 18106);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    {
   *      "address": "0x74b7505ef4ee4a4783f446df8964b6cdd4c61843",
   *      "amount": "0x8f1d5c1cae3740000"
   *    },
   *    ... ...
   *  ]
   *
   */
  getEpochStakeOut(chainType, epochID, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getEpochStakeOut';
    let params = { chainType: chainType, epochID: epochID };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName checkOTAUsed
   * @apiGroup Accounts
   * @api {CONNECT} /ws/v3/YOUR-API-KEY checkOTAUsed
   * @apiVersion 1.2.1
   * @apiDescription Check whether the OTA address is used.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>.
   * @apiParam {string} image The OTA address.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"checkOTAUsed","params":{"chainType":"WAN", "image":"xxxxxxx"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.checkOTAUsed("WAN", "xxxxxxx", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.checkOTAUsed("WAN", "xxxxxxx");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  true
   *
   */
  checkOTAUsed(chainType, image, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'checkOTAUsed';
    let params = { chainType: chainType, image: image };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  // iwan
  addDoc(tableName, content, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'addDoc';
    let params = { table: tableName, content: content };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getDocOne(tableName, filter, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }

    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getDocOne';
    let params = { table: tableName, filter: filter, options: options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getDocMany(tableName, filter, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }

    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getDocMany';
    let params = { table: tableName, filter: filter, options: options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  updateDocOne(tableName, filter, content, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }

    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'updateDocOne';
    let params = { table: tableName, filter: filter, content: content, options: options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  updateDocMany(tableName, filter, content, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }

    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'updateDocMany';
    let params = { table: tableName, filter: filter, content: content, options: options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  deleteDoc(tableName, filter, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'deleteDoc';
    let params = { table: tableName, filter: filter };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  aggregateDoc(tableName, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'aggregateDoc';
    let params = { table: tableName, ...options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  countDoc(tableName, filter, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'countDoc';
    let params = { table: tableName, filter: filter };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName fetchService
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY fetchService
   * @apiVersion 1.2.1
   * @apiDescription Fetch service API by the native http.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} srvType The service type.
   * @apiParam {string} funcName The service URI.
   * @apiParam {string} type The http request method as string. Currently supports <code>'GET'</code> and <code>'POST'</code>.
   * @apiParam {object} [options] Optional, the arguments passing to service API.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"fetchService","params":{"srvType":"bp", "funcName":"getAddress", "type":"POST", "options":{}},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.fetchService("bp", "getAddress", "POST", {}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.fetchService("bp", "getAddress", "POST", {});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "name": "test",
   *    "address":"0x3786038ef9c2f659772c6c2ee8402bdfdc511bb5"
   *  }
   *
   */
  fetchService(srvType, funcName, type, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }

    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'fetchService';
    let params = { srvType: srvType, funcName: funcName, type: type, options: options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName fetchSpecialService
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY fetchSpecialService
   * @apiVersion 1.2.1
   * @apiDescription Fetch the special service API by the native http.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} url The special service request url absolutely.
   * @apiParam {string} type The http request method as string. Currently supports <code>'GET'</code> and <code>'POST'</code>.
   * @apiParam {object} [options] The arguments passing to service API.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"fetchSpecialService","params":{"url":"https://xxx.com:443/getAddress", "type":"POST", "options":{}},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.fetchSpecialService("https://xxx.com:443/getAddress", "POST", {}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.fetchSpecialService("https://xxx.com:443/getAddress", "POST", {});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
   *    "name": "test",
   *    "address":"0x3786038ef9c2f659772c6c2ee8402bdfdc511bb5"
   *  }
   *
   */
  fetchSpecialService(url, type, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }

    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'fetchSpecialService';
    let params = { url: url, type: type, options: options };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRegisteredOrigToken
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegisteredOrigToken
   * @apiVersion 1.2.1
   * @apiDescription Get records of registered tokens information of original chain.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried, default: <code>'WAN'</code>.
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>tokenScAddr</code> - The token account of <code>'WAN'</code> chain.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>pageIndex</code> - The page index you want to search. If you want to query with the <code>pageIndex</code>, <code>page</code> is needed.
   * <br>&nbsp;&nbsp;<code>page</code> - The page size you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRegisteredOrigToken","params":{"chainType":"WAN", "after":1577155812700},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRegisteredOrigToken("WAN", {after:1577155812700}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRegisteredOrigToken("WAN", {after:1577155812700});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *      "tokenScAddr": "0xc6f4465a6a521124c8e3096b62575c157999d361",
   *      "iconType": "jpg",
   *      "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   *      "updatedAt": :1589512354784
   *    },
   *    ... ...
   *  ]
   *
   */
  getRegisteredOrigToken(chainType, options, callback) {
    let method = 'getRegisteredOrigToken';
    let params = {};

    if (typeof (chainType) === "function") {
      options = {};
      chainType = undefined;
    }
    if (typeof (options) === "function") {
      callback = options;
      options = {};
    }
    if (chainType && typeof (chainType) === "object") {
      options = chainType;
      chainType = undefined;
    }
  if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    params = utils.newJson(options);

    if (chainType) {
      params.chainType = chainType;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRegisteredMapToken
   * @apiGroup Service
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegisteredMapToken
   * @apiVersion 1.2.1
   * @apiDescription Get records of registered mapping tokens information of shadow chain.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried, default: <code>'WAN'</code>.
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>tokenScAddr</code> - The token account of <code>'WAN'</code> chain.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>pageIndex</code> - The page index you want to search. If you want to query with the <code>pageIndex</code>, <code>page</code> is needed.
   * <br>&nbsp;&nbsp;<code>page</code> - The page size you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRegisteredMapToken","params":{"chainType":"WAN", "after":1577155812700},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRegisteredMapToken("WAN", {after:1577155812700}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRegisteredMapToken("WAN", {after:1577155812700});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *      "tokenScAddr": "0xc6f4465a6a521124c8e3096b62575c157999d361",
   *      "iconType": "jpg",
   *      "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   *      "updatedAt": :1589512354784
   *    },
   *    ... ...
   *  ]
   *
   */
  getRegisteredMapToken(chainType, options, callback) {
    let method = 'getRegisteredMapToken';
    let params = {};

    if (typeof (chainType) === "function") {
      options = {};
      chainType = undefined;
    }
    if (typeof (options) === "function") {
      callback = options;
      options = {};
    }
    if (chainType && typeof (chainType) === "object") {
      options = chainType;
      chainType = undefined;
    }
  if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    params = utils.newJson(options);

    if (chainType) {
      params.chainType = chainType;
    }

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  // ################### open storeman api ###################

    /**
   *
   * @apiName getStoremanGroupList
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroupList
   * @apiVersion 1.2.1
   * @apiDescription Get all the active storemanGroups, include the info like the groupId, etc.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
  * @apiParam {object} [options] Optional.
  * <br>&nbsp;&nbsp;<code>chainIds</code> -  Array of chain IDs about the cross chain pair.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanGroupList","params":{chainIds:["2153201998", "2147483708"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanGroupList({chainIds:["2153201998", "2147483708"]}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanGroupList({chainIds:["2153201998", "2147483708"]});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [{
        "groupId": "0x0000000000000000000000000000000000000000000031353937383131313430",
        "preGroupId": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "workStart": "1597811150",
        "workDuration": "604800",
        "registerDuration": "60",
        "status": "5",
        "deposit": "8000",
        "chain1": [
          2153201998, // chain ID
          "WAN",  // chain symbol
          "Wanchain", // chain name
          5718350 // chain index
        ],
        "chain2": [
          2147483708, // chain ID
          "ETH", // chain symbol
          "Ethereum", // chain name
          60 // chain index
        ],
        "curve1": "1",
        "curve2": "1",
        "gpk1": "0x0c0f172647dc8752c8ea19f49efac9151113605d494c3b0272dea86e5fd63360154506052ec260dbefa10dd46dc77dff9b3c97940717442521409fb641299e62",
        "gpk2": "0x2f5e2c86302e5eec6607b727eb69c01fc47bde29328fbe5802db369e1d5452562927d105b660b05e7dcc7db98bfe86a90abf8fe7e08ed3584c1e952f43c73ee1",
        "registerTime": "1597811140",
        "endRegisterTime": "1597811200",
        "startTime": "1597811150",
        "endTime": "1598415950",
        "delegateFee": "100",
        "canStakeIn": false
   *  }]
   *
   */
  getStoremanGroupList(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroupList';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanGroupActivity
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroupActivity
   * @apiVersion 1.2.1
   * @apiDescription Get the storeman group active information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} groupId The storeman group ID.
   * @apiParam {object} [options] Optional.
   * <br>&nbsp;&nbsp;<code>fromEpoch</code> - The number that begin epochID you want to search.
   * <br>&nbsp;&nbsp;<code>toEpoch</code> - The number that end epochID you want to search.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanGroupActivity","params":{groupId: "0x0000000000000000000000000000000000000000000031353937383131313430"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanGroupActivity("0x0000000000000000000000000000000000000000000031353937383131313430", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanGroupActivity("0x0000000000000000000000000000000000000000000031353937383131313430");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
        "0": {
          "wkAddr":"0x5793e629c061e7fd642ab6a1b4d552cec0e2d606",
          "activity": "90"
        },
        ... ...
   *  }
   *
   */
  getStoremanGroupActivity(groupId, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroupActivity';
    let params = {groupId: groupId, ...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanGroupQuota
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroupQuota
   * @apiVersion 1.2.1
   * @apiDescription Get the storeman group quota information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The from chain being queried, default: <code>'WAN'</code>.
   * @apiParam {string} groupId The storeman group ID.
   * @apiParam {array} symbol The array of symbol being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanGroupQuota","params":{chainType:"BTC", groupId: "0x0000000000000000000000000000000000000000000031353937383131313430", symbol: ["BTC"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanGroupQuota("0x0000000000000000000000000000000000000000000031353937383131313430", ["BTC"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanGroupQuota("BTC", "0x0000000000000000000000000000000000000000000031353937383131313430", ["BTC"]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
        {
          "symbol": "BTC",
          "minQuota": "2",
          "maxQuota": "3312485144"
        }
   *  ]
   *
   */
  getStoremanGroupQuota(chainType, groupId, symbol, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroupQuota';
    let params = {chainType: chainType, groupId: groupId, symbol: symbol, ...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getStoremanGroupInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroupInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the detail info of one certain storemanGroup, include the info like the deposit, memberCount etc.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} groupId The storeman groupId being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanGroupInfo","params":{"groupId":"0x000000000000000000000000000000000000000000000000006a61636f622d32"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanGroupInfo("0x000000000000000000000000000000000000000000000000006a61636f622d32", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanGroupInfo("0x000000000000000000000000000000000000000000000000006a61636f622d32");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
      "groupId": "0x000000000000000000000000000000000000000000000000006a61636f622d32",
      "status": "5",
      "deposit": "10776900000000000000103",
      "depositWeight": "10814400000000000000099",
      "selectedCount": "21",
      "memberCount": "21",
      "whiteCount": "2",
      "whiteCountAll": "5",
      "startTime": "1600143517",
      "endTime": "1600489117",
      "registerTime": "1600142125",
      "registerDuration": "200",
      "memberCountDesign": "21",
      "threshold": "17",
      "chain1": "2153201998",
      "chain2": "2147483708",
      "curve1": "1",
      "curve2": "1",
      "tickedCount": "0",
      "minStakeIn": "2000",
      "minDelegateIn": "100",
      "minPartIn": "50",
      "crossIncoming": "0",
      "gpk1": "0x1d399574e29639e3d3e0a42a4af8c29a164e93787eaeff8f4d5f953b4d30a8f526239021ed69422ea4c7fd1a52ad583d302135c678f88addbf218091515ff918",
      "gpk2": "0x2353026c7886980f532304815fcae304849f6558a0f0d0676b183e445150599a1a9230eac233dec1c2bc64d4cbdb11d90952c2e8397a658a7f37e5f213517fd4",
      "delegateFee": "100"
   *  }
   *
   */
  getStoremanGroupInfo(groupId, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroupInfo';
    let params = {"groupId": groupId};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getMultiStoremanGroupInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiStoremanGroupInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the detail info of multi-storemanGroup, include the info like the deposit, memberCount etc.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} groupId The array of storeman groupId being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getMultiStoremanGroupInfo","params":{"groupId":["0x000000000000000000000000000000000000000000000000006a61636f622d32"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getMultiStoremanGroupInfo(["0x000000000000000000000000000000000000000000000000006a61636f622d32"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getMultiStoremanGroupInfo(["0x000000000000000000000000000000000000000000000000006a61636f622d32"]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [{
      "groupId": "0x000000000000000000000000000000000000000000000000006a61636f622d32",
      "status": "5",
      "deposit": "10776900000000000000103",
      "depositWeight": "10814400000000000000099",
      "selectedCount": "21",
      "memberCount": "21",
      "whiteCount": "2",
      "whiteCountAll": "5",
      "startTime": "1600143517",
      "endTime": "1600489117",
      "registerTime": "1600142125",
      "registerDuration": "200",
      "memberCountDesign": "21",
      "threshold": "17",
      "chain1": "2153201998",
      "chain2": "2147483708",
      "curve1": "1",
      "curve2": "1",
      "tickedCount": "0",
      "minStakeIn": "2000",
      "minDelegateIn": "100",
      "minPartIn": "50",
      "crossIncoming": "0",
      "gpk1": "0x1d399574e29639e3d3e0a42a4af8c29a164e93787eaeff8f4d5f953b4d30a8f526239021ed69422ea4c7fd1a52ad583d302135c678f88addbf218091515ff918",
      "gpk2": "0x2353026c7886980f532304815fcae304849f6558a0f0d0676b183e445150599a1a9230eac233dec1c2bc64d4cbdb11d90952c2e8397a658a7f37e5f213517fd4",
      "delegateFee": "100"
    * }]
   *
   */
  getMultiStoremanGroupInfo(groupId, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMultiStoremanGroupInfo';
    let params = {"groupId": groupId};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getStoremanGroupConfig
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroupConfig
   * @apiVersion 1.2.1
   * @apiDescription Get the detail config of one certain storemanGroup, include the info like the chain1/curve1/gpk1/chain2/curve2/gpk2, etc.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} groupId The storeman groupId being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanGroupConfig","params":{"groupId":"0x0000000000000000000000000000000000000000000031353937383131313430"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanGroupConfig("0x0000000000000000000000000000000000000000000031353937383131313430", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanGroupConfig("0x0000000000000000000000000000000000000000000031353937383131313430");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
        "groupId": "0x0000000000000000000000000000000000000000000031353937383131313430",
        "status": "5",
        "deposit": "8000",
        "chain1": "2153201998",
        "chain2": "2147483708",
        "curve1": "1",
        "curve2": "1",
        "gpk1": "0x0c0f172647dc8752c8ea19f49efac9151113605d494c3b0272dea86e5fd63360154506052ec260dbefa10dd46dc77dff9b3c97940717442521409fb641299e62",
        "gpk2": "0x2f5e2c86302e5eec6607b727eb69c01fc47bde29328fbe5802db369e1d5452562927d105b660b05e7dcc7db98bfe86a90abf8fe7e08ed3584c1e952f43c73ee1",
        "startTime": "1597811150",
        "endTime": "1598415950"
   *  }
   *
   */
  getStoremanGroupConfig(groupId, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroupConfig';
    let params = {"groupId": groupId};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the detail info of one certain storeman, include the info like the groupid, deposit, delegatorDeposit, incentive, etc.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} wkAddr The storeman wkAddr being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanInfo","params":{"wkAddr":"0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanInfo("0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanInfo("0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * {
      "sender": "0xc3badB2686A540564D68870E853b39bEe843F6dB",
      "enodeID": "0xc532e740b50d2a620dbc3b5842cb6f30ea68910cefef256095f1598966068a135276b1f626958bc4550ce15191d48e2056e971d46599a64f70237fe847845766",
      "PK": "0x02ccb9853b4fb6b78875e76e3f586249663f4c0cb435e2c82e9e4ca846b8148138f8b428d195edb0bf4ea87fb4934866262e11f19994010719d4cf7267281e9c",
      "wkAddr": "0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C",
      "isWhite": true,
      "quited": false,
      "delegatorCount": "4",
      "delegateDeposit": "175000000000000000000",
      "partnerCount": "1",
      "partnerDeposit": "10500000000000000000000",
      "crossIncoming": "0",
      "slashedCount": "0",
      "incentivedDelegator": "0",
      "incentivedDay": "18518",
      "groupId": "0x0000000000000000000000000000000000000000000000000000006a61636f62",
      "nextGroupId": "0x000000000000000000000000000000000000000000000000006a61636f622d32",
      "deposit": "25000000000000000000",
      "incentive": "78662592388931115"
   * }
   *
   */
  getStoremanInfo(wkAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanInfo';
    let params = {wkAddr: wkAddr};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getMultiStoremanInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiStoremanInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the detail info of multi certain storeman, include the info like the groupid, deposit, delegatorDeposit, incentive, etc.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {array} wkAddr The array of storeman wkAddr being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getMultiStoremanInfo","params":{"wkAddr":["0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getMultiStoremanInfo(["0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getMultiStoremanInfo(["0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C"]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [
      {
        "sender": "0xc3badB2686A540564D68870E853b39bEe843F6dB",
        "enodeID": "0xc532e740b50d2a620dbc3b5842cb6f30ea68910cefef256095f1598966068a135276b1f626958bc4550ce15191d48e2056e971d46599a64f70237fe847845766",
        "PK": "0x02ccb9853b4fb6b78875e76e3f586249663f4c0cb435e2c82e9e4ca846b8148138f8b428d195edb0bf4ea87fb4934866262e11f19994010719d4cf7267281e9c",
        "wkAddr": "0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C",
        "isWhite": true,
        "quited": false,
        "delegatorCount": "4",
        "delegateDeposit": "175000000000000000000",
        "partnerCount": "1",
        "partnerDeposit": "10500000000000000000000",
        "crossIncoming": "0",
        "slashedCount": "0",
        "incentivedDelegator": "0",
        "incentivedDay": "18518",
        "groupId": "0x0000000000000000000000000000000000000000000000000000006a61636f62",
        "nextGroupId": "0x000000000000000000000000000000000000000000000000006a61636f622d32",
        "deposit": "25000000000000000000",
        "incentive": "78662592388931115"
      }
   * ]
   *
   */
  getMultiStoremanInfo(wkAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMultiStoremanInfo';
    let params = {wkAddr: wkAddr};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanConf
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanConf
   * @apiVersion 1.2.1
   * @apiDescription Get the conf info of one certain storeman, include the info about backupCount, standaloneWeight, delegatorDeposit and delegationMulti.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanConf","params":{},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanConf((err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanConf();
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * {
      "backupCount": "3",
      "standaloneWeight": "1500",
      "DelegationMulti": "10"
   * }
   *
   */
  getStoremanConf(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanConf';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanCandidates
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanCandidates
   * @apiVersion 1.2.1
   * @apiDescription Get the storeman candidates info of one certain storeman group.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} groupId The storeman group ID being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanCandidates","params":{"groupId":"0x0000000000000000000000000000000000000000000000003133323936333039"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanCandidates("0x0000000000000000000000000000000000000000000000003133323936333039", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanCandidates("0x0000000000000000000000000000000000000000000000003133323936333039");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [
      {
        "sender": "0x4Eb7Cb5411D13014A69EDc089AA75a6E1fd0Aa68",
        "PK": "0xbe3b7fd88613dc272a36f4de570297f5f33b87c26de3060ad04e2ea697e13125a2454acd296e1879a7ddd0084d9e4e724fca9ef610b21420978476e2632a1782",
        "wkAddr": "0x23DcbE0323605A7A00ce554baBCFF197bAF99B10",
        "quited": false,
        "deposit": "2000",
        "delegateDeposit": "0",
        "incentive": "0",
        "delegatorCount": "0",
        "groupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "nextGroupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "incentivedDay": "13319374",
        "slashedCount": "0"
      },
      {
        "sender": "0x7F1d642DbfD62aD4A8fA9810eA619707d09825D0",
        "PK": "0x25fa6a4190ddc87d9f9dd986726cafb901e15c21aafd2ed729efed1200c73de89f1657726631d29733f4565a97dc00200b772b4bc2f123a01e582e7e56b80cf8",
        "wkAddr": "0x5793e629c061e7FD642ab6A1b4d552CeC0e2D606",
        "quited": false,
        "deposit": "2000",
        "delegateDeposit": "0",
        "incentive": "0",
        "delegatorCount": "0",
        "groupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "nextGroupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "incentivedDay": "13319374",
        "slashedCount": "0",
        "name": "phorest.xyz",
        "url": "https://phorest.xyz/wan",
        "iconData": "...",
        "iconType": "png"
      },
      ... ...
   * ]
   *
   */
  getStoremanCandidates(groupId, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanCandidates';
    let params = {"groupId": groupId};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getStoremanCandidatesV2(groupId, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanCandidatesV2';
    let params = {"groupId": groupId};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanGroupMember
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroupMember
   * @apiVersion 1.2.1
   * @apiDescription Get the storeman member info of one certain storeman group.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} groupId The storeman group ID being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanGroupMember","params":{"groupId":"0x0000000000000000000000000000000000000000000031353938353934383939"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanGroupMember("0x0000000000000000000000000000000000000000000031353938353934383939", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanGroupMember("0x0000000000000000000000000000000000000000000031353938353934383939");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [
      {
        "isWhite": true,
        "sender": "0x7F1d642DbfD62aD4A8fA9810eA619707d09825D0",
        "PK": "0x25fa6a4190ddc87d9f9dd986726cafb901e15c21aafd2ed729efed1200c73de89f1657726631d29733f4565a97dc00200b772b4bc2f123a01e582e7e56b80cf8",
        "wkAddr": "0x5793e629c061e7FD642ab6A1b4d552CeC0e2D606",
        "quited": false,
        "deposit": "2000",
        "delegateDeposit": "0",
        "incentive": "0",
        "delegatorCount": "0",
        "groupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "nextGroupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "incentivedDay": "13319374",
        "slashedCount": "0",
        "name": "phorest.xyz",
        "url": "https://phorest.xyz/wan",
        "iconData": "...",
        "iconType": "png"
      },
      {
        "isWhite": false,
        "sender": "0x6f64f6D0d58ACABD288774e993d9caCFa3FC88eE",
        "PK": "0xccd16e96a70a5b496ff1cec869902b6a8ffa00715897937518f1c9299726f7090bc36cc23c1d028087eb0988c779663e996391f290631317fc22f84fa9bf2467",
        "wkAddr": "0x82EF7751A5460BC10F731558f0741705BA972f4E",
        "quited": false,
        "deposit": "2000",
        "delegateDeposit": "0",
        "incentive": "0",
        "delegatorCount": "0",
        "groupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "nextGroupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
        "incentivedDay": "13319377",
        "slashedCount": "0"
      },
      ... ...
   * ]
   *
   */
  getStoremanGroupMember(groupId, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroupMember';
    let params = {"groupId": groupId};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getStoremanGroupMemberV2(groupId, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGroupMemberV2';
    let params = {"groupId": groupId};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanStakeInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanStakeInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the stake info of certain storeman.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
  * @apiParam {object} options Details:
  * <br>&nbsp;&nbsp;<code>address</code> - The array of storeman from address being queried.
  * <br>&nbsp;&nbsp;<code>wkAddr</code> - The string of storeman work address being queried.
  * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanStakeInfo","params":{"wkAddr":"0x332651327037257C5f3A736f4d5Fb58C5187219e"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanStakeInfo({wkAddr: "0x332651327037257C5f3A736f4d5Fb58C5187219e"}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanStakeInfo({wkAddr: "0x332651327037257C5f3A736f4d5Fb58C5187219e"});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [
      {
        "enodeID": "0x0c9d2e32575d88d0c1baa78dfe89e8a09c8966e0e2b8c7e478b101b867f7aac2608202161fd7aa0cf8db707b45802d3a0e06230ba9b17dd2713ca2705eeccbd5",
        "PK": "0x86346d9a907d66df15ac607f93e7b9c814567b835fff0cd87e69fb5ab26a78dd3580bb5f5662961c7425ef1de2ce984a99dcb42f6f8b54e5b733181fa7a48f6a",
        "wkAddr": "0x332651327037257C5f3A736f4d5Fb58C5187219e",
        "isWhite": false,
        "quited": false,
        "delegatorCount": "0",
        "delegateDeposit": "0",
        "partnerCount": "0",
        "partnerDeposit": "0",
        "crossIncoming": "0",
        "slashedCount": "0",
        "incentivedDelegator": "0",
        "incentivedDay": "18518",
        "groupId": "0x0000000000000000000000000000000000000000000000000000006a61636f62",
        "nextGroupId": "0x000000000000000000000000000000000000000000000000006a61636f622d32",
        "deposit": "2499999999999999977",
        "from": "0x1fB80dC60Ee4F518A2F18B9565Ff31e466Fd1fAc",
        "rank": 21,
        "selectedCount": 21,
        "activity": "NaN",
        "canStakeOut": true,
        "canStakeClaim": false
      }
   * ]
   *
   */

  getStoremanStakeInfo(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanStakeInfo';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanStakeTotalIncentive
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanStakeTotalIncentive
   * @apiVersion 1.2.1
   * @apiDescription Get the total incentive info of certain storeman stake.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
  * @apiParam {object} options Details:
  * <br>&nbsp;&nbsp;<code>address</code> - The array of storeman from address being queried.
  * <br>&nbsp;&nbsp;<code>wkAddr</code> - The string of storeman work address being queried.
  * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
  * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanStakeTotalIncentive","params":{"wkAddr":"0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanStakeTotalIncentive({"wkAddr":"0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanStakeTotalIncentive({"wkAddr":"0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [
      {
        "wkAddr": "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c",
        "amount": "0",
        "from": "0xc3badb2686a540564d68870e853b39bee843f6db",
        "timestamp": 1600839970
      }
   * ]
   *
   */

  getStoremanStakeTotalIncentive(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanStakeTotalIncentive';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanDelegatorInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanDelegatorInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the delegator info on certain storeman.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
  * @apiParam {object} options Details:
  * <br>&nbsp;&nbsp;<code>address</code> - The array of delegator's address being queried.
  * <br>&nbsp;&nbsp;<code>wkAddr</code> - The array of storeman work address being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanDelegatorInfo","params":{"wkAddr":["0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanDelegatorInfo({"wkAddr":["0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"]}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanDelegatorInfo({"wkAddr":["0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"}]);
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
        {
          "from": "0x8e12f79275b1c251b0eb5753d18b8a0bfdd8f7cb",
          "wkAddr": "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c",
          "deposit": "100000000000000000000",
          "incentive": "112906519254666719",
          "groupId": "0x000000000000000000000000000000000000000000746573746e65745f303038",
          "wkStake": {
            "deposit": "10100000000000000000000",
            "delegateDeposit": "500000000000000000000",
            "partnerDeposit": "10000000000000000000000"
          },
          "chain1": [
            2153201998,
            "WAN",
            "Wanchain",
            5718350
          ],
          "chain2": [
            2147483708,
            "ETH",
            "Ethereum",
            60
          ],
          "quited": false,
          "canDelegateOut": true,
          "canDelegateClaim": false
        },
        {
          "from": "0xe659b7c9d33563103b206bd7fce7d53a5eeaaeed",
          "wkAddr": "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c",
          "deposit": "200000000000000000000",
          "incentive": "1276848200329784586",
          "groupId": "0x000000000000000000000000000000000000000000746573746e65745f303038",
          "wkStake": {
            "deposit": "10100000000000000000000",
            "delegateDeposit": "500000000000000000000",
            "partnerDeposit": "10000000000000000000000"
          },
          "chain1": [
            2153201998,
            "WAN",
            "Wanchain",
            5718350
          ],
          "chain2": [
            2147483708,
            "ETH",
            "Ethereum",
            60
          ],
          "quited": true,
          "canDelegateOut": false,
          "canDelegateClaim": true
        }
   *  ]
   *
   */

  getStoremanDelegatorInfo(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanDelegatorInfo';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanDelegatorTotalIncentive
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanDelegatorTotalIncentive
   * @apiVersion 1.2.1
   * @apiDescription Get the delegator total incentive info.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
  * @apiParam {object} options Details:
  * <br>&nbsp;&nbsp;<code>address</code> - The array of storeman from address being queried.
  * <br>&nbsp;&nbsp;<code>wkAddr</code> - The string of storeman work address being queried.
  * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
  * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanDelegatorTotalIncentive","params":{"wkAddr":"0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanDelegatorTotalIncentive({"wkAddr":"0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanDelegatorTotalIncentive({"wkAddr":"0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
        {
          "wkAddr": "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c",
          "amount": "2070283666843429698",
          "from": "0x9930893f7c5febcd48b61dc8987e3e9fcc5ad0c9",
          "timestamp": 1602323725
        },
        {
          "wkAddr": "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c",
          "amount": "1050077380462015683",
          "from": "0x8e12f79275b1c251b0eb5753d18b8a0bfdd8f7cb",
          "timestamp": 1603101540
        },
        ... ...
   *  ]
   *
   */

  getStoremanDelegatorTotalIncentive(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanDelegatorTotalIncentive';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanGpkSlashInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGpkSlashInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the gpk slash info of certain storeman.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
  * @apiParam {object} options Details:
  * <br>&nbsp;&nbsp;<code>wkAddr</code> - The array of storeman work address being queried.
  * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
  * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
  * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanGpkSlashInfo","params":{"wkAddr":["0x2EBE3b8D6019AFb1ee724F56081D91b803e8553f"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanGpkSlashInfo({"wkAddr":["0x2EBE3b8D6019AFb1ee724F56081D91b803e8553f"]}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanGpkSlashInfo({"wkAddr":["0x2EBE3b8D6019AFb1ee724F56081D91b803e8553f"]});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
        {
          "groupId": "0x000000000000000000000000000000000000000000000041726965735f303031",
          "slashType": "1",
          "slashed": "0x2ebe3b8d6019afb1ee724f56081d91b803e8553f",
          "partner": "0x0000000000000000000000000000000000000000",
          "round": "0",
          "curveIndex": "0",
          "timestamp": 1602904015
        }
   *  ]
   *
   */

  getStoremanGpkSlashInfo(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanGpkSlashInfo';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

    /**
   *
   * @apiName getStoremanSignSlashInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanSignSlashInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the sign slash info of certain storeman.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
  * @apiParam {object} options Details:
  * <br>&nbsp;&nbsp;<code>wkAddr</code> - The array of storeman work address being queried.
  * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
  * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
  * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStoremanSignSlashInfo","params":{groupId:"0x000000000000000000000000000000000000000000746573746e65745f303032", "wkAddr":["0x5793e629c061e7fd642ab6a1b4d552cec0e2d606"]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getStoremanSignSlashInfo({groupId:"0x000000000000000000000000000000000000000000746573746e65745f303032","wkAddr":["0x5793e629c061e7fd642ab6a1b4d552cec0e2d606"]}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getStoremanSignSlashInfo({groupId:"0x000000000000000000000000000000000000000000746573746e65745f303032", "wkAddr":["0x5793e629c061e7fd642ab6a1b4d552cec0e2d606"]});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
        {
          "groupId": "0x000000000000000000000000000000000000000000746573746e65745f303032",
          "hashX": "0x8c612956d2251a8701368a4d1e1eb7cc396ae5c20929f82e818876a77a4b2618",
          "smIndex": "9",
          "slshReason": "3"
        },
        {
          "groupId": "0x000000000000000000000000000000000000000000746573746e65745f303032",
          "hashX": "0x8c68c02d9387b82f2e46f8f363a75b075926a1b9c6c5b5862fa2401cf49fcd4d",
          "smIndex": "10",
          "slshReason": "3"
        },
        ... ...
   *  ]
   *
   */

  getStoremanSignSlashInfo(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStoremanSignSlashInfo';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getTokenPairs
   * @apiGroup TokensV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenPairs
   * @apiVersion 1.2.1
   * @apiDescription Get the info of all register tokenPairs, like fromChainID, toChainID, tokenAddress.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {object} [options] Optional:
   * <br>&nbsp;&nbsp;<code>chainIds</code> - Optional, the array of two chain IDs of cross chain pair.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTokenPairs","params":{chainIds:[2147483708, 2153201998]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getTokenPairs({chainIds:[2147483708, 2153201998]}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getTokenPairs({chainIds:[2147483708, 2153201998]});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [
      {
        "id": "1",
        "fromChainID": "2147483708",
        "fromAccount": "0x0000000000000000000000000000000000000000",
        "toChainID": "2153201998",
        "toAccount": "0xfabd5d341dd3b933ea9906d921df7be79c156e8d",
        "ancestorSymbol": "ETH",
        "ancestorDecimals": "18",
        "name": "wanETH@Wanchain", // toAccount name
        "symbol": "wanETH",        // toAccount symbol
        "decimals": "18"
      },
      {
        "id": "2",
        "fromChainID": "2153201998",
        "fromAccount": "0x0000000000000000000000000000000000000000",
        "toChainID": "2147483708",
        "toAccount": "0xf832a671af322a28493b26d56c952795c05d7b11",
        "ancestorSymbol": "WAN",
        "ancestorDecimals": "18",
        "name": "WAN@Ethereum", // toAccount name
        "symbol": "WAN",        // toAccount symbol
        "decimals": "18"
      },
      {
        "id": "3",
        "fromChainID": "2147483708",
        "fromAccount": "0x01be23585060835e02b77ef475b0cc51aa1e0709",
        "toChainID": "2153201998",
        "toAccount": "0x6e7bc85ab206965a4118da06c9e66bd49bdc33b8",
        "ancestorSymbol": "LINK",
        "ancestorDecimals": "18",
        "name": "wanLINK@Wanchain", // toAccount name
        "symbol": "wanLINK",        // toAccount symbol
        "decimals": "18"
      },
      {
        "id": "4",
        "fromChainID": "2153201998",
        "fromAccount": "0x2283d27be033d183f0f46e70992ebc1356f6e8b3",
        "toChainID": "2147483708",
        "toAccount": "0xf9a9ef6078bd6679d530ad61c6108ab3ea3b1ba8",
        "ancestorSymbol": "FNX",
        "ancestorDecimals": "18",
        "name": "wanFNX@Ethereum", // toAccount name
        "symbol": "wanFNX",        // toAccount symbol
        "decimals": "18"
      },
      {
        "id": "5",
        "fromChainID": "2153201998",
        "fromAccount": "0xc978c14020b4a5965337fb141d2187f387de5ce8",
        "toChainID": "2147483708",
        "toAccount": "0x1c5e5c977f95681923a026ab1ed72ff1a12b0737",
        "ancestorSymbol": "BTC",
        "ancestorDecimals": "8",
        "name": "wanBTC@Ethereum", // toAccount name
        "symbol": "wanBTC",        // toAccount symbol
        "decimals": "8"
      },
      {
        "id": "6",
        "fromChainID": "2153201998",
        "fromAccount": "0x31ddd0bd73bb1fd4068acc91c966b99c24b016d8",
        "toChainID": "2147483708",
        "toAccount": "0xdd8ad504b0ffbf5188c69ef8914f9bd3b5b8e4df",
        "ancestorSymbol": "EOS",
        "ancestorDecimals": "4",
        "name": "wanEOS@Ethereum", // toAccount name
        "symbol": "wanEOS",        // toAccount symbol
        "decimals": "4"
      }
   * ]
   *
   */
  getTokenPairs(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenPairs';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getTokenPairInfo
   * @apiGroup TokensV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenPairInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the info of tokenPair of certain tokenPairId, like fromChainID, toChainID, tokenAddress.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} id The tokenPairId being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTokenPairInfo","params":{"id":"1"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getTokenPairInfo("1", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getTokenPairInfo("1");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
        "fromChainID": "2147483708",
        "fromAccount": "0x0000000000000000000000000000000000000000",
        "toChainID": "2153201998",
        "toAccount": "0x36FfEcE47A3BaF210b26cc469E37eef2212d9812"
   *   }
   *
   */
  getTokenPairInfo(id, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenPairInfo';
    let params = {"id": id};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getTokenPairAncestorInfo
   * @apiGroup TokensV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenPairAncestorInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the info of tokenPair Ancestor of certain tokenPairId, like symbol, decimals.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} id The tokenPairId being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTokenPairAncestorInfo","params":{"id":"1"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getTokenPairAncestorInfo("1", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getTokenPairAncestorInfo("1");
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  {
      "account": "0x0000000000000000000000000000000000000000",
      "name": "eth",
      "symbol": "ETH",
      "decimals": "18",
      "chainId": "2147483708"
   * }
   *
   */
  getTokenPairAncestorInfo(id, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenPairAncestorInfo';
    let params = {"id": id};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getTokenPairIDs
   * @apiGroup TokensV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenPairIDs
   * @apiVersion 1.2.1
   * @apiDescription Get all register tokenPairIDs.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {object} [options] Optional:
   * <br>&nbsp;&nbsp;<code>chainIds</code> - Optional, the array of two chain IDs of cross chain pair.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTokenPairIDs","params":{chainIds: [2147483708, 2153201998]},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getTokenPairIDs({chainIds: [2147483708, 2153201998]}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getTokenPairIDs({chainIds: [2147483708, 2153201998]});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [ '1', '2', '3', '4' ]
   *
   */
  getTokenPairIDs(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenPairIDs';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getChainConstantInfo
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getChainConstantInfo
   * @apiVersion 1.2.1
   * @apiDescription Get the chainInfo by the chain id which is used as hardened derivation in BIP44.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {object} options Details:
   * <br>&nbsp;&nbsp;<code>chainId</code> - The chain id that you want to search, should like <code>"2153201998"</code>. Adding it to 2^31 to get the final hardened key index, 0x80000000 + 5718350(chain index) = 0x8057414e.
   * <br>&nbsp;&nbsp;<code>symbol</code> - The chain symbol that you want to search, should like <code>"WAN"</code>.
   * <br>&nbsp;&nbsp;<code>index</code> - The chain index that you want to search, should like <code>"5718350"</code>.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getChainConstantInfo","params":{"chainId":"2153201998"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getChainConstantInfo({"chainId":"2153201998"}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getChainConstantInfo({"chainId":"2153201998"});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   *  [
   *    2153201998, // chain ID
   *    "WAN", // chain symbol
   *    "Wanchain", // chain name
   *    "5718350" // chainIndex
   *  ]
   *
   */
  getChainConstantInfo(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {}
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getChainConstantInfo';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getPrdInctMetric(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getPrdInctMetric';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getSelectedSmInfo(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getSelectedSmInfo';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getSelectedStoreman
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getSelectedStoreman
   * @apiVersion 1.2.1
   * @apiDescription Get all the selected storeman.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {object} options Optional:
   * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSelectedStoreman","params":{groupId:"0x000000000000000000000000000000000000000000746573746e65745f303031"},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getSelectedStoreman({groupId:"0x000000000000000000000000000000000000000000746573746e65745f303031"}, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getSelectedStoreman({groupId:"0x000000000000000000000000000000000000000000746573746e65745f303031"});
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * [
      "0x5C770cBf582D770b93cA90AdaD7E6BD33fAbC44C",
      "0x17e7120ED515b98AD868366cfe37B3B2f59662E8",
      "0x35a7322c6c5262B469856BcF6df9A5049cF4A815",
      "0x6C5E293C36a87B3a0282207c8650066469d9dA73",
      "0x333065360359A6992c57d2DB0F7E41CB194fbBC0",
      "0x5e5dA1DcE5ebF135B0CF06FE004D4B0178755d6F",
      "0x6a86210203d9Efa630a16F8a09dCEC473fbbaEe2",
      "0x0748e35A742419710393D0C5739e9353FD9a77F2",
      "0x042cB0BF6997BF6eBBa90830cf3f7Ebe01A528fd",
      "0x8D271c767e538f670d7c4E0438AB8C71128c0f97",
      "0x523946badBC216ab6Bb88c96e05280033226cBDf",
      "0xc286577b0BA0d0F7BD786887FD2F3B31F41C5e0b",
      "0x425C5156F2e801d38F4c559d94AF1408c1fdc992",
      "0x229a142a636e1910fe93fF5Ce7FF711553e7D3Bb",
      "0x597148f4eaC61B6b51dd3f789c300d97fE4E35Ba",
      "0x8259fDDC9a21F5d89452773978A3C2C961d7e747",
      "0x9e40D2F77eAc05e6027550FDC5e1832DD812DD10",
      "0xF3F0C1a1385f469ED637d5fDf2d903DEB6C6F1E2",
      "0x0bBA6A7cA768873a5FCc525CfeD0e7828cE001ae",
      "0x7EDba0748b88D7eFa771611b12A6fF86bFa14F2D",
      "0x9ac5fCe406B0aBcfE5B1019D4778A5D79597d992"
   * ]
   *
   */
  getSelectedStoreman(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getSelectedStoreman';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getSmDelegatorInfo(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getSmDelegatorInfo';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  /**
   *
   * @apiName getRewardRatio
   * @apiGroup CrossChainV2
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getRewardRatio
   * @apiVersion 1.2.1
   * @apiDescription Get the reward ratio.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {function} [callback] Optional, the callback will receive two parameters:
   * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
   * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRewardRatio","params":{},"id":1}
   *
  * @apiExample {nodejs} Example callback usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   apiTest.getRewardRatio((err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
  * @apiExample {nodejs} Example promise usage:
  *   const ApiInstance = require('iwan-sdk');
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getRewardRatio();
   *   console.log("Result is ", result);
   *   apiTest.close();
   *
   * @apiSuccessExample {json} Successful Response
   * "0.1000"
   *
   */
  getRewardRatio(options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRewardRatio';
    let params = {...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  multiCall(chainType, calls, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'multiCall';
    let params = {chainType: chainType, calls: calls, ...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getCode(chainType, address, options, callback) {
    if (typeof(options) === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof(options) !== "object") {
      options = {};
    }
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getCode';
    let params = {chainType: chainType, address: address, ...options};

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

}

module.exports = ApiInstance;
