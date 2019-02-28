const WsInstance = require('../libs/wsInstance.js');
const ApiTemplate = require('../apis/apiTemplate.js');

class ApiInstance extends WsInstance {

  async apiFactory(method, params) {
    let wss = this.wss;
    let funcName = method;

    console.log(funcName + " is called with parameters", params);

    return new Promise((resolve, reject) => {
      let func = (err, result) => {
        if (err) {
          console.log('something is wrong when ' + funcName + ', ' + err);
          return resolve(err);
        } else {
          console.log(funcName + " function done");
          return resolve(result);
        }
      };
      let message = new ApiTemplate(method, params, func);
      this.sendMessage(message);
    });
  }

  // async getBalance(chainType, address) {
  //   return await this.apiFactory('getBalance', { chainType: chainType, address: address});
  // }

  /**
   *
   * @apiName monitorLog
   * @apiGroup EventLogs
   * @api {CONNECT} /ws/v3/YOUR-API-KEY monitorLog
   * @apiVersion 1.0.0
   * @apiDescription Subscribe a smart contract event monitor. The server will push the event to subscriber when event comes.
   *
   * @apiParam {string} chainType the chainType name that you want to search, should be WAN or ETH
   * @apiParam {address} address the contract address
   * @apiParam {array} topics of Strings - An array of values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x00...'].
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"monitorLog","params":{"chainType":"WAN", "address": "0x0d18157D85c93A86Ca194DB635336E43B1Ffbd26", "topics": ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7"]},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "result": [{
      "address": "0x0d18157d85c93a86ca194db635336e43b1ffbd26",
      "topics": ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7", "0x0000000000000000000000000d18157d85c93a86ca194db635336e43b1ffbd26"],
      "data": "0xf124b8ff25fd9c5e4f4e555232840d6a0fb89f4eb9e507ee15b5eff1336de212",
      "blockNumber": 685211,
      "transactionHash": "0xf5889525629718bc39cc26909012f1502826e2241d6f169ac6c229328d38245b",
      "transactionIndex": 0,
      "blockHash": "0x6b673291fe79e06323766d0966430cafd0baec742ec7532a10be74018ba1d785",
      "logIndex": 0,
      "removed": false
    }]
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async monitorLog(chainType, address, topics) {
    return await this.apiFactory('monitorLog', { chainType: chainType, address: address, topics: topics });
  }

  /**
  *
  * @apiName getScEvent
  * @apiGroup EventLogs
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScEvent
  * @apiVersion 1.0.0
  * @apiDescription Get smart contract event log via topics
  *
  * @apiParam {string} chainType the chainType name that you want to search, should be WAN
  * @apiParam {address} address the contract address
  * @apiParam {array} topics of Strings - An array of values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x00...'].
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScEvent","params":{"chainType":"WAN", "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167", "topics": ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": [{
     "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
     "topics": ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"],
     "data": "0x54657374206d6573736167650000000000000000000000000000000000000000",
     "blockNumber": 1121916,
     "transactionHash": "0x6bdd2acf6e946be40e2b3a39d3aaadd6d615d59c89730196870f640990a57cbe",
     "transactionIndex": 0,
     "blockHash": "0xedda83000829f7d0a0820a7bdf2103a3142a70c404f78fd1dfc7751dc007f5a2",
     "logIndex": 0,
     "removed": false
   }]
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getScEvent(chainType, address, topics) {
    return await this.apiFactory('getScEvent', { chainType: chainType, address: address, topics: topics });
  }

  /**
  *
  * @apiName getScOwner
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScOwner
  * @apiVersion 1.0.0
  * @apiDescription Get the own of the specific contract on certain chain
  *
  * @apiParam {string} chainType the chainType name that you want to search, should be WAN or ETH
  * @apiParam {address} scAddr the token address for the certain token
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScOwner","params":{"chainType":"WAN", "scAddr": "0x59adc38f0b3f64fb542b50e3e955e7a8c1eb3e3b"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "0xbb8703ca8226f411811dd16a3f1a2c1b3f71825d"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getScOwner(chainType, scAddr) {
    return await this.apiFactory('getScOwner', { chainType: chainType, scAddr: scAddr });
  }

  /**
  *
  * @apiName getCoin2WanRatio
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getCoin2WanRatio
  * @apiVersion 1.0.0
  * @apiDescription Get the native coin ratio to wan for specific chain,in 10000
  *
  * @apiParam {string} crossChain the cross_chain native coin name that you want to search
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getCoin2WanRatio","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "20"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getCoin2WanRatio(crossChain) {
    return await this.apiFactory('getCoin2WanRatio', { crossChain: crossChain });
  }

  /**
  *
  * @apiName getUTXO
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getUTXO
  * @apiVersion 1.0.0
  * @apiDescription Get the detail btc utxo info for BTC
  *
  * @apiParam {string} chainType the chainType name that you want to search, should be BTC
  * @apiParam {number} minconf the min confirm number of BTC utxo, usually 0
  * @apiParam {number} maxconf the max confirm number of BTC utxo, usually the confirmed blockes you want to wait for the utxo
  * @apiParam {array} address the address array that you want to search
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getUTXO","params":{"chainType":"BTC", "minconf":0, "maxconf":100, "address":["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
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
   }]
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getUTXO(chainType, minconf, maxconf, address) {
    return await this.apiFactory('getUTXO', { chainType: chainType, minconf: minconf, maxconf: maxconf, address: address });
  }

  /**
  *
  * @apiName getStoremanGroups
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getStoremanGroups
  * @apiVersion 1.0.0
  * @apiDescription Get the detail cross_chain storemanGroup info for one crossChain native coin, like the quota, etc
  *
  * @apiParam {string} crossChain the cross_chain name that you want to search
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getStoremanGroups","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
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
   }]
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getStoremanGroups(crossChain) {
    return await this.apiFactory('getStoremanGroups', { crossChain: crossChain });
  }

  /**
  *
  * @apiName getErc20StoremanGroups
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getErc20StoremanGroups
  * @apiVersion 1.0.0
  * @apiDescription Get the detail cross_chain storemanGroup info for one specific erc20 contract, like the quota, etc
  *
  * @apiParam {string} crossChain the cross_chain name that you want to search, should be "ETH"
  * @apiParam {address} tokenScAddr the token address for the certain token
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getErc20StoremanGroups","params":{"crossChain":"ETH", "tokenScAddr":"0x00f58d6d585f84b2d7267940cede30ce2fe6eae8"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
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
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getErc20StoremanGroups(crossChain, tokenScAddr) {
    return await this.apiFactory('getErc20StoremanGroups', { crossChain: crossChain, tokenScAddr: tokenScAddr });
  }

  /**
  *
  * @apiName getCrossScAddress
  * @apiGroup Token
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getCrossScAddress
  * @apiVersion 1.0.0
  * @apiDescription Get total amount of certain token on Wanchain
  *
  * @apiParam {string} crossChain the cross_chain name that you want to search, should be ETH
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getCrossScAddress","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": {
  *    "originalChainHtlcAddr": "0xb9f924b9d28ad550610d65b035ddd644da682a48",
  *    "wanchainHtlcAddr": "0x3906b053c151c3f0b83df808e2b84d87e20efd4d"
  *  }
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getCrossScAddress(crossChain) {
    return await this.apiFactory('getCrossScAddress', { crossChain: crossChain });
  }

  /**
  *
  * @apiName getGasPrice
  * @apiGroup Status
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getGasPrice
  * @apiVersion 1.0.0
  * @apiDescription Get total amount of certain token on Wanchain
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getGasPrice","params":{"chainType":"WAN"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "180000000000"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getGasPrice(chainType) {
    console.log("ahhahsaha");
    return await this.apiFactory('getGasPrice', { chainType: chainType});
  }

  /**
  *
  * @apiName getBalance
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getBalance
  * @apiVersion 1.0.0
  * @apiDescription Get balance for a single address
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
  * @apiParam {address} address the account's address that you want to find
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getBalance","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","chainType":"WAN"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "10000000000000000000000"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getBalance(chainType, address) {
    return await this.apiFactory('getBalance', { chainType: chainType, address: address });
  }

  /**
  *
  * @apiName getMultiBalances
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiBalances
  * @apiVersion 1.0.0
  * @apiDescription Get balance for multiple Addresses in a single call
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
  * @apiParam {address} addressArray the account's address array that you want to find
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getMultiBalances","params":{"address": ["0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","0x2cc79fa3b80c5b9b02051facd02478ea88a78e2d"],"chainType":"WAN"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": {
  *    "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c": "10000000000000000000000",
  *    "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2d": "0"
  *  }
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": {
  *    "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c": "12300000000000000000000",
  *    "0x2cc79fa3b80c5b9b02051facd0247": "invalid address"
  *   }
  * }
  *
  */
  async getMultiBalances(chainType, address) {
    return await this.apiFactory('getMultiBalances', { chainType: chainType, address: address });
  }

