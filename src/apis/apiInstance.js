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
   * @apiVersion 1.1.0
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
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.monitorEvent('WAN', '0x0d18157D85c93A86Ca194DB635336E43B1Ffbd26', ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
  * @apiDescription Get smart contract event log via topics.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} address The contract address.
  * @apiParam {array} topics An array of string values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x00...'].
  * @apiParam {function} [callback] Optional, the callback will receive two parameters: 
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScEvent","params":{"chainType":"WAN", "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167", "topics": ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getScEvent('WAN', '0xda5b90dc89be59365ec44f3f2d7af8b6700d1167', ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  getScEvent(chainType, address, topics, fromBlock, toBlock, callback) {
    let method = 'getScEvent';
    let params = { chainType: chainType, address: address, topics: topics };

    if (fromBlock) {
      if (typeof(fromBlock) === "function") {
        callback = fromBlock;
      } else {
        params.fromBlock = fromBlock;
      }
    }
    if (toBlock) {
      if (typeof(toBlock) === "function") {
        callback = toBlock;
      } else {
        params.toBlock = toBlock;
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getScOwner('WAN', '0x59adc38f0b3f64fb542b50e3e955e7a8c1eb3e3b', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getCoin2WanRatio('ETH', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  * 
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getUTXO('BTC', 0, 100, ["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiName getStoremanGroups
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroups
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getStoremanGroups('ETH', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
  * @apiDescription Get the detail cross-chain storemanGroup info for one specific token contract, like the quota, etc.
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
  * {"jsonrpc":"2.0","method":"getTokenStoremanGroups","params":{"crossChain":"ETH", "tokenScAddr":"0x00f58d6d585f84b2d7267940cede30ce2fe6eae8"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTokenStoremanGroups('ETH', '0x00f58d6d585f84b2d7267940cede30ce2fe6eae8', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getGasPrice('WAN', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getBalance('WAN', '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getMultiBalances('WAN', ["0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","0x2cc79fa3b80c5b9b02051facd02478ea88a78e2d"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTokenBalance("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getMultiTokenBalance("WAN", ["0xfac95c16da814d24cc64b3186348afecf527324f","0xfac95c16da814d24cc64b3186348afecf527324e"], "0x63eed4943abaac5f43f657d8eec098ca6d6a546e", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTokenSupply("WAN", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getNonce("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getNonceIncludePending("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getBlockNumber("WAN", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.sendRawTransaction('WAN', '0xf86e0109852e90edd000832dc6c0946ed9c11cbd8a6ae8355fa62ebca48493da572661880de0b6b3a7640000801ca0bd349ec9f51dd171eb5c59df9a6b8c5656eacb6793bed945a7ec69135f191abfa0359da11e8a4fdd51b52a8752ac32f9125d168441546d011406736bce67b8a356', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
  * @apiDescription Get the transaction detail via txHash on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code> or <code>"ETH"</code> or <code>"BTC"</code>.
  * @apiParam {string} txHash The txHash you want to search.
  * @apiParam {bool} [format] Whether to get the serialized or decoded transaction, in this case, <code>chainType</code> should be <code>"BTC"</code>:
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTxInfo("WAN", "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  getTxInfo(chainType, txHash, format, callback) {
    let maxArgsize = 4;
    let mixArgsize = 2;
    let method = 'getTxInfo';
    let params = { chainType: chainType, txHash: txHash };

    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    for (let i = mixArgsize; i < maxArgsize; ++i) {
      if (typeof(arguments[i]) === "function") {
        callback = arguments[i];
      } else if ("BTC" === chainType && typeof(arguments[i]) === "boolean") {
        params["format"] = arguments[i];
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
  * @apiName getBlockByNumber
  * @apiGroup Blocks
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockByNumber
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getBlockByNumber("WAN", "670731", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getBlockByHash("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getBlockTransactionCount("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8", (err, result) => {
  *   // apiTest.getBlockTransactionCount("WAN", "670731", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTransactionConfirm("WAN", 6, "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  getTransactionConfirm(chainType, waitBlocks, txHash, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransactionConfirm';
    let params = { chainType: chainType, waitBlocks: waitBlocks, txHash: txHash };

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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTransactionReceipt("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  getTransactionReceipt(chainType, txHash, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTransactionReceipt';
    let params = { chainType: chainType, txHash: txHash };

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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTransByBlock("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe", (err, result) => {
  *   // apiTest.getTransByBlock("WAN", "984133", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTransByAddress("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
  * @apiDescription Get transaction information via the specified address between the specified startBlockNo and endBlockNo on certain chain.
  * <br>Comments:
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no startBlockNo given, startBlockNo will be set to 0;
  * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no endBlockNo given, endBlockNo will be set to the newest blockNumber.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain name that you want to search, should be <code>"WAN"</code>.
  * @apiParam {string} address The account's address that you want to search.
  * @apiParam {number} startBlockNo The startBlockNo that you want to search from.
  * @apiParam {number} endBlockNo The endBlockNo that you want to search to.
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTransByAddressBetweenBlocks("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", 984119, 984120, (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiName getScVar
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScVar
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getScVar("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "addr", [/The Abi of the contracts/], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getScVar("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "addr", [/The Abi of the contracts/]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *   "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
  *
  */
  getScVar(chainType, scAddr, name, abi, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getScVar';
    let params = { chainType: chainType, scAddr: scAddr, name: name, abi: abi };

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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getScMap("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "mapAddr", "key", [/The Abi of the contracts/], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getScMap("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "mapAddr", "key", [/The Abi of the contracts/]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *   "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
  *
  */
  getScMap(chainType, scAddr, name, key, abi, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getScMap';
    let params = { chainType: chainType, scAddr: scAddr, name: name, key: key, abi: abi };

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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.callScFunc("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "getPriAddress", [], [/The Abi of the contracts/]), (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.callScFunc("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "getPriAddress", [], [/The Abi of the contracts/]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *   "0x8cc420e422b3fa1c416a14fc600b3354e3312524"
  *
  */
  callScFunc(chainType, scAddr, name, args, abi, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'callScFunc';
    let params = { chainType: chainType, scAddr: scAddr, name: name, args: args, abi: abi };

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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getP2shxByHashx("BTC", "d2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.importAddress("BTC", "mmmmmsdfasdjflaksdfasdf", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiName getRegTokens
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegTokens
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getRegTokens("ETH", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getRegTokens("ETH");
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *   [{
     "tokenOrigAddr": "0x54950025d1854808b09277fe082b54682b11a50b",
     "tokenWanAddr": "0xe336cb9b982cdc8055771bd509ac8b89d3b7a3af",
     "ratio": "5700000",
     "minDeposit": "100000000000000000000",
     "origHtlc": "0x87a0dee965e7679d15327ce0cc3df8dfc009b43d",
     "wanHtlc": "0xe10515355e684e515c9c632c9eed04cca425cda1",
     "withdrawDelayTime": "259200"
   }, {
     "tokenOrigAddr": "0xdbf193627ee704d38495c2f5eb3afc3512eafa4c",
     "tokenWanAddr": "0x47db5125f4af190093b0ec2c502959d39dcbc4fa",
     "ratio": "5000",
     "minDeposit": "100000000000000000000",
     "origHtlc": "0x87a0dee965e7679d15327ce0cc3df8dfc009b43d",
     "wanHtlc": "0xe10515355e684e515c9c632c9eed04cca425cda1",
     "withdrawDelayTime": "259200"
   }, {
     "tokenOrigAddr": "0x00f58d6d585f84b2d7267940cede30ce2fe6eae8",
     "tokenWanAddr": "0x8b9efd0f6d5f078520a65ad731d79c0f63675ec0",
     "ratio": "3000",
     "minDeposit": "100000000000000000000",
     "origHtlc": "0x87a0dee965e7679d15327ce0cc3df8dfc009b43d",
     "wanHtlc": "0xe10515355e684e515c9c632c9eed04cca425cda1",
     "withdrawDelayTime": "259200"
   }]
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTokenAllowance("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getTokenInfo("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getMultiTokenInfo("ETH", ["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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
  * @apiVersion 1.1.0
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
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getToken2WanRatio("ETH", "0x00f58d6d585f84b2d7267940cede30ce2fe6eae8", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
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

  getStats(chainType, tokenScAddr, symbol, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getStats';
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

  getJson2Bin(chainType, scAddr, action, args, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getJson2Bin';

    let params = { chainType: chainType, scAddr:scAddr, action:action, args:args };

    return utils.promiseOrCallback(callback, cb => {
      this._request(method, params, (err, result) => {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    });
  }

  getActions(chainType, address, indexPos, offset, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getActions';

    let params = { chainType: chainType, address:address };

    if (indexPos) {
      if (typeof(indexPos) === "function") {
        callback = indexPos;
      } else {
        params.indexPos = indexPos;
      }
    }
    if (offset) {
      if (typeof(offset) === "function") {
        callback = offset;
      } else {
        params.offset = offset;
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

  getResource(chainType, address, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getResource';
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

  //POS

  /**
   *
   * @apiName getEpochID
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getEpochID
   * @apiVersion 1.1.0
   * @apiDescription Get the current Epoch ID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochID","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getEpochID("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the current epoch slot ID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotID","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getSlotID("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the public key list of the epoch leaders of the specified EpochID with the input parameter as EpochID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochLeadersByEpochID","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getEpochLeadersByEpochID("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Gets Random Number Proposer public keys of the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRandomProposersByEpochID","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getRandomProposersByEpochID("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Returns an array of validator information for all validators in the specified block number.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} blockNumber The blockNumber you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getStakerInfo","params":{"chainType":"WAN", "blockNumber":3496619},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getStakerInfo("WAN", 3496619, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the reward information of the specified epoch, enter epochID, and reward payment details (including RNP reward, EL reward and chunk reward) will be returned for all the verification nodes and clients working in the epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochIncentivePayDetail","params":{"chainType":"WAN", "epochID":18101},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getEpochIncentivePayDetail("WAN", 18101, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the activity information of the specified epoch. For historical epochs the values are fixed, while the current epoch will update the latest current values in real time.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getActivity","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getActivity("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the slot leader activity information of the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotActivity","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getSlotActivity("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the validator activity information of the Epoch Leaders and Random Number Proposers of the specified epoch. Returns null for the current Epoch or future Epochs.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorActivity","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getValidatorActivity("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the current highest stable block number (no rollback).
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getMaxStableBlkNumber","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getMaxStableBlkNumber("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the random number of the queried epochID and block number.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   * @apiParam {number} blockNumber The blockNumber you want to search. If blockNumber is -1, use the latest block.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getRandom","params":{"chainType":"WAN", "epochID":18102, "blockNumber":-1},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getRandom("WAN", 18102, -1, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the specified validator info by the validator address.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The validator address you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorInfo","params":{"chainType":"WAN", "address":"0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getValidatorInfo("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the specified validator staking info by the validator owner's address.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The validator owner address you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorStakeInfo","params":{"chainType":"WAN", "address":"0x086b4cfadfd9f232b068c2e8263d608baee85163"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getValidatorStakeInfo("WAN", "0x086b4cfadfd9f232b068c2e8263d608baee85163", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the specified validator's total incentives.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string/array} address The validator address you want to search.
   * @apiParam {number} [from] The begin epochID you want to search.
   * @apiParam {number} [to] The end epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorTotalIncentive","params":{"chainType":"WAN", "address":"0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getValidatorTotalIncentive("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the identified delegator's staking info.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The delegator address you want to query.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorStakeInfo","params":{"chainType":"WAN", "address":"0xa6de4408d9003ee992b5dc0e1bf27968e48727dc"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getDelegatorStakeInfo("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the identified delegator rewards over a specified range of epochs.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The delegator address you want to query.
   * @apiParam {number} [from] The starting epochID you want to query.
   * @apiParam {number} [to] The ending epochID you want to query.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorIncentive","params":{"chainType":"WAN", "address":"0xa6de4408d9003ee992b5dc0e1bf27968e48727dc"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getDelegatorIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the identified delegator's total incentives.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string} address The delegator's address you want to query.
   * @apiParam {string} [validatorAddress] The validator's address you want to query.
   * @apiParam {number} [from] The starting epochID you want to query.
   * @apiParam {number} [to] The ending epochID you want to query.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorTotalIncentive","params":{"chainType":"WAN", "address":"0xa6de4408d9003ee992b5dc0e1bf27968e48727dc"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getDelegatorTotalIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the Epoch Leader and Random Number Proposer addresses and public key lists in the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getLeaderGroupByEpochID","params":{"chainType":"WAN", "epochID":18102},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getLeaderGroupByEpochID("WAN", 18102, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the current epoch info.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getCurrentEpochInfo","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getCurrentEpochInfo("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Returns an array with information on each of the current validators.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getCurrentStakerInfo","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getCurrentStakerInfo("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Returns the total number of slots in an epoch. This is a constant.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotCount","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getSlotCount("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the time span of a slot in seconds.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getSlotTime","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getSlotTime("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Returns the specified epoch's start time in UTC time seconds.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTimeByEpochID","params":{"chainType":"WAN", "epochID":18108},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getTimeByEpochID("WAN", 18108, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Calculates the Epoch ID according to the time. Enter the UTC time in seconds to get the corresponding Epoch ID.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} time The UTC time seconds you want to query.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochIDByTime","params":{"chainType":"WAN", "time":Math.floor(Date.now()/1000)},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getEpochIDByTime("WAN", Math.floor(Date.now()/1000), (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
   *   let result = await apiTest.getEpochIDByTime("WAN", Math.floor(Date.now()/1000));
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

  getRegisteredValidator(address, after, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRegisteredValidator';
    let params = {};

    if (address) {
      if (typeof (address) === "function") {
        callback = address;
      } else if (typeof (address) === "number") {
        params.after = address;
        callback = after;
      } else if (typeof (after) === "number") {
        params.address = address;
        params.after = after;
      } else {
        params.address = address;
        callback = after;
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
   * @apiName getPosInfo
   * @apiGroup POS
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getPosInfo
   * @apiVersion 1.1.0
   * @apiDescription Returns the epoch ID and block number when the switch from POW to the POS protocol occurred.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getPosInfo","params":{"chainType":"WAN"},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getPosInfo("WAN", (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the highest block number of the specified epoch ID(s).
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number/array} epochID The epochID(s) you want to query.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getMaxBlockNumber","params":{"chainType":"WAN", "epochID":[18102, 18101]},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getMaxBlockNumber("WAN", [18102, 18101], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get supplementary information for the specified validator.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string/array} address The validator address you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getValidatorSupStakeInfo","params":{"chainType":"WAN", "address":["0x158bae682e6278a16d09d7c7311074585d38b54d","0x85dae7e5c7b433a1682c54eee63adf63d835d272"]},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getValidatorSupStakeInfo("WAN", ["0x158bae682e6278a16d09d7c7311074585d38b54d","0x85dae7e5c7b433a1682c54eee63adf63d835d272"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the specified delegator's supplementary information.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {string/array} address The delegator's address you want to query.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getDelegatorSupStakeInfo","params":{"chainType":"WAN", "address":["0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0"]},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getDelegatorSupStakeInfo("WAN", ["0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0"], (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the block number which contains the incentives transactions for the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to query.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochIncentiveBlockNumber","params":{"chainType":"WAN", "epochID":18106},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getEpochIncentiveBlockNumber("WAN", 18106, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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
   * @apiVersion 1.1.0
   * @apiDescription Get the record of stake out transactions for the specified epoch.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @apiParam {number} epochID The epochID you want to search.
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getEpochStakeOut","params":{"chainType":"WAN", "epochID":18106},"id":1}
   *
   * @apiExample {nodejs} Example callback usage:
   *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
   *   apiTest.getEpochStakeOut("WAN", 18106, (err, result) => {
   *     console.log("Result is ", result);
   *     apiTest.close();
   *   });
   *
   * @apiExample {nodejs} Example promise usage:
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

}

module.exports = ApiInstance;
