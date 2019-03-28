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
      if (this.open) {
        this._send(jsonResult["result"], callback);
      } else {
        this.events.on("open", () => {
          this.open = true;
          this._send(jsonResult["result"], callback);
        });
      }
      
    }
  }

  _send(message, callback) {
    this.sendMessage(message, (resMsg) => {
      if (resMsg.hasOwnProperty("error")) {
        callback(resMsg["error"]);
      } else {
        callback(null, resMsg["result"]);
      }
    });
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
   * @apiVersion 1.0.0
   * @apiDescription Subscribe to a smart contract event monitor. The server will push the event to the subscriber when the event occurs. 
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @apiParam {string} chainType The chain being queried, currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
   * "result":[{
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
  * @apiVersion 1.0.0
  * @apiDescription Get smart contract event log via topics.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried, currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  * "result":[{
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
  getScEvent(chainType, address, topics, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getScEvent';
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
  * @apiName getScOwner
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScOwner
  * @apiVersion 1.0.0
  * @apiDescription Get the owner of the specified contract from the specified chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried, currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": "0xbb8703ca8226f411811dd16a3f1a2c1b3f71825d"
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
  * @apiVersion 1.0.0
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
  *  "result": "20"
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
  * @apiVersion 1.0.0
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
  *  "result": [{
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
  * @apiVersion 1.0.0
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
  *  "result": [{
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
  * @apiName getErc20StoremanGroups
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getErc20StoremanGroups
  * @apiVersion 1.0.0
  * @apiDescription Get the detail cross-chain storemanGroup info for one specific ERC20 contract, like the quota, etc.
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
  * {"jsonrpc":"2.0","method":"getErc20StoremanGroups","params":{"crossChain":"ETH", "tokenScAddr":"0x00f58d6d585f84b2d7267940cede30ce2fe6eae8"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getErc20StoremanGroups('ETH', '0x00f58d6d585f84b2d7267940cede30ce2fe6eae8', (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getErc20StoremanGroups('ETH', '0x00f58d6d585f84b2d7267940cede30ce2fe6eae8');
  *   console.log("Result is ", result);
  *   apiTest.close();
  *
  * @apiSuccessExample {json} Successful Response
  *  "result": [{
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
  getErc20StoremanGroups(crossChain, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getErc20StoremanGroups';
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
  * @apiVersion 1.0.0
  * @apiDescription Get a bigNumber of the current gas price in wei.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": "180000000000"
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
  * @apiVersion 1.0.0
  * @apiDescription Gets balance for a single address.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": "10000000000000000000000"
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
  * @apiVersion 1.0.0
  * @apiDescription Get balance for multiple Addresses in a single call.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": {
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
  * @apiVersion 1.0.0
  * @apiDescription Get token balance for a single address of certain token on Wanchain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried, currently supports <code>'WAN'</code> and <code>'ETH'</code>, default: <code>'WAN'</code>.
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
  *  "result": "10000000000000000000000"
  *
  */
  getTokenBalance(chainType, address, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getTokenBalance';
    let params = { chainType: chainType, address: address, tokenScAddr: tokenScAddr };

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
  * @apiVersion 1.0.0
  * @apiDescription Gets token balance for multiple addresses of specified token on Wanchain in a single call.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being queried, currently supports <code>'WAN'</code> and <code>'ETH'</code>, default: <code>'WAN'</code>.
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
  *  "result": {
  *    "0xfac95c16da814d24cc64b3186348afecf527324f": "10000000000000000000000",
  *    "0xfac95c16da814d24cc64b3186348afecf527324e": "0"
  *  }
  *
  */
  getMultiTokenBalance(chainType, addrArray, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMultiTokenBalance';
    let params = { chainType: chainType, address: addrArray, tokenScAddr: tokenScAddr };

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
  * @apiVersion 1.0.0
  * @apiDescription Get total amount of certain token on Wanchain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} [chainType] The chain being queried, currently supports <code>'WAN'</code> and <code>'ETH'</code>, default: <code>'WAN'</code>.
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
  *  "result": "30000000000000000000000"
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
  * @apiVersion 1.0.0
  * @apiDescription Get the nonce of an account.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": "0x0"
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
  * @apiVersion 1.0.0
  * @apiDescription Get the pending nonce of an account.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": "0x0"
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
  * @apiVersion 1.0.0
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
  *  "result": "119858"
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
  * @apiVersion 1.0.0
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
  *  "result": "0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"
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
  * @apiVersion 1.0.0
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
  *  "result": {
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
  * @apiVersion 1.0.0
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
  *  "result": {
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
  * @apiVersion 1.0.0
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
  *  "result": {
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
  * @apiVersion 1.0.0
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
  *  "result": 1
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
  * @apiVersion 1.0.0
  * @apiDescription Get the transaction mined result on certain chain. 
  * When the receipt not existed, return directly with 'no receipt was found';
  * If receipt existed, the receipt will be returned after confirm-block-number blocks.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": {
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
  * @apiVersion 1.0.0
  * @apiDescription Get the receipt of a transaction by transaction hash on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
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
  *  "result": {
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
  * @apiVersion 1.0.0
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
  *  "result": [{
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
  * @apiVersion 1.0.0
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
  *  "result": [{
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
  * @apiVersion 1.0.0
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
  *  "result": [{
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
  * @apiVersion 1.0.0
  * @apiDescription Get the specific public parameter value of one contract on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} scAddr The token contract address for the specified token.
  * @apiParam {string} name The name of the specific contract parameter.
  * @apiParam {string} abi The abi of the specific contract.
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
  *  "result": "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
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
  * @apiVersion 1.0.0
  * @apiDescription Get the specific public map value of one contract on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} scAddr The token contract address for the specified token.
  * @apiParam {string} name The name of the specific contract public map.
  * @apiParam {string} key The key of parameter of the specific contract public map.
  * @apiParam {string} abi The abi of the specific contract.
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
  *  "result": "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
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
  * @apiVersion 1.0.0
  * @apiDescription Call the specific public function of one contract on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} scAddr The token contract address for the specified token.
  * @apiParam {string} name The name of the specific contract public function.
  * @apiParam {array} args The parameters array a of the specific contract public function.
  * @apiParam {string} abi The abi of the specific contract.
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
  *  "result": "0x8cc420e422b3fa1c416a14fc600b3354e3312524"
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
  * @apiVersion 1.0.0
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
  *  "result": "2ecb855170c941f239ffe3495f3e07cceabd8421"
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
  * @apiVersion 1.0.0
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
  *  "result": "success"
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
  * @apiName getRegErc20Tokens
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegErc20Tokens
  * @apiVersion 1.0.0
  * @apiDescription Get the information of ERC20 tokens which are supported for cross-chain ability.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} crossChain The cross-chain name that you want to search, should be <code>"ETH"</code>.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters: 
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getRegErc20Tokens","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getRegErc20Tokens("ETH", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getRegErc20Tokens("ETH");
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *  "result": [{
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
  getRegErc20Tokens(crossChain, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getRegErc20Tokens';
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
  * @apiName getErc20Allowance
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getErc20Allowance
  * @apiVersion 1.0.0
  * @apiDescription Get the ERC20 allowance for one specific account on one contract for one specific spender account on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} tokenScAddr The token contract address for the specified token.
  * @apiParam {string} ownerAddr The owner address on the certain contract.
  * @apiParam {string} spenderAddr The spender address on the certain contract.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters: 
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getErc20Allowance","params":{"chainType":"ETH", "tokenScAddr":"0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "ownerAddr":"0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "spenderAddr":"0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getErc20Allowance("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getErc20Allowance("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1");
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *  "result": "999999999999980000000000000"
  *
  */
  getErc20Allowance(chainType, tokenScAddr, ownerAddr, spenderAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getErc20Allowance';
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
  * @apiName getErc20Info
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getErc20Info
  * @apiVersion 1.0.0
  * @apiDescription Get the info of ERC20 contract, like symbol and decimals, on certain chain.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {string} tokenScAddr The token contract address for the specified token.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters: 
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getErc20Info","params":{"chainType":"ETH", "tokenScAddr":"0xc5bc855056d99ef4bda0a4ae937065315e2ae11a"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getErc20Info("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getErc20Info("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a");
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *  "result": {
  *    "symbol": "WCT",
  *    "decimals": "18"
  *  }
  */
  getErc20Info(chainType, tokenScAddr, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getErc20Info';
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
  * @apiName getMultiErc20Info
  * @apiGroup Tokens
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiErc20Info
  * @apiVersion 1.0.0
  * @apiDescription Get the information of multiple ERC20 tokens.
  * <br><br><strong>Returns:</strong>
  * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
  *
  * @apiParam {string} chainType The chain being querried. Currently supports <code>'WAN'</code> and <code>'ETH'</code>.
  * @apiParam {array} tokenScAddrArray The token address array for the certain token that you want to find.
  * @apiParam {function} [callback] Optional, the callback will receive two parameters: 
  * <br>&nbsp;&nbsp;<code>err</code> - If an error occurred.
  * <br>&nbsp;&nbsp;<code>result</code> - The saved result.
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getMultiErc20Info","params":{"tokenScAddrArray":["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"],"chainType":"ETH"},"id":1}
  *
  * @apiExample {nodejs} Example callback usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY); 
  *   apiTest.getMultiErc20Info("ETH", ["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"], (err, result) => {
  *     console.log("Result is ", result);
  *     apiTest.close();
  *   });
  *
  * @apiExample {nodejs} Example promise usage:
  *   let apiTest = new ApiInstance(YOUR-API-KEY, YOUR-SECRET-KEY);
  *   let result = await apiTest.getMultiErc20Info("ETH", ["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"]);
  *   console.log("Result is ", result);
  *   apiTest.close();
  * 
  * @apiSuccessExample {json} Successful Response
  *  "result": [{
     "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a": {
       "symbol": "WCT",
       "decimals": "18"
     },
     "0x7017500899433272b4088afe34c04d742d0ce7df": {
       "symbol": "WCT_One",
       "decimals": "18"
     }
   }]
  *
  */
  getMultiErc20Info(chainType, tokenScAddrArray, callback) {
    if (callback) {
      callback = utils.wrapCallback(callback);
    }
    let method = 'getMultiErc20Info';
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
  * @apiVersion 1.0.0
  * @apiDescription ERC20 token exchange ratio,such as 1 ERC20 to 880 WANs, the precision is 10000, the ratio is 880*precision = 880,0000. The ratio would be changed accoring to the market value ratio periodically.
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
  *  "result": "3000"
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
}

module.exports = ApiInstance;