  /**
  *
  * @apiName getTokenBalance
  * @apiGroup Token
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenBalance
  * @apiVersion 1.0.0
  * @apiDescription Get token balance for a single address of certain token on Wanchain
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH, default WAN
  * @apiParam {address} address the account's address that you want to find
  * @apiParam {address} tokenScAddr the token address for the certain token; if set chainType 'WAN', it should be the token address for WETH or WBTC
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTokenBalance","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "10000000000000000000000"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getTokenBalance(chainType, address, tokenScAddr) {
    return await this.apiFactory('getTokenBalance', { chainType: chainType, address: address, tokenScAddr: tokenScAddr });
  }

  /**
  *
  * @apiName getMultiTokenBalance
  * @apiGroup Token
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiTokenBalance
  * @apiVersion 1.0.0
  * @apiDescription Get token balance for multiple addresses of certain token on Wanchain in a single call
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH, default WAN
  * @apiParam {address} addressArray the account's address array that you want to find
  * @apiParam {address} tokenScAddr the token address for the certain token; if set chainType 'WAN', it should be the token address for WETH or WBTC
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getMultiTokenBalance","params":{"address": ["0xfac95c16da814d24cc64b3186348afecf527324f","0xfac95c16da814d24cc64b3186348afecf527324e"],"tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": {
  *    "0xfac95c16da814d24cc64b3186348afecf527324f": "10000000000000000000000",
  *    "0xfac95c16da814d24cc64b3186348afecf527324e": "0"
  *  }
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": {
  *    "0xfac95c16da814d24cc64b3186348afecf527324f": "12300000000000000000000",
  *    "0xfac95c16da814d24cc64b3186348afecf52734e": "invalid address"
  *   }
  * }
  *
  */
  async getMultiTokenBalance(chainType, address, tokenScAddr) {
    return await this.apiFactory('getMultiTokenBalance', { chainType: chainType, address: address, tokenScAddr: tokenScAddr });
  }

  /**
  *
  * @apiName getTokenSupply
  * @apiGroup Status
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTokenSupply
  * @apiVersion 1.0.0
  * @apiDescription Get total amount of certain token on Wanchain
  *
  * @apiParam {string} [chainType] the chain name that you want to search, should be WAN or ETH, default WAN
  * @apiParam {address} tokenScAddr the token address for the certain token
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTokenSupply","params":{"tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  * or
  * {"jsonrpc":"2.0","method":"getTokenSupply","params":{"chainType":"WAN", "tokenScAddr" : "0x63eed4943abaac5f43f657d8eec098ca6d6a546e"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "30000000000000000000000"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getTokenSupply(chainType, tokenScAddr) {
    return await this.apiFactory('getTokenSupply', { chainType: chainType, tokenScAddr: tokenScAddr });
  }

  /**
  *
  * @apiName getNonce
  * @apiGroup Accounts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getNonce
  * @apiVersion 1.0.0
  * @apiDescription Get the nonce of an account
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
  * @apiParam {address} address the account's address that you want to find
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getNonce","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","chainType":"WAN"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "0x0"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getNonce(chainType, address) {
    return await this.apiFactory('getNonce', { chainType: chainType, address: address });
  }

  /**
   *
   * @apiName getNonceIncludePending
   * @apiGroup Accounts
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getNonceIncludePending
   * @apiVersion 1.0.0
   * @apiDescription Get the pending nonce of an account
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
   * @apiParam {address} address the account's address that you want to find
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getNonceIncludePending","params":{"address": "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c","chainType":"WAN"}, "id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "result": "0x0"
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getNonceIncludePending(chainType, address) {
    return await this.apiFactory('getNonceIncludePending', { chainType: chainType, address: address });
  }

  /**
   *
   * @apiName getBlockNumber
   * @apiGroup Blocks
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockNumber
   * @apiVersion 1.0.0
   * @apiDescription Get the current latest block number
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN or BTC
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getBlockNumber","params":{"chainType":"WAN"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "result": "119858"
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getBlockNumber(chainType) {
    return await this.apiFactory('getBlockNumber', { chainType: chainType });
  }

  // async getCrossEthScAddress(){
  //   return await this.apiFactory('getBalance', {chainType: chainType, address: address});
  //     let socket = this.webSocket;
  //     let log = this.log;
  //     if (!checkKeyParameters(log, socket, msg, 'getCrossEthScAddress', ['chainType']) ||
  //       !checkChainType(log, socket, msg, 'getCrossEthScAddress', msg['params']['chainType'])) {
  //       return;
  //     }

  //     let chainType = msg['params']['chainType'];
  //     log.info("getCrossEthScAddress is called by Chain-", chainType);

  //     let reply = {};
  //     let chainDb = this.chainDbDict[chainType];
  //     let chain = new moduleConfig.chainDict[chainType].chain(log, chainDb);
  //     reply.result = chain.getCrossEthScAddress();
  //     socketSafeSend(log, socket, msg.id, reply);
  //     log.info("getCrossEthScAddress function done");
  //   }
  // }

  /**
   *
   * @apiName sendRawTransaction
   * @apiGroup Transactions
   * @api {CONNECT} /ws/v3/YOUR-API-KEY sendRawTransaction
   * @apiVersion 1.0.0
   * @apiDescription Submit a pre-signed transaction for broadcast to certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH or BTC
   * @apiParam {string} signedTx the signedTx you want to send
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"sendRawTransaction","params":{"chainType":"WAN", "signedTx":"0xf86e0109852e90edd000832dc6c0946ed9c11cbd8a6ae8355fa62ebca48493da572661880de0b6b3a7640000801ca0bd349ec9f51dd171eb5c59df9a6b8c5656eacb6793bed945a7ec69135f191abfa0359da11e8a4fdd51b52a8752ac32f9125d168441546d011406736bce67b8a356"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "result": "0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async sendRawTransaction(chainType, signedTx) {
    return await this.apiFactory('sendRawTransaction', { chainType: chainType, signedTx: signedTx });
  }

  /**
   *
   * @apiName getTxInfo
   * @apiGroup Transactions
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTxInfo
   * @apiVersion 1.0.0
   * @apiDescription Get the transaction detail via txHash on certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN or BTC
   * @apiParam {hash} txHash the txHash you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTxInfo","params":{"chainType":"WAN", "txHash":"0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getTxInfo(chainType, txHash) {
    return await this.apiFactory('getTxInfo', { chainType: chainType, txHash: txHash });
  }

  /**
  *
  * @apiName getTransaction
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransaction
  * @apiVersion 1.0.0
  * @apiDescription Call getRawTransaction function with 1 at second param to get raw transaction info.
  *
  * @apiParam {string} chainType the chain name that you want to search, should be BTC
  * @apiParam {txHash} txHash the txHash you want to search
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getTransaction","params":{"chainType":"BTC","txHash":"7168a86c84eda0bbfb7ae553118b02983516e8a6c448dc4c0630d26299297f20"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": {
     "txid": "7168a86c84eda0bbfb7ae553118b02983516e8a6c448dc4c0630d26299297f20",
     "hash": "7168a86c84eda0bbfb7ae553118b02983516e8a6c448dc4c0630d26299297f20",
     "version": 1,
     "size": 502,
     "vsize": 502,
     "locktime": 0,
     "vin": [{
       "txid": "9573ace6a27f08ddb4306351d6764ef18e8d4ef1c21e3bbe40f4a313e552d3d9",
       "vout": 0,
       "scriptSig": {
         "asm": "0 304402203367bfe118686d11de9194f01a31edcd578bdc5d8b377a2189c7ba68ecf763f10220738a0f2bbb298885950a7b08b5fdcfbe4a18ce581474b9160c097bb4ea939d3b[ALL] 304402205f74077b910e4e794e59e881939c71ef27bf4e709063973afa234d4cda69aaa6022042b6914c403adf94761ae42214ad9b366149dbd9f04b17d10c066b5ba3c9a9a3[ALL] 304402204757d2c32e1467cfbdb7327bd4a50b5ebcd5f18717b2b4d6d62d61e1a1cafbe30220461b2d5120b826605d1c83bee4e59eef73fefc94cd0c5ae30c9d1d25e89d3380[ALL] 5321022666ff58d872f45d5f38022af3e8ad21f7a109d70d718171111b035542332f202102378f6c2051e46ac2f8db79929bf24440e45c9fb985bfd5e8a71026440623f5e92103ced1ba9b2f46b49168b38f3f950a5a3cdf15d5d13e8e5a2ebf6a28d1beb6b2562103528901b8cd76a4b9fb270d020706619543d9a75dc2a9c717d397d3838b69e98654ae",
         "hex": "0047304402203367bfe118686d11de9194f01a31edcd578bdc5d8b377a2189c7ba68ecf763f10220738a0f2bbb298885950a7b08b5fdcfbe4a18ce581474b9160c097bb4ea939d3b0147304402205f74077b910e4e794e59e881939c71ef27bf4e709063973afa234d4cda69aaa6022042b6914c403adf94761ae42214ad9b366149dbd9f04b17d10c066b5ba3c9a9a30147304402204757d2c32e1467cfbdb7327bd4a50b5ebcd5f18717b2b4d6d62d61e1a1cafbe30220461b2d5120b826605d1c83bee4e59eef73fefc94cd0c5ae30c9d1d25e89d3380014c8b5321022666ff58d872f45d5f38022af3e8ad21f7a109d70d718171111b035542332f202102378f6c2051e46ac2f8db79929bf24440e45c9fb985bfd5e8a71026440623f5e92103ced1ba9b2f46b49168b38f3f950a5a3cdf15d5d13e8e5a2ebf6a28d1beb6b2562103528901b8cd76a4b9fb270d020706619543d9a75dc2a9c717d397d3838b69e98654ae"
       },
       "sequence": 4294967295
     }],
     "vout": [{
       "value": 0.0531,
       "n": 0,
       "scriptPubKey": {
         "asm": "OP_HASH160 a3d3eea26a00225d76b089a690ae5f48471e5733 OP_EQUAL",
         "hex": "a914a3d3eea26a00225d76b089a690ae5f48471e573387",
         "reqSigs": 1,
         "type": "scripthash",
         "addresses": ["2N8BU1rgLfkRZZpUQWSz1fNJ5z6hCtWjkUd"]
       }
     }, {
       "value": 0,
       "n": 1,
       "scriptPubKey": {
         "asm": "OP_RETURN 45584f4e554d010078ab7200000000005d114ae1dce23ed8196dc2e6f8b605e228e3994d13900ed1919d604f0507cce9",
         "hex": "6a3045584f4e554d010078ab7200000000005d114ae1dce23ed8196dc2e6f8b605e228e3994d13900ed1919d604f0507cce9",
         "type": "nulldata"
       }
     }],
     "hex": "0100000001d9d352e513a3f440be3b1ec2f14e8d8ef14e76d6516330b4dd087fa2e6ac739500000000fd66010047304402203367bfe118686d11de9194f01a31edcd578bdc5d8b377a2189c7ba68ecf763f10220738a0f2bbb298885950a7b08b5fdcfbe4a18ce581474b9160c097bb4ea939d3b0147304402205f74077b910e4e794e59e881939c71ef27bf4e709063973afa234d4cda69aaa6022042b6914c403adf94761ae42214ad9b366149dbd9f04b17d10c066b5ba3c9a9a30147304402204757d2c32e1467cfbdb7327bd4a50b5ebcd5f18717b2b4d6d62d61e1a1cafbe30220461b2d5120b826605d1c83bee4e59eef73fefc94cd0c5ae30c9d1d25e89d3380014c8b5321022666ff58d872f45d5f38022af3e8ad21f7a109d70d718171111b035542332f202102378f6c2051e46ac2f8db79929bf24440e45c9fb985bfd5e8a71026440623f5e92103ced1ba9b2f46b49168b38f3f950a5a3cdf15d5d13e8e5a2ebf6a28d1beb6b2562103528901b8cd76a4b9fb270d020706619543d9a75dc2a9c717d397d3838b69e98654aeffffffff02300651000000000017a914a3d3eea26a00225d76b089a690ae5f48471e5733870000000000000000326a3045584f4e554d010078ab7200000000005d114ae1dce23ed8196dc2e6f8b605e228e3994d13900ed1919d604f0507cce900000000",
     "blockhash": "000000000000003e0d0f4782df67ca1d46472c7913470621377bcb2424833efe",
     "confirmations": 13,
     "time": 1535367245,
     "blocktime": 1535367245
   }
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  //TODO: Use the old GetTransaction interface.
  async getTransaction(chainType, txHash) {
    return await this.apiFactory('getTransaction', { chainType: chainType, txHash: txHash });
  }

  /**
   *
   * @apiName getBlockByNumber
   * @apiGroup Blocks
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockByNumber
   * @apiVersion 1.0.0
   * @apiDescription Get the block information about a block by block number on certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN
   * @apiParam {number} blockNumber the blockNumber you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getBlockByNumber","params":{"chainType":"WAN", "blockNumber":"670731"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getBlockByNumber(chainType, blockNumber) {
    return await this.apiFactory('getBlockByNumber', { chainType: chainType, blockNumber: blockNumber });
  }

  /**
   *
   * @apiName getBlockByHash
   * @apiGroup Blocks
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockByHash
   * @apiVersion 1.0.0
   * @apiDescription Get the block information about a block by block hash on certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN
   * @apiParam {hash} blockHash the blockHash you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getBlockByHash","params":{"chainType":"WAN", "blockHash":"0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getBlockByHash(chainType, blockHash) {
    return await this.apiFactory('getBlockByHash', { chainType: chainType, blockHash: blockHash });
  }

  /**
   *
   * @apiName getBlockTransactionCount
   * @apiGroup Blocks
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getBlockTransactionCount
   * @apiVersion 1.0.0
   * @apiDescription Get the number of transaction in a given block by blockNumber or blockhash on certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN
   * @apiParam {number} [blockNumber] the blockNumber you want to search
   * @apiParam {hash} [blockHash] the blockHash you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getBlockTransactionCount","params":{"chainType":"WAN", "blockNumber":"670731"},"id":1}
   * or
   * {"jsonrpc":"2.0","method":"getBlockTransactionCount","params":{"chainType":"WAN", "blockHash":"0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "result": 1
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getBlockTransactionCount(chainType, blockNumber) {
    return await this.apiFactory('getBlockTransactionCount', { chainType: chainType, blockNumber: blockNumber });
    // return await this.apiFactory('getBlockTransactionCount', {chainType: chainType, blockHash: blockHash});
  }

  /**
   *
   * @apiName getTransactionConfirm
   * @apiGroup Transactions
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransactionConfirm
   * @apiVersion 1.0.0
   * @apiDescription Get the transaction mined result on certain chain. 
   * When the receipt not existed, return directly with 'no receipt was found';
   * If receipt existed, the receipt will be returned after confirm-block-number blocks
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
   * @apiParam {number} waitBlocks the confirm-block-number you want to set
   * @apiParam {hash} txHash the txHash you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTransactionConfirm","params":{"chainType":"WAN", "waitBlocks": 6, "txHash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   * or
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "no receipt was found"
   * }
   *
   */
  async getTransactionConfirm(chainType, waitBlocks, txHash) {
    return await this.apiFactory('getTransactionConfirm', { chainType: chainType, waitBlocks: waitBlocks, txHash: txHash });
  }

  /**
   *
   * @apiName getTransactionReceipt
   * @apiGroup Transactions
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransactionReceipt
   * @apiVersion 1.0.0
   * @apiDescription Get the receipt of a transaction by transaction hash on certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
   * @apiParam {hash} txHash the txHash you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTransactionReceipt","params":{"chainType":"WAN", "txHash":"0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getTransactionReceipt(chainType, txHash) {
    return await this.apiFactory('getTransactionReceipt', { chainType: chainType, txHash: txHash });
  }

  /**
   *
   * @apiName getTransByBlock
   * @apiGroup Transactions
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransByBlock
   * @apiVersion 1.0.0
   * @apiDescription Get transaction information in a given block by blockNumber or blockhash on certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN
   * @apiParam {number} [blockNumber] the blockNumber you want to search
   * @apiParam {hash} [blockHash] the blockHash you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTransByBlock","params":{"chainType":"WAN", "blockNumber":"984133"},"id":1}
   * or
   * {"jsonrpc":"2.0","method":"getTransByBlock","params":{"chainType":"WAN", "blockHash":"0xaa0fc2a8a868566f2e4888b2942ec05c47c2254e8b81e43d3ea87420a09126c2"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getTransByBlock(chainType, blockNumber) {
    return await this.apiFactory('getTransByBlock', { chainType: chainType, blockNumber: blockNumber });
    // return await this.apiFactory('getTransByBlock', {chainType: chainType, blockHash: blockHash});
  }

  /**
   *
   * @apiName getTransByAddress
   * @apiGroup Transactions
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransByAddress
   * @apiVersion 1.0.0
   * @apiDescription Get transaction information via the specified address on certain chain
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN
   * @apiParam {address} address the account's address that you want to search
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTransByAddress","params":{"chainType":"WAN", "address":"0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d"},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getTransByAddress(chainType, address) {
    return await this.apiFactory('getTransByAddress', { chainType: chainType, address: address });
  }

  /**
   *
   * @apiName getTransByAddressBetweenBlocks
   * @apiGroup Transactions
   * @api {CONNECT} /ws/v3/YOUR-API-KEY getTransByAddressBetweenBlocks
   * @apiVersion 1.0.0
   * @apiDescription Get transaction information via the specified address between the specified startBlockNo and endBlockNo on certain chain
   * Comments:  if no startBlockNo given, startBlockNo will be set to 0;
   *            if no endBlockNo given, endBlockNo will be set to the newest blockNumber
   *
   * @apiParam {string} chainType the chain name that you want to search, should be WAN
   * @apiParam {address} address the account's address that you want to search
   * @apiParam {number} startBlockNo the startBlockNo that you want to search from
   * @apiParam {number} endBlockNo the endBlockNo that you want to search to
   *
   * @apiParamExample {string} JSON-RPC over websocket
   * {"jsonrpc":"2.0","method":"getTransByAddressBetweenBlocks","params":{"chainType":"WAN", "address":"0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", "startBlockNo":984119, "endBlockNo":984120},"id":1}
   *
   * @apiSuccessExample {json} Successful Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
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
   * }
   *
   * @apiErrorExample {json} Error Response
   * {
   *  "jsonrpc": "2.0",
   *  "id": 1,
   *  "error": "err.message"
   * }
   *
   */
  async getTransByAddressBetweenBlocks(chainType, address, startBlockNo, endBlockNo) {
    return await this.apiFactory('getTransByAddressBetweenBlocks', { chainType: chainType, address: address, startBlockNo: startBlockNo, endBlockNo: endBlockNo });
  }

  /**
  *
  * @apiName getScVar
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScVar
  * @apiVersion 1.0.0
  * @apiDescription Get the specific public parameter value of one contract on certain chain
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
  * @apiParam {address} scAddr the token address for the certain token
  * @apiParam {string} name the name of the specific contract parameter
  * @apiParam {string} abi the abi of the specific contract
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScVar","params":{"chainType": "WAN", "scAddr": "0x55ba61f4da3166487a804bccde7ee4015f609f45", "name": "addr", "abi": [/The Abi of the contracts/]},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  * or
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "contractIns[varName] is not a function"
  * }
  *
  */
  async getScVar(chainType, scAddr, name, abi) {
    return await this.apiFactory('getScVar', { chainType: chainType, scAddr: scAddr, name: name, abi: abi });
  }

  /**
  *
  * @apiName getScMap
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getScMap
  * @apiVersion 1.0.0
  * @apiDescription Get the specific public map value of one contract on certain chain
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
  * @apiParam {address} scAddr the token address for the certain token
  * @apiParam {string} name the name of the specific contract public map
  * @apiParam {string} key the key of parameter of the specific contract public map
  * @apiParam {string} abi the abi of the specific contract
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getScMap","params":{"chainType": "WAN", "scAddr": "0x55ba61f4da3166487a804bccde7ee4015f609f45", "name": "mapAddr", "key": "", "abi": [/The Abi of the contracts/]},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  * or
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "contractIns[mapAddr] is not a function"
  * }
  *
  */
  async getScMap(chainType, scAddr, name, key, abi) {
    return await this.apiFactory('getScMap', { chainType: chainType, scAddr: scAddr, name: name, key: key, abi: abi });
  }

  /**
  *
  * @apiName callScFunc
  * @apiGroup Contracts
  * @api {CONNECT} /ws/v3/YOUR-API-KEY callScFunc
  * @apiVersion 1.0.0
  * @apiDescription Call the specific public function of one contract on certain chain
  *
  * @apiParam {string} chainType the chain name that you want to search, should be WAN or ETH
  * @apiParam {address} scAddr the token address for the certain token
  * @apiParam {string} name the name of the specific contract public function
  * @apiParam {array} args the parameters array a of the specific contract public function
  * @apiParam {string} abi the abi of the specific contract
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"callScFunc","params":{"chainType": "WAN", "scAddr": "0x55ba61f4da3166487a804bccde7ee4015f609f45", "name": "getPriAddress", "args": [], "abi": [/The Abi of the contracts/]},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "0x8cc420e422b3fa1c416a14fc600b3354e3312524"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  * or
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "Invalid number of arguments to Solidity function"
  * }
  *
  */
  async callScFunc(chainType, scAddr, name, args, abi) {
    return await this.apiFactory('callScFunc', { chainType: chainType, scAddr: scAddr, name: name, args: args, abi: abi });
  }

  /**
  *
  * @apiName getP2shxByHashx
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getP2shxByHashx
  * @apiVersion 1.0.0
  * @apiDescription Get the x value of p2sh by hash(x) from btc
  *
  * @apiParam {string} chainType the chain name that you want to search, should be BTC
  * @apiParam {hash} hashX the certain hashX that you want to search
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getP2shxByHashx","params":{"chainType":"BTC","hashx":"d2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "2ecb855170c941f239ffe3495f3e07cceabd8421"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  //Get the x value of p2sh by hash(x) from btc
  // async getP2shxByHashx(chainType, hashX) {
  //   return await this.apiFactory('getP2shxByHashx', { chainType: chainType, hashX: hashX });
  // }

  /**
  *
  * @apiName importAddress
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY importAddress
  * @apiVersion 1.0.0
  * @apiDescription Send a 'import address' command to btc.
  *
  * @apiParam {string} chainType the chain name that you want to search, should be BTC
  * @apiParam {address} address the BTC account address you want to import to the node to scan transactions
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"importAddress","params":{"chainType":"BTC","address":"mmmmmsdfasdjflaksdfasdf"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "success"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async importAddress(chainType, address) {
    return await this.apiFactory('importAddress', { chainType: chainType, address: address });
  }

  /**
  *
  * @apiName getRegErc20Tokens
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getRegErc20Tokens
  * @apiVersion 1.0.0
  * @apiDescription Get the detail info of registered contract for Erc20_crosschain, like address, ratio, etc, on certain chain
  *
  * @apiParam {string} crossChain the cross_chain name that you want to search, should be "ETH"
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getRegErc20Tokens","params":{"crossChain":"ETH"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
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
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getRegErc20Tokens(crossChain) {
    return await this.apiFactory('getRegErc20Tokens', { crossChain: crossChain });
  }

  /**
  *
  * @apiName getErc20Allowance
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getErc20Allowance
  * @apiVersion 1.0.0
  * @apiDescription Get the erc20 allowance for one specific account on one contract for one specific spender account on certain chain
  *
  * @apiParam {string} chainType the chain name that you want to search, should be "ETH"
  * @apiParam {address} tokenScAddr the token address for the certain token
  * @apiParam {address} ownerAddr the owner address on the certain contract
  * @apiParam {address} spenderAddr the spender address on the certain contract
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getErc20Allowance","params":{"chainType":"ETH", "tokenScAddr":"0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "ownerAddr":"0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "spenderAddr":"0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "999999999999980000000000000"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getErc20Allowance(chainType, tokenScAddr, ownerAddr, spenderAddr) {
    return await this.apiFactory('getErc20Allowance', { chainType: chainType, tokenScAddr: tokenScAddr, ownerAddr: ownerAddr, spenderAddr: spenderAddr });
  }

  /**
  *
  * @apiName getErc20Info
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getErc20Info
  * @apiVersion 1.0.0
  * @apiDescription Get the info of ERC20 contract, like symbol and decimals, on certain chain
  *
  * @apiParam {string} chainType the chain name that you want to search, should be "ETH"
  * @apiParam {address} tokenScAddr the token address for the certain token
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getErc20Info","params":{"chainType":"ETH", "tokenScAddr":"0xc5bc855056d99ef4bda0a4ae937065315e2ae11a"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": {
  *    "symbol": "WCT",
  *    "decimals": "18"
  *  }
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getErc20Info(chainType, tokenScAddr) {
    return await this.apiFactory('getErc20Info', { chainType: chainType, tokenScAddr: tokenScAddr });
  }

  /**
  *
  * @apiName getMultiErc20Info
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getMultiErc20Info
  * @apiVersion 1.0.0
  * @apiDescription Get the infos of muti ERC20 contracts, like symbol and decimals, on certain chain in a single call
  *
  * @apiParam {string} chainType the chain name that you want to search, should be "ETH"
  * @apiParam {address} tokenScAddrArray the token address array for the certain token that you want to find
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getMultiErc20Info","params":{"tokenScAddrArray":["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"],"chainType":"ETH"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
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
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getMultiErc20Info(chainType, tokenScAddrArray) {
    return await this.apiFactory('getMultiErc20Info', { chainType: chainType, tokenScAddrArray: tokenScAddrArray });
  }

  /**
  *
  * @apiName getToken2WanRatio
  * @apiGroup CrossChain
  * @api {CONNECT} /ws/v3/YOUR-API-KEY getToken2WanRatio
  * @apiVersion 1.0.0
  * @apiDescription Get the token ratio to wan for specific erc20 token,in 10000
  *
  * @apiParam {string} crossChain the cross_chain name that you want to search, should be "ETH"
  * @apiParam {address} tokenScAddr the token address for the certain token
  *
  * @apiParamExample {string} JSON-RPC over websocket
  * {"jsonrpc":"2.0","method":"getToken2WanRatio","params":{"crossChain":"ETH", "tokenScAddr":"0x00f58d6d585f84b2d7267940cede30ce2fe6eae8"},"id":1}
  *
  * @apiSuccessExample {json} Successful Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "result": "3000"
  * }
  *
  * @apiErrorExample {json} Error Response
  * {
  *  "jsonrpc": "2.0",
  *  "id": 1,
  *  "error": "err.message"
  * }
  *
  */
  async getToken2WanRatio(crossChain, tokenScAddr) {
    return await this.apiFactory('getToken2WanRatio', { crossChain: crossChain, tokenScAddr: tokenScAddr });
  }
}

module.exports = ApiInstance;
