//#region node_modules/eventemitter3/index.d.ts
/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 */
declare class EventEmitter<EventTypes extends EventEmitter.ValidEventTypes = string | symbol, Context extends any = any> {
  static prefixed: string | boolean;
  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   */
  eventNames(): Array<EventEmitter.EventNames<EventTypes>>;
  /**
   * Return the listeners registered for a given event.
   */
  listeners<T extends EventEmitter.EventNames<EventTypes>>(event: T): Array<EventEmitter.EventListener<EventTypes, T>>;
  /**
   * Return the number of listeners listening to a given event.
   */
  listenerCount(event: EventEmitter.EventNames<EventTypes>): number;
  /**
   * Calls each of the listeners registered for a given event.
   */
  emit<T extends EventEmitter.EventNames<EventTypes>>(event: T, ...args: EventEmitter.EventArgs<EventTypes, T>): boolean;
  /**
   * Add a listener for a given event.
   */
  on<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn: EventEmitter.EventListener<EventTypes, T>, context?: Context): this;
  addListener<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn: EventEmitter.EventListener<EventTypes, T>, context?: Context): this;
  /**
   * Add a one-time listener for a given event.
   */
  once<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn: EventEmitter.EventListener<EventTypes, T>, context?: Context): this;
  /**
   * Remove the listeners of a given event.
   */
  removeListener<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn?: EventEmitter.EventListener<EventTypes, T>, context?: Context, once?: boolean): this;
  off<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn?: EventEmitter.EventListener<EventTypes, T>, context?: Context, once?: boolean): this;
  /**
   * Remove all listeners, or those of the specified event.
   */
  removeAllListeners(event?: EventEmitter.EventNames<EventTypes>): this;
}
declare namespace EventEmitter {
  export interface ListenerFn<Args extends any[] = any[]> {
    (...args: Args): void;
  }
  export interface EventEmitterStatic {
    new <EventTypes extends ValidEventTypes = string | symbol, Context = any>(): EventEmitter<EventTypes, Context>;
  }
  /**
   * `object` should be in either of the following forms:
   * ```
   * interface EventTypes {
   *   'event-with-parameters': any[]
   *   'event-with-example-handler': (...args: any[]) => void
   * }
   * ```
   */
  export type ValidEventTypes = string | symbol | object;
  export type EventNames<T extends ValidEventTypes> = T extends string | symbol ? T : keyof T;
  export type ArgumentMap<T extends object> = { [K in keyof T]: T[K] extends ((...args: any[]) => void) ? Parameters<T[K]> : T[K] extends any[] ? T[K] : any[] };
  export type EventListener<T extends ValidEventTypes, K extends EventNames<T>> = T extends string | symbol ? (...args: any[]) => void : (...args: ArgumentMap<Exclude<T, string | symbol>>[Extract<K, keyof T>]) => void;
  export type EventArgs<T extends ValidEventTypes, K extends EventNames<T>> = Parameters<EventListener<T, K>>;
  export const EventEmitter: EventEmitterStatic;
}
//#endregion
//#region src/index.d.ts
/**
 * iWan SDK client options
 */
interface IwanClientOptions {
  /** RPC server hostname */
  url?: string;
  /** RPC server port */
  port?: number;
  /** Connection flag (default: 'ws') */
  flag?: string;
  /** API version (default: 'v3') */
  version?: string;
  /** Client identifier */
  clientType?: string;
  /** Client version */
  clientVersion?: string;
  /** Request timeout in ms */
  timeout?: number;
  /** Use testnet instead of mainnet */
  isTestnet?: boolean;
}
/**
 * Main iWan SDK client
 *
 * @example
 * ```ts
 * const client = new IwanClient(apiKey, secretKey, { isTestnet: false });
 * const balance = await client.getBalance('WAN', '0x...');
 * ```
 */
declare class IwanClient extends EventEmitter {
  private ws;
  private readonly apiKey;
  private readonly secretKey;
  private readonly option;
  private readonly isBrowser;
  private index;
  private pending;
  private heartbeatTimer;
  private reconnTimer;
  private tries;
  private lockReconnect;
  private manuallyClosed;
  private _readyPromise;
  /**
   * Creates a new iWan client instance
   * @param apiKey - Your iWan API key (required)
   * @param secretKey - Your iWan secret key (required)
   * @param option - Optional configuration
   * @throws IWanError if APIKEY or SECRETKEY is missing
   */
  constructor(apiKey: string, secretKey: string, option?: IwanClientOptions);
  private get wsUrl();
  private createWebSocket;
  private closeWebsocket;
  private _resolveReadyPromise;
  private _rejectReadyPromise;
  private clearPending;
  private clearReconnTimer;
  private handleMessage;
  private startHeartbeat;
  private stopHeartbeat;
  private reconnect;
  private isOpen;
  private _request;
  /**
   * Wait for WebSocket connection to be ready
   *
   * All public methods (`call`, `getBalance`, etc.) automatically call this internally.
   * You only need to call it manually if you want to wait before a batch of operations.
   *
   * @returns Promise that resolves when connected
   * @throws IWanError when connection fails or manually closed
   */
  ready(): Promise<void>;
  /**
   * Manually close the connection
   *
   * - Stops all auto-reconnect
   * - Rejects all pending requests
   * - Cleans all timers
   * - Waits for socket to fully close
   * - Emits 'closed' event
   *
   * @since 1.1.0
   * @group Common
   * @throws IWanError on timeout, or server error
   * @example
   * await sdk.close();
   */
  close(): Promise<void>;
  private checkByte32Hash;
  /**
   * Generic RPC call (supports ALL iWan methods)
   * @since 1.1.0
   * @group CrossChain
   * @param method - RPC method name (e.g. 'getBlockNumber')
   * @param params - Parameters object
   * @returns Promise with result from server
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.call("getBlockNumber", {chainType: "WAN"});
   * console.log(ret);
   * // 41898424
   */
  call<T = any>(method: string, params?: any): Promise<T>;
  /**
   * Subscribe to a smart contract event monitor. The server will push the event to the subscriber when the event occurs.
   * @since 1.1.0
   * @group Events
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} address - The contract address being queried.
   * @param {string[]} address - Array of values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x00...'].
   * @returns Promise with result from server
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.monitorEvent("WAN", "0x0d18157D85c93A86Ca194DB635336E43B1Ffbd26", ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7"]);
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0x0d18157d85c93a86ca194db635336e43b1ffbd26",
   * //     "topics": ["0x685c13adbbf429a7b274e90887dad988c5f9d0490c6fbedb07b03b388a1683c7", "0x0000000000000000000000000d18157d85c93a86ca194db635336e43b1ffbd26"],
   * //     "data": "0xf124b8ff25fd9c5e4f4e555232840d6a0fb89f4eb9e507ee15b5eff1336de212",
   * //     "blockNumber": 685211,
   * //     "transactionHash": "0xf5889525629718bc39cc26909012f1502826e2241d6f169ac6c229328d38245b",
   * //     "transactionIndex": 0,
   * //     "blockHash": "0x6b673291fe79e06323766d0966430cafd0baec742ec7532a10be74018ba1d785",
   * //     "logIndex": 0,
   * //     "removed": false
   * //   }
   * // ]
   */
  monitorEvent(chainType: string, address: string, topics: string[]): Promise<any>;
  /**
   * Get balance of an address
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} address - The account being queried.
   * @returns {Promise<string>} - Balance as string.
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.getBalance("WAN", '0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c');
   * console.log(ret);
   * // "10000000000000000000000"
   */
  getBalance(chainType: string, address: string): Promise<string>;
  /**
   * Get balance for multiple Addresses in a single call.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {Array<string>} address - An array of addresses being queried.
   * @returns {Promise<any>} - Result of account role verification
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.getMultiBalances("WAN", ['0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c']);
   * console.log(ret);
   * // {"0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c": "10000000000000000000000"}
   */
  getMultiBalances(chainType: string, address: Array<string>): Promise<any>;
  /**
   * Get smart contract event log via topics.
   * @since 1.1.0
   * @group Events
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} address - The contract address.
   * @param {Array<string|null>} topics - An array of string values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x00...'].
   * @param {any} [option] - An object value which describes the range between fromBlock and toBlock.
   * <br>&nbsp;&nbsp;<code>fromBlock</code> - The number of the earliest block (latest may be given to mean the most recent, block). By default 0.
   * <br>&nbsp;&nbsp;<code>toBlock</code> - The number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @returns {Promise<any[]>} - The smart contract event logs.
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.getScEvent('WAN', '0xda5b90dc89be59365ec44f3f2d7af8b6700d1167', ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000000"]);
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
   * //     "topics": [
   * //         "0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793",
   * //         "0x0000000000000000000000000000000000000000000000000000000000000000"
   * //     ],
   * //     "data": "0x54657374206d6573736167650000000000000000000000000000000000000000",
   * //     "blockNumber": 1121916,
   * //     "transactionHash": "0x6bdd2acf6e946be40e2b3a39d3aaadd6d615d59c89730196870f640990a57cbe",
   * //     "transactionIndex": 0,
   * //     "blockHash": "0xedda83000829f7d0a0820a7bdf2103a3142a70c404f78fd1dfc7751dc007f5a2",
   * //     "logIndex": 0,
   * //     "removed": false
   * //   }
   * // ]
   */
  getScEvent(chainType: string, address: string, topics: Array<string | null>, option?: any): Promise<any[]>;
  /**
   * Get the owner of the specified contract from the specified chain.
   * @since 1.1.0
   * @group Contracts
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} scAddr - The token contract address for the specified token.
   * @returns {Promise<string>} - The owner of the specified contract.
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.getScOwner('WAN', '0x59adc38f0b3f64fb542b50e3e955e7a8c1eb3e3b');
   * console.log(ret);
   * // "0xbb8703ca8226f411811dd16a3f1a2c1b3f71825d"
   */
  getScOwner(chainType: string, scAddr: string): Promise<string>;
  /**
   * Coin exchange ratio,such as 1 ETH to 880 WANs in ICO period, the precision is 10000, the ratio is 880*precision = 880,0000. The ratio would be changed according to the market value ratio periodically.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} crossChain - The cross-chain native coin name that you want to search, should be <code>"ETH"</code> or <code>"BTC"</code>.
   * @returns {Promise<string>} - The owner of the specified contract.
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.getCoin2WanRatio('ETH');
   * console.log(ret);
   * // "20"
   */
  getCoin2WanRatio(crossChain: string): Promise<string>;
  /**
   * Get the detail UTXO info for Bitcoin-like chain.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain name that you want to search, should be <code>"BTC"</code>, <code>"LTC"</code>, <code>"DOGE"</code>.
   * @param {number} minconf - The min confirm number of BTC UTXO, usually 0.
   * @param {number} maxconf - The max confirm number of BTC UTXO, usually the confirmed blocks you want to wait for the UTXO.
   * @param {Array<string>} address - The contract address.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any[]>} - The smart contract event logs.
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.getUTXO('BTC', 0, 100, ["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]);
   * console.log(ret);
   * // [
   * //    {
   * //      "txid": "302588f81dc5ad7972d3affc781adc6eb326227a6feda53a990e9b98b715edcc",
   * //      "vout": 0,
   * //      "address": "n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R",
   * //      "account": "",
   * //      "scriptPubKey": "76a914ec8626d9aa394317659a45cfcbd1f0762126c5e888ac",
   * //      "amount": 0.079,
   * //      "confirmations": 16,
   * //      "spendable": false,
   * //      "solvable": false,
   * //      "safe": true,
   * //      "value": 0.079
   * //    }
   * // ]
   */
  getUTXO(chainType: string, minconf: number, maxconf: number, address: string, option?: any): Promise<any>;
  /**
   * Get the vout with OP_RETURN info for Bitcoin-like chain.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain name that you want to search, should be <code>"BTC"</code>, <code>"LTC"</code>, <code>"DOGE"</code>.
   * @param {any} [option] - Optional:
  * <br>&nbsp;&nbsp;<code>address</code> - Optional, the address array that you want to search.
  * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
  * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @returns {Promise<any[]>} - The vout with OP_RETURN info.
   * @throws IWanError on timeout, connection error, or server error
   * @example
   * const ret = await sdk.getOpReturnOutputs('BTC', {address:["n35aUMToGvxJhYm7QVMtyBL83PTDKzPC1R"]});
   * console.log(ret);
   * // [
   * //   {
   * //     "txid": "2c7a583b84fe0732fe17017bf0b17437bb5dcdad3ca8a8d661e86be666c33cc0",
   * //     "height": 101641,
   * //     "vout": [
   * //       {
   * //         "scriptPubKey": {
   * //           "addresses": [
   * //             "mzW2hdZN2um7WBvTDerdahKqRgj3md9C29"
   * //           ],
   * //           "asm": "04ffd03de44a6e11b9917f3a29f9443283d9871c9d743ef30d5eddcd37094b64d1b3d8090496b53256786bf5c82932ec23c3b74d9f05a6f95a8b5529352656664b OP_CHECKSIG",
   * //           "hex": "4104ffd03de44a6e11b9917f3a29f9443283d9871c9d743ef30d5eddcd37094b64d1b3d8090496b53256786bf5c82932ec23c3b74d9f05a6f95a8b5529352656664bac",
   * //           "reqSigs": 1,
   * //           "type": "pubkey"
   * //         },
   * //         "value": 0.49743473,
   * //         "index": 1
   * //       },
   * //       {
   * //         "scriptPubKey": {
   * //           "asm": "OP_RETURN f25ce69be9489038099442ed615ca8b0003330821c2804f2763c7a8e72274d1c0000000000000a00",
   * //           "hex": "6a28f25ce69be9489038099442ed615ca8b0003330821c2804f2763c7a8e72274d1c0000000000000a00",
   * //           "type": "nulldata"
   * //         },
   * //         "value": 0,
   * //         "index": 2
   * //       }
   * //     ]
   * //   }
   * // ]
   */
  getOpReturnOutputs(chainType: string, option?: any): Promise<any>;
  /**
   * Get the detailed cross-chain storemanGroup info for one cross-chain native coin, like the quota, etc.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} crossChain - The cross-chain name that you want to search, should be <code>"ETH"</code> or <code>"BTC"</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any[]>} - The detailed cross-chain storemanGroup info.
   * @example
   * const ret = await sdk.getStoremanGroups('ETH');
   * console.log(ret);
   * // [
   * //   {
   * //     "wanAddress": "0x06daa9379cbe241a84a65b217a11b38fe3b4b063",
   * //     "ethAddress": "0x41623962c5d44565de623d53eb677e0f300467d2",
   * //     "deposit": "128000000000000000000000",
   * //     "txFeeRatio": "10",
   * //     "quota": "400000000000000000000",
   * //     "inboundQuota": "290134198386719012352",
   * //     "outboundQuota": "85607176846820246993",
   * //     "receivable": "80000000000000000",
   * //     "payable": "24178624766460740655",
   * //     "debt": "109785801613280987648"
   * //   }
   * // ]
   */
  getStoremanGroups(crossChain: string, option?: any): Promise<any>;
  /**
   * Get the detail cross-chain storemanGroup info for one specific token contract, like the quota, etc.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} crossChain - The cross-chain name that you want to search, should be <code>"ETH"</code> or <code>"EOS"</code>.
   * @param {string} tokenScAddr - The token contract address for the specified token.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any[]>} - The detailed cross-chain storemanGroup info.
   * @example
   * const ret = await sdk.getTokenStoremanGroups('ETH', '0x00f58d6d585f84b2d7267940cede30ce2fe6eae8');
   * console.log(ret);
   * // [
   * //   {
   * //     "tokenOrigAddr": "0xdbf193627ee704d38495c2f5eb3afc3512eafa4c",
   * //     "smgWanAddr": "0x765854f97f7a3b6762240c329331a870b65edd96",
   * //     "smgOrigAddr": "0x38b6c9a1575c90ceabbfe31b204b6b3a3ce4b3d9",
   * //     "wanDeposit": "5000000000000000000000",
   * //     "quota": "10000000000000000000000",
   * //     "txFeeRatio": "1",
   * //     "inboundQuota": "9999500000000000000000",
   * //     "outboundQuota": "500000000000000000",
   * //     "receivable": "0",
   * //     "payable": "0",
   * //     "debt": "500000000000000000"
   * //   }
   * // ]
   */
  getTokenStoremanGroups(crossChain: string, tokenScAddr: string, option?: any): Promise<any>;
  /**
   * Get the current gas price in wei as string type.
   * @since 1.1.0
   * @group Status
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current gas price in wei.
   * @example
   * const ret = await sdk.getGasPrice('WAN');
   * console.log(ret);
   * // "180000000000"
   */
  getGasPrice(chainType: string, option?: any): Promise<string>;
  /**
   * Get token balance for a single address of a specified token on specified chain.
   * @since 1.1.0
   * @group Tokens
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} address - The account being queried.
   * @param {string} tokenScAddr - The token contract address for specified token. I.e., If chainType is <code>'WAN'</code>, it should be the token address for <code>"WETH"</code> or <code>"WBTC"</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current token balance.
   * @example
   * const ret = await sdk.getTokenBalance("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e");
   * console.log(ret);
   * // "10000000000000000000000"
   */
  getTokenBalance(chainType: string, address: string, tokenScAddr: string, option?: any): Promise<string>;
  /**
   * Gets token balance for multiple addresses of specified token on Wanchain in a single call.
   * @since 1.1.0
   * @group Tokens
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {Array<string>} address - An array of addresses being queried.
   * @param {string} tokenScAddr - The token contract address for specified token. I.e., If chainType is <code>'WAN'</code>, it should be the token address for <code>"WETH"</code> or <code>"WBTC"</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current token balance.
   * @example
   * const ret = await sdk.getMultiTokenBalance("WAN", ["0xfac95c16da814d24cc64b3186348afecf527324f","0xfac95c16da814d24cc64b3186348afecf527324e"], "0x63eed4943abaac5f43f657d8eec098ca6d6a546e");
   * console.log(ret);
   * // {
   * //   "0xfac95c16da814d24cc64b3186348afecf527324f": "10000000000000000000000",
   * //   "0xfac95c16da814d24cc64b3186348afecf527324e": "0"
   * // }
   */
  getMultiTokenBalance(chainType: string, address: Array<string>, tokenScAddr: string, option?: any): Promise<any>;
  /**
   * Gets all balances for address.
   * @since 1.1.0
   * @group Tokens
   * @param {string} chainType - chainType The chain being queried. Currently supports <code>'XRP'</code>.
   * @param {string} address - String of address being queried.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current balances.
   * @example
   * const ret = await sdk.getAllBalances("WAN", "rgiPXoiRiwYXrzmpno6rRnKdKtsvvvJmn");
   * console.log(ret);
   * // [
   * //     {
   * //         "currency": "XRP",
   * //         "value": "999.99976"
   * //     },
   * //     {
   * //         "value": "0",
   * //         "currency": "FOO",
   * //         "issuer": "rnqpsE8GSmLrZQzXguURJHjT7sN5S1XSqz"
   * //     },
   * //     {
   * //         "value": "1.012345678913579",
   * //         "currency": "BAR",
   * //         "issuer": "rnqpsE8GSmLrZQzXguURJHjT7sN5S1XSqz"
   * //     }
   * // ]
   */
  getAllBalances(chainType: string, address: string, option?: any): Promise<any>;
  /**
   * Get total amount of certain token on specified chain.
   * @since 1.1.0
   * @group Tokens
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} tokenScAddr - The token contract address for the specified token.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current token supply.
   * @example
   * const ret = await sdk.getTokenSupply("WAN", "0x63eed4943abaac5f43f657d8eec098ca6d6a546e");
   * console.log(ret);
   * // "30000000000000000000000"
   */
  getTokenSupply(chainType: string, tokenScAddr: string, option?: any): Promise<string>;
  /**
   * Get the token allowance for one specific account on one contract for one specific spender account on a certain chain.
   * @since 1.1.0
   * @group Tokens
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} tokenScAddr - The token contract address for the specified token.
   * @param {string} ownerAddr - The owner address on the specified contract.
   * @param {string} spenderAddr - The spender address on the specified contract.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The token allowance for one specific account on one contract for one specific spender account.
   * @example
   * const ret = await sdk.getTokenAllowance("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a", "0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8", "0xcdc96fea7e2a6ce584df5dc22d9211e53a5b18b1");
   * console.log(ret);
   * // "999999999999980000000000000"
   */
  getTokenAllowance(chainType: string, tokenScAddr: string, ownerAddr: string, spenderAddr: string, option?: any): Promise<string>;
  /**
   * Get the info of token contract, like symbol and decimals, on certain chain.
   * @since 1.1.0
   * @group Tokens
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} tokenScAddr - The token contract address for the specified token.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>tokenType</code> - The token type, Currently supports <code>'Erc20'</code> and <code>'Erc721'</code>.
   * @returns {Promise<string>} - The token info.
   * @example
   * const ret = await sdk.getTokenInfo("ETH", "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a");
   * console.log(ret);
   * // {
   * //   "symbol": "WCT",
   * //   "decimals": "18"
   * // }
   */
  getTokenInfo(chainType: string, tokenScAddr: string, option?: any): Promise<any>;
  /**
   * Get the information for multiple tokens.
   * @since 1.1.0
   * @group Tokens
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {Array<string>} tokenScAddrArray - The token address array for the tokens that you want to query.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>tokenType</code> - The token type, Currently supports <code>'Erc20'</code> and <code>'Erc721'</code>.
   * @returns {Promise<string>} - The information for multiple tokens.
   * @example
   * const ret = await sdk.getMultiTokenInfo("ETH", ["0xc5bc855056d99ef4bda0a4ae937065315e2ae11a","0x7017500899433272b4088afe34c04d742d0ce7df"]);
   * console.log(ret);
   * // {
   * //   "0xc5bc855056d99ef4bda0a4ae937065315e2ae11a": {
   * //     "symbol": "WCT",
   * //     "decimals": "18"
   * //   },
   * //   "0x7017500899433272b4088afe34c04d742d0ce7df": {
   * //     "symbol": "WCT_One",
   * //     "decimals": "18"
   * //   }
   * // }
   */
  getMultiTokenInfo(chainType: string, tokenScAddrArray: Array<string>, option?: any): Promise<any>;
  /**
   * Get the nonce of an account.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} address - The account being queried.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The nonce.
   * @example
   * const ret = await sdk.getNonce("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c");
   * console.log(ret);
   * // "0x0"
   */
  getNonce(chainType: string, address: string, option?: any): Promise<string>;
  /**
   * Get the pending nonce of an account.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} address - The account being queried.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The pending nonce.
   * @example
   * const ret = await sdk.getNonceIncludePending("WAN", "0x2cc79fa3b80c5b9b02051facd02478ea88a78e2c");
   * console.log(ret);
   * // "0x0"
   */
  getNonceIncludePending(chainType: string, address: string, option?: any): Promise<string>;
  /**
   * Get the current latest block number.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current latest block number.
   * @example
   * const ret = await sdk.getBlockNumber("WAN");
   * console.log(ret);
   * // "119858"
   */
  getBlockNumber(chainType: string, option?: any): Promise<string>;
  /**
   * Submit a pre-signed transaction for broadcast to certain chain.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>,  <code>"BTC"</code>, and other chains.
   * @param {string} signedTx - The signedTx you want to send.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The transaction hash.
   * @example
   * const ret = await sdk.sendRawTransaction('WAN', '0xf86e0109852e90edd000832dc6c0946ed9c11cbd8a6ae8355fa62ebca48493da572661880de0b6b3a7640000801ca0bd349ec9f51dd171eb5c59df9a6b8c5656eacb6793bed945a7ec69135f191abfa0359da11e8a4fdd51b52a8752ac32f9125d168441546d011406736bce67b8a356');
   * console.log(ret);
   * // "0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"
   */
  sendRawTransaction(chainType: string, signedTx: string, option?: any): Promise<string>;
  /**
   * Get the transaction detail via transaction hash on certain chain.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, <code>"BTC"</code>, and other chains.
   * @param {string} txHash - The transaction hash you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The transaction detail.
   * @example
   * const ret = await sdk.getTxInfo("WAN", "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da");
   * console.log(ret);
   * // {
   * //   "txType": "0x1",
   * //   "blockHash": "0xcb76ea6649d801cc45294f4d0858bad1ca0c2b169b20c4beae2852c57a7f69c9",
   * //   "blockNumber": 1137680,
   * //   "from": "0xed1baf7289c0acef52db0c18e1198768eb06247e",
   * //   "gas": 1000000,
   * //   "gasPrice": "320000000000",
   * //   "hash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da",
   * //   "input": "0x642b273754657374206d6573736167650000000000000000000000000000000000000000",
   * //   "nonce": 26,
   * //   "to": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
   * //   "transactionIndex": 0,
   * //   "value": "0",
   * //   "v": "0x1b",
   * //   "r": "0xe3a5a5d73d0b6512676723bc4bab4f7ffe01476f8cbc9631976890e175d487ac",
   * //   "s": "0x3a79e17290fe2a9f4e5b5c5431eb322882729d68ca0d736c5d9b1f3285c9169e"
   * // }
   */
  getTxInfo(chainType: string, txHash: string, option?: any): Promise<any>;
  /**
   * Get the transaction mined result on certain chain.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {number} waitBlocks - The confirm-block-number you want to set.
   * @param {string} txHash - The transaction hash you want to search.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search, using <code>undefined</code> that means legacy format as default.
   * @returns {Promise<any>} - The transaction mined result.
   * @example
   * const ret = await sdk.getTransactionConfirm("WAN", 6, "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da");
   * console.log(ret);
   * // {
   * //   "blockHash": "0xcb76ea6649d801cc45294f4d0858bad1ca0c2b169b20c4beae2852c57a7f69c9",
   * //   "blockNumber": 1137680,
   * //   "contractAddress": null,
   * //   "cumulativeGasUsed": 29572,
   * //   "from": "0xed1baf7289c0acef52db0c18e1198768eb06247e",
   * //   "gasUsed": 29572,
   * //   "logs": [{
   * //     "address": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
   * //     "topics": ["0xa4345d0839b39e5a6622a55c68bd8f83ac8a68fad252a8363a2c09dbaf85c793", "0x0000000000000000000000000000000000000000000000000000000000000005"],
   * //     "data": "0x54657374206d6573736167650000000000000000000000000000000000000000",
   * //     "blockNumber": 1137680,
   * //     "transactionHash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da",
   * //     "transactionIndex": 0,
   * //     "blockHash": "0xcb76ea6649d801cc45294f4d0858bad1ca0c2b169b20c4beae2852c57a7f69c9",
   * //     "logIndex": 0,
   * //     "removed": false
   * //   }],
   * //   "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000001000000800000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000200000000000",
   * //   "status": "0x1",
   * //   "to": "0xda5b90dc89be59365ec44f3f2d7af8b6700d1167",
   * //   "transactionHash": "0xd2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da",
   * //   "transactionIndex": 0
   * // }
   */
  getTransactionConfirm(chainType: string, waitBlocks: number, txHash: string, option?: any): Promise<any>;
  /**
   * Get the receipt of a transaction by transaction hash on certain chain.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} txHash - The transaction hash you want to search.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search, using <code>undefined</code> that means legacy format as default.
   * @returns {Promise<any>} - The receipt of a transaction.
   * @example
   * const ret = await sdk.getTransactionReceipt("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe");
   * console.log(ret);
   * // {
   * //   "logs": [],
   * //   "blockHash": "0x18198d5e42859067db405c9144306f7da87210a8604aac66ef6759b14a199d6b",
   * //   "blockNumber": 2548378,
   * //   "contractAddress": null,
   * //   "cumulativeGasUsed": 21000,
   * //   "from": "0xdcfffcbb1edc98ebbc5c7a6b3b700a6748eca3b0",
   * //   "gasUsed": 21000,
   * //   "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
   * //   "status": "0x1",
   * //   "to": "0x157908807e95f864284e84cc5d307ce6f3574532",
   * //   "transactionHash": "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe",
   * //   "transactionIndex": 0
   * // }
   */
  getTransactionReceipt(chainType: string, txHash: string, option?: any): Promise<any>;
  /**
   * Get transaction information in a given block by block number or block hash on certain chain.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} blockHashOrBlockNumber - The blockHash or the blockNumber you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The transaction information.
   * @example
   * const ret = await sdk.getTransByBlock("WAN", "0xc18c4bdf0d40c4bb2f34f0273eaf4dc674171fbf33c3301127e1d4c85c574ebe");
   * // const ret = await sdk.getTransByBlock("WAN", "984133");
   * console.log(ret);
   * // [
   * //   {
   * //     "blockNumber": 984133,
   * //     "gas": 4700000,
   * //     "nonce": 414,
   * //     "transactionIndex": 0,
   * //     "txType": "0x1",
   * //     "blockHash": "0xaa0fc2a8a868566f2e4888b2942ec05c47c2254e8b81e43d3ea87420a09126c2",
   * //     "from": "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d",
   * //     "gasPrice": "180000000000",
   * //     "hash": "0x2c6dee69c9cc5676484d80d173d683802a4f761d5785a694b4262fbf39dff8fe",
   * //     "input": "0xfdacd5760000000000000000000000000000000000000000000000000000000000000002",
   * //     "to": "0x92e8ae701cd081ae8f0cb03dcae2e57b9b261667",
   * //     "value": "0",
   * //     "v": "0x29",
   * //     "r": "0x1c1ad7e8ee64fc284adce0910d6f811933af327b20cb8adba392a1b24a15054f",
   * //     "s": "0x690785383bed28c9a951b30329a066cb78062f63febf5aa1ca7e7ef62a2108cb"
   * //   }
   * // ]
   */
  getTransByBlock(chainType: string, blockHashOrBlockNumber: string, option?: any): Promise<any>;
  /**
   * Get transaction information via the specified address on certain chain.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} address - The account's address that you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The transaction information.
   * @example
   * const ret = await sdk.getTransByAddress("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d");
   * console.log(ret);
   * // [
   * //   {
   * //     "blockNumber": 1004796,
   * //     "gas": 90000,
   * //     "nonce": 505,
   * //     "transactionIndex": 0,
   * //     "txType": "0x1",
   * //     "blockHash": "0x604e45aa6b67b1957ba793e534878d94bfbacd38eed2eb51990de097595a334e",
   * //     "from": "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d",
   * //     "gasPrice": "180000000000",
   * //     "hash": "0x353545658d513ff4fe1db9b0f979a24a831ae0949b37bc1afefc8179fc29b358",
   * //     "input": "0x",
   * //     "to": "0x8fbc408bef86476e3098dc539762d4021092bbde",
   * //     "value": "100000000000000000000",
   * //     "v": "0x2a",
   * //     "r": "0xbe8f287930782cff4d2e12e4a55c46765b610b88d13bc1a060a4565f3316e933",
   * //     "s": "0x7a297e96c54fffd124833462e03725ea8d168465d34a3e577afbaa9d05a99cd0"
   * //   },
   * //   {
   * //     "blockNumber": 1004818,
   * //     "gas": 21000,
   * //     "nonce": 0,
   * //     "transactionIndex": 0,
   * //     "txType": "0x1",
   * //     "blockHash": "0xbb5769654036fdb768ede5b1a172298d408808e7dcb78a82b3c8d5ef32fc67cb",
   * //     "from": "0x8fbc408bef86476e3098dc539762d4021092bbde",
   * //     "gasPrice": "200000000000",
   * //     "hash": "0xee3371655a53e6d413c3b9d570fee8852989554989fde51136cf3b9c672e272d",
   * //     "input": "0x",
   * //     "to": "0xc68b75ca4e4bf0b71e3594452a5e47b11d287724",
   * //     "value": "1000000000000000000",
   * //     "v": "0x2a",
   * //     "r": "0x4341dcd4156050b664b9c977644756201a6357c7b12e5db86b370a38b1ed6dfb",
   * //     "s": "0x43b380fc67394e8b9483af97f5de067ef6617b17cfaa75517f07ec8d166f3c65"
   * //   }
   * // ]
   */
  getTransByAddress(chainType: string, address: string, option?: any): Promise<any>;
  /**
   * Get transaction information via the specified address between the specified startBlockNo and endBlockNo on certain chain.
   * <br>Comments:
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no <code>startBlockNo</code> given, <code>startBlockNo</code> will be set to 0;
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;if no <code>endBlockNo</code> given, <code>endBlockNo</code> will be set to the newest blockNumber.
   * <br><br><strong>Returns:</strong>
   * <br><font color=&#39;blue&#39;>«Promise,undefined»</font> Returns undefined if used with callback or a promise otherwise.
   *
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"WAN"</code>.
   * @param {string} address - The account's address that you want to search.
   * @param {number} startBlockNo - The start block number that you want to search from.
   * @param {number} endBlockNo - The end block number that you want to search to.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>counterparty</code> - The string of account's address that you want to search. Only for <code>"XRP"</code>. If provided, only return transactions with this account as a counterparty to the transaction.
   * <br>&nbsp;&nbsp;<code>earliestFirst</code> - Boolean. Only for <code>"XRP"</code>. If true, sort transactions so that the earliest ones come first. By default, the newest transactions will come first.
   * <br>&nbsp;&nbsp;<code>initiated</code> - Boolean. Only for <code>"XRP"</code>. If true, return only transactions initiated by the account specified by address. If false, return only transactions not initiated by the account specified by address.
   * <br>&nbsp;&nbsp;<code>limit</code> - Number. Only for <code>"XRP"</code>. If specified, return at most this many transactions.
   * <br>&nbsp;&nbsp;<code>types</code> - Array. Only for <code>"XRP"</code>. Only return transactions of the specified Transaction Types. Currently supports <code>"payment"</code>, <code>"order"</code>, <code>"orderCancellation"</code>, <code>"trustline"</code>, <code>"settings"</code>, <code>"escrowCreation"</code>, <code>"escrowCancellation"</code>, <code>"escrowExecution"</code>, <code>"checkCreate"</code>, <code>"checkCancel"</code>, <code>"checkCash"</code>, <code>"paymentChannelCreate"</code>, <code>"paymentChannelFund"</code>, <code>"paymentChannelClaim"</code>, <code>"ticketCreate"</code>.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search, using <code>undefined</code> that means legacy format as default.
   * @returns {Promise<any>} - The transaction information.
   * @example
   * const ret = await sdk.getTransByAddressBetweenBlocks("WAN", "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d", 984119, 984120);
   * console.log(ret);
   * // [
   * //   {
   * //     "blockNumber": 984119,
   * //     "gas": 4700000,
   * //     "nonce": 407,
   * //     "transactionIndex": 0,
   * //     "txType": "0x1",
   * //     "blockHash": "0xdf59acacabe8c1b64ca6ff611c629069731d9dae60f4b0cc753c4a0571ea7f27",
   * //     "from": "0xbb9003ca8226f411811dd16a3f1a2c1b3f71825d",
   * //     "gasPrice": "180000000000",
   * //     "hash": "0xf4610446d836b95d577ba723e1df55258e4f602cfa26d5ada3b50fa2fe82b469",
   * //     "input": "0x6060604052341561000f57600080fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506102d78061005e6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630900f01014610067578063445df0ac146100a05780638da5cb5b146100c9578063fdacd5761461011e575b600080fd5b341561007257600080fd5b61009e600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610141565b005b34156100ab57600080fd5b6100b3610220565b6040518082815260200191505060405180910390f35b34156100d457600080fd5b6100dc610226565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561012957600080fd5b61013f600480803590602001909190505061024b565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561021c578190508073ffffffffffffffffffffffffffffffffffffffff1663fdacd5766001546040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180828152602001915050600060405180830381600087803b151561020b57600080fd5b5af1151561021857600080fd5b5050505b5050565b60015481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102a857806001819055505b505600a165627a7a72305820de682f89b485041a9206a7304a95a151cd2363297029280359a4ca996dcaeda20029",
   * //     "to": null,
   * //     "value": "0",
   * //     "v": "0x29",
   * //     "r": "0xd14dfde02e305a945e6a09b6dbd5fe1f1bd5a6dc0721c15f72732aa10a3829b3",
   * //     "s": "0x56923b20a15f02633295b415ae52161529d560580dfcd62a97bc394c841bea37"
   * //   }
   * // ]
   */
  getTransByAddressBetweenBlocks(chainType: string, address: string, startBlockNo: number, endBlockNo: number, option?: any): Promise<any>;
  /**
   * Get the block information about a block by block number on certain chain.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {number|string} blockNumber - The blockNumber you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The block information.
   * @example
   * const ret = await sdk.getBlockByNumber("WAN", "670731");
   * console.log(ret);
   * // {
   * //   "size": 727,
   * //   "timestamp": 1522575814,
   * //   "transactions": ["0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"],
   * //   "uncles": [],
   * //   "difficulty": "5812826",
   * //   "extraData": "0xd783010004846765746887676f312e392e32856c696e75780000000000000000de43ad982c5ccfa922f701d9ac91d47ceaaeeea7e1cc092b1ff6c3c5dcce70a07cf5a79886ff0cc02254ec0de51f1a6881a69a38cd2866a5c0dddbe0dd0f2ce301",
   * //   "gasLimit": 4712388,
   * //   "gasUsed": 21000,
   * //   "hash": "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8",
   * //   "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
   * //   "miner": "0x321a210c019790308abb948360d144e7e00b7dc5",
   * //   "mixHash": "0x691299af763a758e94200545b8a5fe9d4f2cedbbfea031a1bbc540cbde4631d1",
   * //   "nonce": "0x2c8dd099eda5b188",
   * //   "number": 670731,
   * //   "parentHash": "0xd907820c7a46ba668a7e5bda8c6a23ec250877b853a85d8343688337f967b2d9",
   * //   "receiptsRoot": "0x056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2",
   * //   "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
   * //   "stateRoot": "0xafbfae425a7fed863662f88d64819132079b43ac4d85988ab6cce7f9342348af",
   * //   "totalDifficulty": "3610551057115",
   * //   "transactionsRoot": "0x96fc902544191c38f1c9a2725ea2ae29e34246fb4e95728f3e72added7c9574b"
   * // }
   */
  getBlockByNumber(chainType: string, blockNumber: string, option?: any): Promise<any>;
  /**
   * Get the block information about a block by block number on certain chain.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} blockHash - The blockHash you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The block information.
   * @example
   * const ret = await sdk.getBlockByHash("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8");
   * console.log(ret);
   * // {
   * //   "size": 727,
   * //   "timestamp": 1522575814,
   * //   "transactions": ["0x4dcfc82728b5a9307f249ac095c8e6fcc436db4f85a094a0c5a457255c20f80f"],
   * //   "uncles": [],
   * //   "difficulty": "5812826",
   * //   "extraData": "0xd783010004846765746887676f312e392e32856c696e75780000000000000000de43ad982c5ccfa922f701d9ac91d47ceaaeeea7e1cc092b1ff6c3c5dcce70a07cf5a79886ff0cc02254ec0de51f1a6881a69a38cd2866a5c0dddbe0dd0f2ce301",
   * //   "gasLimit": 4712388,
   * //   "gasUsed": 21000,
   * //   "hash": "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8",
   * //   "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
   * //   "miner": "0x321a210c019790308abb948360d144e7e00b7dc5",
   * //   "mixHash": "0x691299af763a758e94200545b8a5fe9d4f2cedbbfea031a1bbc540cbde4631d1",
   * //   "nonce": "0x2c8dd099eda5b188",
   * //   "number": 670731,
   * //   "parentHash": "0xd907820c7a46ba668a7e5bda8c6a23ec250877b853a85d8343688337f967b2d9",
   * //   "receiptsRoot": "0x056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2",
   * //   "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
   * //   "stateRoot": "0xafbfae425a7fed863662f88d64819132079b43ac4d85988ab6cce7f9342348af",
   * //   "totalDifficulty": "3610551057115",
   * //   "transactionsRoot": "0x96fc902544191c38f1c9a2725ea2ae29e34246fb4e95728f3e72added7c9574b"
   * // }
   */
  getBlockByHash(chainType: string, blockHash: string, option?: any): Promise<any>;
  /**
   * Get the number of transaction in a given block by block number or block hash on certain chain.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} blockHashOrBlockNumber - The blockHash or the blockNumber you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The block transaction count.
   * @example
   * const ret = await sdk.getBlockTransactionCount("WAN", "0xeb3b437d765d4da9210481c2dd612fa9d0c51e0e83120ee7f573ed9d6296e9a8");
   * // const ret = await sdk.getBlockTransactionCount("WAN", "670731");
   * console.log(ret);
   * // 1
   */
  getBlockTransactionCount(chainType: string, blockHashOrBlockNumber: string, option?: any): Promise<number>;
  /**
   * Get transaction count on certain chain.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried, should be <code>"WAN"</code>.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>address</code> - The account's address that you want to search.
   * <br>&nbsp;&nbsp;<code>startBlockNo</code> - The start block number that you want to search from.
   * <br>&nbsp;&nbsp;<code>endBlockNo</code> - The end block number that you want to search to.
   * @returns {Promise<number>} - The transaction count.
   * @example
   * const ret = await sdk.getTransCount("WAN", {"address":"0x0b80f69fcb2564479058e4d28592e095828d24aa", "startBlockNo":3607100, "endBlockNo":3607130});
   * console.log(ret);
   * // 1
   */
  getTransCount(chainType: string, option?: any): Promise<number>;
  /**
   * Returns an object with serializedTransaction(buffer) and empty signatures for the given actions with blocksBehind and expireSeconds.
   * @since 1.1.0
   * @group Transactions
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code> or <code>'XRP'</code>.
   * @param {any} tx - The transaction to be packed.
   * <br>&nbsp;&nbsp;<code>actions</code> - required Array of objects (Action).
   * <br>&nbsp;&nbsp;<code>blocksBehind</code> - Optional, default is 3.
   * <br>&nbsp;&nbsp;<code>expireSeconds</code> - Optional, default is 30.
   * <br> If <code>blocksBehind</code> and <code>expireSeconds</code> are set, the block <code>blocksBehind</code> the head block retrieved from JsonRpc's <code>get_info</code> is set as the reference block and the transaction header is serialized using this reference block and the expiration field.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search, using <code>undefined</code> that means legacy format as default.
   * @returns {Promise<any>} - The packed transaction.
   * @example
   * const ret = await sdk.packTransaction("EOS", {"actions":[{"account":"eosio","name":"delegatebw","authorization":[{"actor":"aarontestnet","permission":"active"}],"data":{"from":"aarontestnet","receiver":"aarontestnet","stake_net_quantity":"0.0001 EOS","stake_cpu_quantity":"0.0001 EOS","transfer":false}}]});
   * console.log(ret);
   * // {
   * //   "serializedTransaction": {
   * //     "0": 177,
   * //     "1": 226,
   * //     "2": 138,
   * //     "3": 94,
   * //     "4": 122,
   * //     "5": 95,
   * //     "...": "...",
   * //     "98": 0
   * //   },
   * //   "signatures": []
   * // }
   */
  packTransaction(chainType: string, tx: any, option?: any): Promise<any>;
  /**
   * Get the specific public parameter value of one contract on certain chain.
   * @since 1.1.0
   * @group Contracts
   * @param {string} chainType - The chain being queried, should be <code>"WAN"</code>, <code>'ETH'</code> and other EVM chain.
   * @param {string} scAddr - The token contract address for the specified token.
   * @param {string} name - The name of the specific contract parameter.
   * @param {Array} abi - The ABI of the specific contract.
   * @returns {Promise<any>} - The specific public parameter value.
   * @example
   * const ret = await sdk.getScVar("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "addr", [/The Abi of the contracts/]);
   * console.log(ret);
   * // "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
   */
  getScVar(chainType: string, scAddr: string, name: string, abi: Array<any>, version: string): Promise<any>;
  /**
   * Get the specific public map value of one contract on certain chain.
   * @since 1.1.0
   * @group Contracts
   * @param {string} chainType - The chain being queried, should be <code>"WAN"</code>, <code>'ETH'</code> and other EVM chain.
   * @param {string} scAddr - The token contract address for the specified token.
   * @param {string} name - The name of the specific contract parameter.
   * @param {string} key - The key of parameter of the specific contract public map.
   * @param {Array} abi - The ABI of the specific contract.
   * @returns {Promise<any>} - The specific public map value.
   * @example
   * const ret = await sdk.getScMap("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "mapAddr", "key", [/The Abi of the contracts/]);
   * console.log(ret);
   * // "0x2ecb855170c941f239ffe3495f3e07cceabd8421"
   */
  getScMap(chainType: string, scAddr: string, name: string, key: string, abi: Array<any>, version: string): Promise<any>;
  /**
   * Call the specific public function of one contract on certain chain.
   * @since 1.1.0
   * @group Contracts
   * @param {string} chainType - The chain being queried, should be <code>"WAN"</code>, <code>'ETH'</code> and other EVM chain.
   * @param {string} scAddr - The token contract address for the specified token.
   * @param {string} name - The name of the specific contract parameter.
   * @param {Array} args - The parameters array a of the specific contract public function.
   * @param {Array} abi - The ABI of the specific contract.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The result to call the specific public function.
   * @example
   * const ret = await sdk.callScFunc("WAN", "0x55ba61f4da3166487a804bccde7ee4015f609f45", "getPriAddress", [], [/The Abi of the contracts/]);
   * console.log(ret);
   * // "0x8cc420e422b3fa1c416a14fc600b3354e3312524"
   */
  callScFunc(chainType: string, scAddr: string, name: string, args: Array<any>, abi: Array<any>, version: string, option?: any): Promise<any>;
  /**
   * Get the x value of p2sh by hash(x) from BTC.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} chainType - The chain being queried, should be <code>"BTC"</code>.
   * @param {string} hashX - The certain hashX that you want to search.
   * @returns {Promise<string>} - The x value of p2sh by hash(x).
   * @example
   * const ret = await sdk.getP2shxByHashx("BTC", "d2a5b1f403594dbc881e466d46a4cac3d6cf202476b1277876f0b24923d032da");
   * console.log(ret);
   * // "2ecb855170c941f239ffe3495f3e07cceabd8421"
   */
  getP2shxByHashx(chainType: string, hashX: string): Promise<string>;
  /**
   * Send a <code>'import address'</code> command to Bitcoin-like chain.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain being queried, should be <code>"BTC"</code>.
   * @param {string} address - The BTC account address you want to import to the node to scan transactions.
   * @returns {Promise<string>}
   * @example
   * const ret = await sdk.importAddress("BTC", "mmmmmsdfasdjflaksdfasdf");
   * console.log(ret);
   * // "success"
   */
  importAddress(chainType: string, address: string): Promise<string>;
  /**
   * Query a <code>'estimatesmartfee'</code> command to Bitcoin-like chain.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain name that you want to search, should be <code>"BTC"</code>, <code>"LTC"</code> and <code>"DOGE"</code>.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>target</code> - The numeric of confirmation target in blocks (1 - 1008).
   * <br>&nbsp;&nbsp;<code>mode</code> - The string of fee estimate mode.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search, using <code>undefined</code> that means legacy format as default.
   * @returns {Promise<string|number>} - The result of <code>'estimatesmartfee'</code>.
   * @example
   * const ret = await sdk.estimateSmartFee("BTC");
   * console.log(ret);
   * // "10500000000000"
   */
  estimateSmartFee(chainType: string, option?: any): Promise<string | number>;
  /**
   * Get the information of tokens which are supported for cross-chain ability.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} crossChain - The cross-chain name that you want to search, should be <code>"ETH"</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The information of tokens.
   * @example
   * const ret = await sdk.getRegTokens("ETH");
   * console.log(ret);
   * // [
   * //   {
   * //     "tokenOrigAddr": "0x54950025d1854808b09277fe082b54682b11a50b",
   * //     "tokenWanAddr": "0x67f3de547c7f3bc77095686a9e7fe49397e59cdf",
   * //     "ratio": "15000000",
   * //     "minDeposit": "10000000000000000000",
   * //     "origHtlc": "0x149f1650f0ff097bca88118b83ed58fb1cfc68ef",
   * //     "wanHtlc": "0x27feb1785f61504619a105faa00f57c49cc4d9c3",
   * //     "withdrawDelayTime": "259200",
   * //     "tokenHash": "0xe6bb4913c8cfb38d44a01360bb7874c58812e14b9154543bb67783e611e0475b",
   * //     "name": "Wanchain MKR Crosschain Token",
   * //     "symbol": "MKR",
   * //     "decimals": "18",
   * //     "iconData": "/9j/4AAQ...",
   * //     "iconType": "jpg"
   * //   },
   * //   {
   * //     "tokenOrigAddr": "0xdbf193627ee704d38495c2f5eb3afc3512eafa4c",
   * //     "tokenWanAddr": "0xda16e66820a3c64c34f2b35da3f5e1d1742274cb",
   * //     "ratio": "20000",
   * //     "minDeposit": "10000000000000000000",
   * //     "origHtlc": "0x149f1650f0ff097bca88118b83ed58fb1cfc68ef",
   * //     "wanHtlc": "0x27feb1785f61504619a105faa00f57c49cc4d9c3",
   * //     "withdrawDelayTime": "259200",
   * //     "tokenHash": "0x0cfee48dd8c8e32ad342c0f4ee723df9c2818d02734e28897ad0295bb458d4bc",
   * //     "name": "Wanchain SAI Crosschain Token",
   * //     "symbol": "SAI",
   * //     "decimals": "18",
   * //     "iconData": "/9j/4AAQ...",
   * //     "iconType": "jpg"
   * //   }
   * // ]
   */
  getRegTokens(crossChain: string, option?: any): Promise<Array<any>>;
  /**
   * Token exchange ratio,such as 1 token to 880 WANs, the precision is 10000, the ratio is 880*precision = 880,0000. The ratio would be changed accoring to the market value ratio periodically.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} crossChain - The cross-chain name that you want to search, should be <code>"ETH"</code>.
   * @param {string} tokenScAddr - The token contract address for the specified token.
   * @returns {Promise<string>} - The result of ratio.
   * @example
   * const ret = await sdk.getToken2WanRatio("ETH", "0x00f58d6d585f84b2d7267940cede30ce2fe6eae8");
   * console.log(ret);
   * // "3000"
   */
  getToken2WanRatio(crossChain: string, tokenScAddr: string): Promise<string>;
  /**
   * Returns an array about OTA mix set.
   * @since 1.1.0
   * @group PrivateTrans
   * @param {string} address - The OTA address
   * @param {number} num - The privateTx:ringSize.
   * @param {string} chainType - Optional, the chain being queried. Currently supports <code>'WAN'</code>.
   * @returns {Promise<Array<string>>} - The array about OTA mix set.
   * @example
   * const ret = await sdk.getOTAMixSet("0x02539dD49A75d6Cf4c5cc857bc87BC3836E74F1c845A08eC5E009A4dCa59D47C7c0298697d22cfa7d35A670B45C3531ea9D3aAc39E58c929d440Ac1392BDeB8926e7", 8);
   * console.log(ret);
   * // [ '0x02a0ab76c74fc379743bdc958d806c9062f3fc68b097fe8e91453d7324f7ae648702a20af02d1fe495036b38ab8c44b5676c1c0158f0057b6500150374b6f19ab2ba',
   * //   '0x020317c92daac5ad9cc5377bc4f493197772e9459fb737e1c26c7e6f030f21b7d002c5d50ef420e818f58c87a3f57cb1167adf268911021e9d0c3cf9aea7e06ac1ad',
   * //   '0x02c6fa830d978e20bff8e993356d3456aa6c6f1dab966d20953bac55b7526ab0f203719139be2bc3660a8841fcf3d34d9043693e48b6cfebeaa4447cb1d72f809139',
   * //   '0x03039ca6d4c95e75b7b6e131bf2af3d84b8d1807c34ed04fc637e57e45f5b590e503db2ce78d660ed6e230feb4ea91d8f7662315731d625d4a7d771cf82b686fb0a9',
   * //   '0x03f0ee5da723151435e287a616e4502642315c9ed933569402ad0f838db0fd597a0325b3cb82275a6aa6cc1f1edc9675fc7201f5e9e589a34ed676f4400f2a081129',
   * //   '0x038b3c1fada7710a519c4bb7929c8d08a8e9e17fcf7ea510043d00a6844a06155c02ec1e571a8f3a1471461cf74ecc4568d4009a3fc910c29c30bfdfb05f79924b12',
   * //   '0x036d369b2a0e4fbd0e270c5d78e8fc53c1b0f1d58878f1a106812380325493fec3020f00e39b4e76169433289f92ee0fea44e1e0f26b87420c6f897489f6975621b6',
   * //   '0x03bf32510e236f8bafd3127a3598f9c36f60612371f798ed766214183d1d2c3f1b027de375bc1112030300b843172f39031a735fc626f76e823e6b3e0367d89b269d'
   * // ]
   */
  getOTAMixSet(address: string, num: number, chainType: string): Promise<Array<string>>;
  /**
   * Executes a message call or transaction and returns the amount of the gas used.
   * @since 1.1.0
   * @group PrivateTrans
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {any} tx - The transaction object see eth.sendTransaction, with the difference that for calls the from property is optional as well.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number|string>} - The estimated gas.
   * @example
   * const ret = await sdk.estimateGas("WAN", {from:'0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', to:'0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe', value:'1000000000000000'});
   * console.log(ret);
   * // 21000
   */
  estimateGas(chainType: string, tx: any, option?: any): Promise<number | string>;
  /**
   * Returns an object containing various details about the blockchain.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The blockchain info.
   * @example
   * const ret = await sdk.getChainInfo("EOS");
   * console.log(ret);
   * // {
   * //   server_version: 'aa60b9ca',
   * //   chain_id: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
   * //   head_block_num: 84031197,
   * //   last_irreversible_block_num: 84030870,
   * //   last_irreversible_block_id: '05023596ebe1b775a39a0ab380a0fd95bf435fbe9eccbf2b3e38c44a0cdc6a0d',
   * //   head_block_id: '050236dd683c4f98c9f5965910bf941d67b8fe6469a149114a3f0053779461da',
   * //   head_block_time: '2020-04-02T11:35:25.000',
   * //   head_block_producer: 'five.cartel',
   * //   virtual_block_cpu_limit: 500000000,
   * //   virtual_block_net_limit: 524288000,
   * //   block_cpu_limit: 499990,
   * //   block_net_limit: 524288,
   * //   server_version_string: 'v2.0.2',
   * //   fork_db_head_block_num: 84031197,
   * //   fork_db_head_block_id: '050236dd683c4f98c9f5965910bf941d67b8fe6469a149114a3f0053779461da',
   * //   server_full_version_string: 'v2.0.2-aa60b9caf9b7e2bd2411bb199c0c1d9fd8f085d5'
   * // }
   */
  getChainInfo(chainType: string, option?: any): Promise<any>;
  /**
   * Returns an object with one member labeled as the symbol you requested, the object has three members: supply (Symbol), max_supply (Symbol) and issuer (Name).
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} tokenScAddr - EOS contract code.
   * @param {string} symbol - A string representation of an EOSIO symbol.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The stats info.
   * @example
   * const ret = await sdk.getStats("EOS", "eosio.token", "EOS");
   * console.log(ret);
   * // {
   * //   "supply": "10756688680.6257 EOS",
   * //   "max_supply": "100000000000.0000 EOS",
   * //   "issuer": "eosio"
   * // }
   */
  getStats(chainType: string, tokenScAddr: string, symbol: string, option?: any): Promise<any>;
  /**
   * Returns an object containing various details about a specific account on the blockchain.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain being queried. Currently supports <code>'XRP'</code>.
   * @param {string} address - The account code.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search, using <code>undefined</code> that means legacy format as default.
   * @returns {Promise<any>} - The account info.
   * @example
   * const ret = await sdk.getAccountInfo("EOS", "aarontestnet");
   * console.log(ret);
   * // {
   * //   "account_name": "aarontestnet",
   * //   "head_block_num": 84039011,
   * //   "head_block_time": "2020-04-02T12: 40: 32.000",
   * //   "privileged": false,
   * //   "last_code_update": "1970-01-01T00: 00: 00.000",
   * //   "created": "2019-04-22T03: 47: 11.500",
   * //   "core_liquid_balance": "148.3494 EOS",
   * //   "ram_quota": 7517,
   * //   "net_weight": 340000,
   * //   "cpu_weight": 2230000,
   * //   "net_limit": {
   * //     "used": 520,
   * //     "available": 2188721,
   * //     "max": 2189241
   * //   },
   * //   "cpu_limit": {
   * //     "used": 935,
   * //     "available": 13184853,
   * //     "max": 13185788
   * //   },
   * //   "ram_usage": 3894,
   * //   "permissions": [
   * //     {
   * //       "perm_name": "active",
   * //       "parent": "owner",
   * //       "required_auth": [Object]
   * //     },
   * //     {
   * //       "perm_name": "owner",
   * //       "parent": "",
   * //       "required_auth": [Object]
   * //     }
   * //   ],
   * //   "total_resources": {
   * //     "owner": "aarontestnet",
   * //     "net_weight": "34.0000 EOS",
   * //     "cpu_weight": "223.0000 EOS",
   * //     "ram_bytes": 6117
   * //   },
   * //   "self_delegated_bandwidth": {
   * //     "from": "aarontestnet",
   * //     "to": "aarontestnet",
   * //     "net_weight": "24.0000 EOS",
   * //     "cpu_weight": "73.0000 EOS"
   * //   },
   * //   "refund_request": null,
   * //   "voter_info": {
   * //     "owner": "aarontestnet",
   * //     "proxy": "",
   * //     "producers": [],
   * //     "staked": 2010000,
   * //     "last_vote_weight": "0.00000000000000000",
   * //     "proxied_vote_weight": "0.00000000000000000",
   * //     "is_proxy": 0,
   * //     "flags1": 0,
   * //     "reserved2": 0,
   * //     "reserved3": "0"
   * //   },
   * //   "rex_info": null
   * // }
   */
  getAccountInfo(chainType: string, address: string, option?: any): Promise<any>;
  /**
   * Returns an array containing account names which is related to the public key, or owned by the given account.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} addressOrPublicKey - The account name or the public key.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search, using <code>undefined</code> that means legacy format as default.
   * @returns {Array<any>} - The accounts.
   * @example
   * const ret = await sdk.getAccounts("EOS", "EOS6yEsFdisRXLpk4xg4AEnYJDW5bLrjwBDoHNREsDsxcwFEncErK");
   * // const ret = await sdk.getAccounts("EOS", "aarontestnet");
   * console.log(ret);
   * // [ "wanchainbbbb", "wanchainaaaa" ]
   */
  getAccounts(chainType: string, addressOrPublicKey: string): Promise<any>;
  /**
   * Returns the required keys needed to sign a transaction.
   * @since 1.1.0
   * @group EOS
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {any} txArgs - Optional, transaction arguments.
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
   * @returns {Promise<Array<string>>} - The required keys.
   * @example
   * const ret = await sdk.getRequiredKeys("EOS", {"transaction":{"expiration":"2020-04-03T06:06:41","ref_block_num":15105,"ref_block_prefix":2116318876,"max_net_usage_words":"","max_cpu_usage_ms":"","delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"cuiqiangtest","permission":"active"}],"data":"90D5CC58E549AF3180626ED39986A6E1010000000000000004454F530000000000"}],"transaction_extensions":[]},"available_keys":["EOS7MiJnddv2dHhjS82i9SQWMpjLoBbxP1mmpDmwn6ALGz4mpkddv"]});
   * console.log(ret);
   * // ['PUB_K1_69X3383RzBZj41k73CSjUNXM5MYGpnDxyPnWUKPEtYQmVzqTY7']
   */
  getRequiredKeys(chainType: string, txArgs: any, option?: any): Promise<Array<string>>;
  /**
   * Retrieves raw code and ABI for a contract based on account name.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} scAddr - The contract account name.
   * @returns {Promise<any>} - The raw code and ABI.
   * @example
   * const ret = await sdk.getRawCodeAndAbi("EOS", "wanchainhtlc");
   * console.log(ret);
   * // { "account_name": "wanchainhtlc", "wasm": "...", "abi": "..." }
   */
  getRawCodeAndAbi(chainType: string, scAddr: string): Promise<any>;
  /**
   * Retrieves the ABI for a contract based on its account name.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} scAddr - The contract account name.
   * @returns {Promise<any>} - The ABI.
   * @example
   * const ret = await sdk.getAbi("EOS", "wanchainhtlc");
   * console.log(ret);
   * // {
   * //   "version": "eosio::abi/1.1",
   * //   "types": [
   * //     {
   * //       "new_type_name": "time_t",
   * //       "type": "uint32"
   * //     }
   * //   ],
   * //   "structs": [
   * //     {
   * //       "name": "asset_t",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "debt_t",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "fee_t",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "inlock",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "inredeem",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "inrevoke",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "lockdebt",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "num64_t",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "outlock",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "outredeem",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "outrevoke",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "pk_t",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "redeemdebt",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "regsig",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "revokedebt",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "setratio",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "signature_t",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "transfer_t",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "unregsig",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "updatesig",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     },
   * //     {
   * //       "name": "withdraw",
   * //       "base": "",
   * //       "fields": ["Array"]
   * //     }
   * //   ],
   * //   "actions": [
   * //     {
   * //       "name": "inlock",
   * //       "type": "inlock",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "inredeem",
   * //       "type": "inredeem",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "inrevoke",
   * //       "type": "inrevoke",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "lockdebt",
   * //       "type": "lockdebt",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "outlock",
   * //       "type": "outlock",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "outredeem",
   * //       "type": "outredeem",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "outrevoke",
   * //       "type": "outrevoke",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "redeemdebt",
   * //       "type": "redeemdebt",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "regsig",
   * //       "type": "regsig",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "revokedebt",
   * //       "type": "revokedebt",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "setratio",
   * //       "type": "setratio",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "unregsig",
   * //       "type": "unregsig",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "updatesig",
   * //       "type": "updatesig",
   * //       "ricardian_contract": ""
   * //     },
   * //     {
   * //       "name": "withdraw",
   * //       "type": "withdraw",
   * //       "ricardian_contract": ""
   * //     }
   * //   ],
   * //   "tables": [
   * //     {
   * //       "name": "assets",
   * //       "index_type": "i64",
   * //       "key_names": [],
   * //       "key_types": [],
   * //       "type": "asset_t"
   * //     },
   * //     {
   * //       "name": "debts",
   * //       "index_type": "i64",
   * //       "key_names": [],
   * //       "key_types": [],
   * //       "type": "debt_t"
   * //     },
   * //     {
   * //       "name": "fees",
   * //       "index_type": "i64",
   * //       "key_names": [],
   * //       "key_types": [],
   * //       "type": "fee_t"
   * //     },
   * //     {
   * //       "name": "longlongs",
   * //       "index_type": "i64",
   * //       "key_names": [],
   * //       "key_types": [],
   * //       "type": "num64_t"
   * //     },
   * //     {
   * //       "name": "pks",
   * //       "index_type": "i64",
   * //       "key_names": [],
   * //       "key_types": [],
   * //       "type": "pk_t"
   * //     },
   * //     {
   * //       "name": "signer",
   * //       "index_type": "i64",
   * //       "key_names": [],
   * //       "key_types": [],
   * //       "type": "signature_t"
   * //     },
   * //     {
   * //       "name": "transfers",
   * //       "index_type": "i64",
   * //       "key_names": [],
   * //       "key_types": [],
   * //       "type": "transfer_t"
   * //     }
   * //   ],
   * //   "ricardian_clauses": [],
   * //   "error_messages": [],
   * //   "abi_extensions": [],
   * //   "variants": []
   * // }
   */
  getAbi(chainType: string, scAddr: string): Promise<any>;
  /**
   * Returns an object containing buffer ABI for a contract based on its account name.
   * @since 1.1.0
   * @group EOS
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} scAddr - The contract account name.
   * @returns {Promise<any>} - The accounts.
   * @example
   * const ret = await sdk.getRawAbi("EOS", "wanchainhtlc");
   * console.log(ret);
   * // {
   * //   "0": 14,
   * //   "1": 101,
   * //   "2": 111,
   * //   "3": 115,
   * //   "…": "...",
   * //   "1557": 0
   * // }
   */
  getRawAbi(chainType: string, scAddr: string, option?: any): Promise<any>;
  /**
   * Returns an array of actions based on notified account..
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} address - The account name you want to query.
   * @param {any} option - Optional, the filter for actions.
   * <br>&nbsp;&nbsp;<strong>For eosjs 16.0.0</strong>:
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>pos</code> - An int32 that is absolute sequence positon, -1 is the end/last action.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;<code>offset</code> - The number of actions relative to pos, negative numbers return [pos-offset,pos), positive numbers return [pos,pos+offset).
   *
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
   * @returns {Promise<any>} - The actions.
   * @example
   * const ret = await sdk.getActions("EOS", "wanchainhtlc", {filter: "wanchainhtlc:outlock", limit: 2});
   * console.log(ret);
   * // [
   * //   {
   * //     "act": { "authorization": [Array],
   * //     "data": [Object],
   * //     "account": "wanchainhtlc",
   * //     "name": "outlock"
   * //   },
   * //   "cpu_usage_us": 504,
   * //   "net_usage_words": 65,
   * //   "account_ram_deltas": [ [Object] ],
   * //   "global_sequence": 564872608,
   * //   "@timestamp": "2020-02-20T03:19:58.500",
   * //   "block_num": 76739261,
   * //   "producer": "eight.cartel",
   * //   "trx_id": "20bd931ce948c57614f9c6b617532f806a59314ebfe0cacea13be461e0806034",
   * //   "action_ordinal": 1,
   * //   "creator_action_ordinal": 0,
   * //   "notified": [ "wanchainhtlc" ]
   * //   }
   * // ]
   */
  getActions(chainType: string, address: string, option: any): Promise<any>;
  /**
   * Returns an object containing rows from the specified table eosio.table.global.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @returns {Promise<any>} - The resource info.
   * @example
   * const ret = await sdk.getResource("EOS");
   * console.log(ret);
   * // {
   * //   "max_block_net_usage": 524288,
   * //   "target_block_net_usage_pct": 1000,
   * //   "max_transaction_net_usage": 524287,
   * //   "base_per_transaction_net_usage": 12,
   * //   "net_usage_leeway": 500,
   * //   "context_free_discount_net_usage_num": 20,
   * //   "context_free_discount_net_usage_den": 100,
   * //   "max_block_cpu_usage": 500000,
   * //   "target_block_cpu_usage_pct": 10,
   * //   "max_transaction_cpu_usage": 200000,
   * //   "min_transaction_cpu_usage": 10,
   * //   "max_transaction_lifetime": 3600,
   * //   "deferred_trx_expiration_window": 600,
   * //   "max_transaction_delay": 3888000,
   * //   "max_inline_action_size": 524287,
   * //   "max_inline_action_depth": 16,
   * //   "max_authority_depth": 6,
   * //   "max_ram_size": "68719476736",
   * //   "total_ram_bytes_reserved": "31287726990",
   * //   "total_ram_stake": "8358873421",
   * //   "last_producer_schedule_update": "2020-04-05T13:19:05.500",
   * //   "last_pervote_bucket_fill": "2020-04-05T13:12:01.000",
   * //   "pervote_bucket": 2472797114,
   * //   "perblock_bucket": "2207987466943",
   * //   "total_unpaid_blocks": 13819603,
   * //   "total_activated_stake": "2480152949826",
   * //   "thresh_activated_stake_time": "2018-11-23T17:21:01.000",
   * //   "last_producer_schedule_size": 21,
   * //   "total_producer_vote_weight": "460825067195145191424.00000000000000000",
   * //   "last_name_close": "2020-04-04T13:37:20.500"
   * // }
   */
  getResource(chainType: string): Promise<any>;
  /**
   * Returns an object containing net/cpu/ram price(cpu in ms/EOS, net/ram in KB/EOS) by provide one producer's account.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} address - The producer's account.
   * @returns {Promise<any>} - The resource price.
   * @example
   * const ret = await sdk.getResourcePrice("EOS", "junglesweden");
   * console.log(ret);
   * // { "net": "0.005301073461471487", "cpu": "0.005637367015436455", "ram": "0.050223917691993435" }
   */
  getResourcePrice(chainType: string, address: string): Promise<any>;
  /**
   * Returns an object containing net/cpu price(cpu in ms/EOS, net in KB/EOS) by provide one producer's account.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} address - The producer's account.
   * @returns {Promise<any>} - The bandwidth price.
   * @example
   * const ret = await sdk.getBandwidthPrice("EOS", "junglesweden");
   * console.log(ret);
   * // { "net": "0.005301073461471487", "cpu": "0.005637367015436455" }
   */
  getBandwidthPrice(chainType: string, address: string): Promise<any>;
  /**
   * Returns ram price(in KB/EOS).
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @returns {Promise<string>} - The ram price.
   * @example
   * const ret = await sdk.getRamPrice("EOS");
   * console.log(ret);
   * // "0.05022503944229491"
   */
  getRamPrice(chainType: string): Promise<string>;
  /**
   * Returns an object with one member labeled as 'EOS' you requested, the object has three members: supply (Symbol), max_supply (Symbol) and issuer (Name).
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @returns {Promise<any>} - The ram price.
   * @example
   * const ret = await sdk.getTotalSupply("EOS");
   * console.log(ret);
   * // { "supply": "10757681325.5591 EOS", "max_supply": "100000000000.0000 EOS", "issuer": "eosio" }
   */
  getTotalSupply(chainType: string): Promise<any>;
  /**
   * Returns current 'EOS' stake amount.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @returns {Promise<string>} - The current 'EOS' stake amount.
   * @example
   * const ret = await sdk.getTotalStaked("EOS");
   * console.log(ret);
   * // "2868049208.8674 EOS"
   */
  getTotalStaked(chainType: string): Promise<string>;
  /**
   * Returns an object with current 'EOS' stake info, the object has three members: totalStaked, totalSup and staked percent.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @returns {Promise<any>} - The stake info.
   * @example
   * const ret = await sdk.getTotalStakedPercent("EOS");
   * console.log(ret);
   * // { "totalStaked": 2868049208.8674, "totalSup": 10757681325.5591, "percent": 0.266604774957706 }
   */
  getTotalStakedPercent(chainType: string): Promise<any>;
  /**
   * Returns an object containing rows from the specified table.
   * @since 1.1.0
   * @group EOS
   * @deprecated The EOS blockchain has been delisted.
   * @param {string} chainType - The chain being queried. Currently supports <code>'EOS'</code>.
   * @param {string} scAddr - The name of the smart contract that controls the provided table.
   * @param {string} scope - The account to which this data belongs.
   * @param {string} table - The name of the table to query.
   * @returns {Promise<any>} - The object containing rows from the specified table.
   * @example
   * const ret = await sdk.getTableRows("EOS", "wanchainhtlc", "wanchainhtlc", "transfers");
   * console.log(ret);
   * // {
   * //   "rows": [
   * //     {
   * //       "id": 0,
   * //       "pid": 0,
   * //       "quantity": "5.0000 EOS",
   * //       "user": "cuiqiangtest",
   * //       "lockedTime": 7200,
   * //       "beginTime": "2019-12-26T13:59:24",
   * //       "status": "inlock",
   * //       "xHash": "e4b7be8900393ef6b09a172a21be3b4f1b814ff580dbaeba130484fa99b2da7c",
   * //       "wanAddr": "25f2845ad9da78ebaa0e077404d35933f75422b8",
   * //       "account": "eosio.token"
   * //     },
   * //     {
   * //       "id": 1,
   * //       "pid": 0,
   * //       "quantity": "5.0000 EOS",
   * //       "user": "cuiqiangtest",
   * //       "lockedTime": 7200,
   * //       "beginTime": "2019-12-30T12:23:25",
   * //       "status": "inlock",
   * //       "xHash": "2be3dee75ddc370d301e55fb74644bab9b1bac9883cb92c4c57a35f4543ce8f6",
   * //       "wanAddr": "25f2845ad9da78ebaa0e077404d35933f75422b8",
   * //       "account": "eosio.token"
   * //     }
   * //   ],
   * //   "more": true,
   * //   "next_key": "3"
   * // }
   */
  getTableRows(chainType: string, scAddr: string, scope: string, table: string): Promise<any>;
  /**
   * Get the current Epoch ID.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The current epoch ID.
   * @example
   * const ret = await sdk.getEpochID("WAN");
   * console.log(ret);
   * // 18102
   */
  getEpochID(chainType: string, option?: any): Promise<number>;
  /**
   * Get the current epoch slot ID.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The current epoch slot ID.
   * @example
   * const ret = await sdk.getSlotID("WAN");
   * console.log(ret);
   * // 2541
   */
  getSlotID(chainType: string, option?: any): Promise<number>;
  /**
   * Get the public key list of the epoch leaders of the specified EpochID with the input parameter as EpochID.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The public key list.
   * @example
   * const ret = await sdk.getEpochLeadersByEpochID("WAN", 18102);
   * console.log(ret);
   * // {
   * //   "000000": "046c0979fbcd38b7887076db6b08adbbaae45189ac4239d2c06749b634dbeaafdf2b229b6c4eda1ab6ede7e46cbd9ab3ac35df1ac2a6f650bac39fd8474d85524e",
   * //   "000001": "04dac7b023f0e9fb5be91b48e5d546b2f2eb91029705f6055c24b3c804a49cf83f7cd584a96346ca42a94a02456444b7df4e280d2726971bf267f8182341ff81b9",
   * //   "000002": "042b7d4be32d25769472ea7c8d432bbad5abee051c048e4de425e6feb288fde6f33a16269e4e85fbda4f857a7d5eca8d33793b9249c83517a3214b64475cd50176",
   * //   ... ...
   * //   "000047": "046351650f15b8de869d89c572dc093000794e75e7f4a7c9f10e9b35f24694fa7555c143e4c4dd4548c0d06be2b2e6c536b37acf0c0ad4806e6c48f23ade4e4d9a",
   * //   "000048": "04fdb485b566c2ddb40e2f4341b1e5746479a7c45e3d8101b1360b8bdba6206deee520ceecc9e9897e3b05b53e3ffa6fa659bef47c384984c0bc021a843df10847",
   * //   "000049": "04fdb485b566c2ddb40e2f4341b1e5746479a7c45e3d8101b1360b8bdba6206deee520ceecc9e9897e3b05b53e3ffa6fa659bef47c384984c0bc021a843df10847"
   * // }
   */
  getEpochLeadersByEpochID(chainType: string, epochID: number, option?: any): Promise<any>;
  /**
   * Gets Random Number Proposer public keys of the specified epoch.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The Random Number Proposer public keys.
   * @example
   * const ret = await sdk.getRandomProposersByEpochID("WAN", 18102);
   * console.log(ret);
   * // {
   *   "000000": "29e0660fe921282b2d64c6adaf0b24945eee6d9fcdb419c39f84a551ed44151d27f786e5df7abcff94bbed2cbc2791bc76db21b5be469874be181e4fa234fb3e",
   *   "000001": "26a70d685549ffe982df0d66a88f36ac3fca6e488bf69eb6de62a37b97f3f56e2b6b56f47e817c01225ad5549f1ca9751dc1f65559f1a81639c6a4126c9df3ce",
   *   "000002": "21f4f0c4da56206685e94354acba851aab7dc7c090898f6bbb1fc42df986764b055f09e97ceb4c90976a1219ab749dd0b008d47f9c18b962a6056e66de8d858f",
   *   ... ...
   *   "000022": "1c96a7abf1424d0c5316fc74eb39022648062fc88997896bdeae70c4e008b3700136608e2ab653c037d144979403061d3247d6298bfdf0b26c9829db3175531e",
   *   "000023": "00e0c4fae08f124f7a8fe82988a385d9723bea14c8a6e2996a684846ae8d0d4e27abedb7d2f7150bd42ba830e960774b873de74b1d91d7c5ea1ba349a849e575",
   *   "000024": "2094589617397846c5125cf5922ba993643c401998ae8817d5005fe21245f4bc0fbb25158c54446757d2b03d89da10d7dfbbaa23afa38c6e87115dcebe2a8e4d"
   * }
   */
  getRandomProposersByEpochID(chainType: string, epochID: number, option?: any): Promise<any>;
  /**
   * Returns an array of validator information for all validators in the specified block number.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} blockNumber - The blockNumber you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The specified block staker info.
   * @example
   * const ret = await sdk.getEpochID("WAN");
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   * //     "pubSec256": "0x04b7bf8d3868333f70a30041423c7db204b80b9be2e585c344cf3f391cbf77b17fd14f3058d4475d546355bf8c2709ed9ecf5f0cee9d021c90988af0e8cf52001b",
   * //     "pubBn256": "0x289787688eb80c1e223375a71f8d17110d638a9143afa190dc11b3c1e64cf92b21feb02ab7a1dcb31892210dfda458aff890fe9e7508292099ae6256f197b325",
   * //     "amount": "0xa968163f0a57b400000",
   * //     "votingPower": "0x297116712be7b468800000",
   * //     "lockEpochs": 7,
   * //     "maxFeeRate": 1500,
   * //     "nextLockEpochs": 7,
   * //     "from": "0xdbb2d6199457d11288f0097659bcec24738e158f",
   * //     "stakingEpoch": 0,
   * //     "feeRate": 1500,
   * //     "feeRateChangedEpoch": 0,
   * //     "clients": [
   * //       {
   * //         "address": "0xfcc3736dc29bf9af7556fcc1dea10b53edaab51d",
   * //         "amount": "0x56bc75e2d63100000",
   * //         "votingPower": "0x1537da569da5bca00000",
   * //         "quitEpoch": 18071
   * //       }
   * //     ],
   * //     "partners": []
   * //   },
   * //    ... ...
   * // ]
   */
  getStakerInfo(chainType: string, blockNumber: number, option?: any): Promise<Array<any>>;
  /**
   * Get the reward information of the specified epoch, enter epochID, and reward payment details (including RNP reward, EL reward and chunk reward) will be returned for all the verification nodes and clients working in the epoch.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The reward information.
   * @example
   * const ret = await sdk.getEpochIncentivePayDetail("WAN", 18101);
   * console.log(ret);
   * // [
   * //   {
   * //     "delegators": [
   * //       {
   * //         "address": "0x81ad5c65a815f8dc28e0fd1d17ac4fa38f8a6838",
   * //         "incentive": "0x78b093af02e111",
   * //         "type": "delegator"
   * //       },
   * //       {
   * //         "address": "0x4e6b5f1abdd517739889334df047113bd736c546",
   * //         "incentive": "0x13afa1b719d597636",
   * //         "type": "delegator"
   * //       },
   * //        ... ...
   * //        {
   * //         "address": "0x8bf12b4cd3b41d40b2adfdf2857b2077d4194a44",
   * //         "incentive": "0x1922a4583a858b0",
   * //         "type": "delegator"
   * //       },
   * //       {
   * //         "address": "0x51253d40bb113827781de47e5a2d41f41924431d",
   * //         "incentive": "0x28376d59f73c11",
   * //         "type": "delegator"
   * //       }
   * //     ],
   * //     "address": "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   * //     "stakeInFromAddr": "0xdbb2d6199457d11288f0097659bcec24738e158f",
   * //     "incentive": "0xaf6f730467435b9f",
   * //     "type": "validator"
   * //   },
   * //      ... ...
   * // ]
   */
  getEpochIncentivePayDetail(chainType: string, epochID: number, option?: any): Promise<Array<any>>;
  /**
   * Get the activity information of the specified epoch. For historical epochs the values are fixed, while the current epoch will update the latest current values in real time.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The activity information.
   * @example
   * const ret = await sdk.getActivity("WAN", 18102);
   * console.log(ret);
   * // {
   * //   "epLeader":
   * //   [
   * //     "0x28c12c7b51860b9d5aec3a0ceb63c6e187c00aac",
   * //     "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   * //     "0x0e92d125ba28852a11428fcb63b6f0e44a52962f",
   * //     "0xee1ad9c4f9d81f900221e95ee04246b6254b0c6f",
   * //     "0xb58230a7923a6a1941016aa1682e212def899ed1",
   * //     "0xb9d6c1a6e52119026cb5d2a82457f5fd6bc7e0c9",
   * //     "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   * //     "0x1b7740df685f9d34773d5a2aba6ab3a2c1407f40",
   * //     "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   * //     "0x266ddcfdbe3ded75e0e511e6356bca052b221c6b",
   * //     "0x1ae5a38b4a5ca0aefbb1c17fd27073ab00fd2a3f",
   * //     "0x2866bca06ff1d6afe52298f9fc759ea9b80f6902",
   * //     "0xf0e02c3640020f083a314547ae99483aa2c7cd01",
   * //     "0x2a6e8c39d4e9f9152958649fc5dbdb9c68cfcb0b",
   * //     "0x0081a626fecff225cd87d3f23c0dd47a9fe243ac",
   * //     "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   * //     "0x2a6e8c39d4e9f9152958649fc5dbdb9c68cfcb0b",
   * //     "0xa3fb8f5e1fadfe104e4b1da91e8d96aab52faaf3",
   * //     "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   * //     "0x85dae7e5c7b433a1682c54eee63adf63d835d272"
   * //   ],
   * //   "epActivity":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   * //   "rpLeader":
   * //   [
   * //     "0x89a7588529eb7aaea0a229f2dfbb277b15649969",
   * //     "0x3dabf8331afbc553a1e458e37a6c9c819c452d55",
   * //     "0x010ee9abdf364972ac8d279ab96fd1d167a4d830",
   * //     "0x7815f56468915a08edb505fffa9d376ad21a9617",
   * //     "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   * //     "0x9ce4664e9d7346869797b7d9fc8c7a0212d5ff44",
   * //     "0xbdada4f58d17ce602cb0d2db2a55c3e4f47e397f",
   * //     "0xa923ac48439add7124763b3682f4505044c81ae3",
   * //     "0xf1d6ffc8a2276b7e0784973a1a07a26e75200edd",
   * //     "0x5e165460b15f02d84a67f81b29517671989d2492",
   * //     "0x8289e2141c10832e7c9b108317eae0dec2011c67",
   * //     "0xb019a99f0653973ddb2d983a26e0970587d08447",
   * //     "0x8289e2141c10832e7c9b108317eae0dec2011c67",
   * //     "0xa4ebf5bbb131179b69bbf33319257728cdada5cf",
   * //     "0x3dabf8331afbc553a1e458e37a6c9c819c452d55",
   * //     "0x5e165460b15f02d84a67f81b29517671989d2492",
   * //     "0xa4539e1bdffceb3557ffb81f87a92e2159f6d637",
   * //     "0x7815f56468915a08edb505fffa9d376ad21a9617",
   * //     "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   * //     "0xf90cc528e5f4811c8c1f1a69b990b9a58039f7cf",
   * //     "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   * //     "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   * //     "0x57dca45124e253bfa93d7571b43555a861c7455f",
   * //     "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547"
   * //   ],
   * //   "rpActivity":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   * //   "sltLeader":[],
   * //   "slBlocks":[],
   * //   "slActivity":0,
   * //   "slCtrlCount":0
   * //   }
   */
  getActivity(chainType: string, epochID: number, option?: any): Promise<any>;
  /**
   * Get the slot leader activity information of the specified epoch.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The slot leader activity information.
   * @example
   * const ret = await sdk.getEpochID("WAN");
   * console.log(ret);
   * // {
   * //   "sltLeader":
   * //   [
   * //     "0xdf24acd01f69d93ad440c8e9ccf5ac6a32d672d4",
   * //     "0x3628bf135f36c6e26a824ec9152885505f3fbc2a",
   * //     "0xeb55839c891286d4d5bb11737fca1136797eaf83",
   * //     "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   * //     "0xee1ad9c4f9d81f900221e95ee04246b6254b0c6f",
   * //     "0xcd54e0c35b122860d8fe2eb41f2e8e3e79c085ba",
   * //     "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   * //     "0x375369561dd38fd1a8c93cade745443558fff0bb",
   * //     "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce",
   * //     "0x57dca45124e253bfa93d7571b43555a861c7455f",
   * //     "0x2866bca06ff1d6afe52298f9fc759ea9b80f6902",
   * //     "0xbee03f252dfd38f4f8d10d0664fb50c36526a611",
   * //     "0x0081a626fecff225cd87d3f23c0dd47a9fe243ac",
   * //     "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "0x6273ce1f6f32e129f295f138d6e4ba6f0e19333e"
   * //   ],
   * //   "slBlocks": [336, 1085, 359, 671, 693, 366, 349, 53, 74, 70, 364, 347, 339, 337, 339],
   * //   "slActivity": 0.8467013888888889,
   * //   "slCtrlCount": 8849
   * //   }
   */
  getSlotActivity(chainType: string, epochID: number, option?: any): Promise<any>;
  /**
   * Get the validator activity information of the Epoch Leaders and Random Number Proposers of the specified epoch. Returns null for the current Epoch or future Epochs.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The validator activity information.
   * @example
   * const ret = await sdk.getValidatorActivity("WAN", 18102);
   * console.log(ret);
   * // {
   * //   "epLeader":
   * //   [
   * //     "0x880d861a8bb6909885bbc65f9fc255bbd11a5825",
   * //     "0xc7afae3c9e99af27fe3eaa10f6ec73cd2dbe003b",
   * //     "0x882c9c16c05496d7b5374840936aec1af2a16553",
   * //     "0x54945447375e25d03033099c540f0998dfa4152d",
   * //     "0x71d063d48ac747dd9ef455cc5a58272c04660983",
   * //     "0xd5551afd5c976a8eaac478f438f51aea4547eda9",
   * //     "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   * //     "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   * //     "0x73494477f3a099415348cd33e3d46a07f4052600",
   * //     "0x847437144ab96c6c499cdee9edc4d64032d06c86",
   * //     "0x0b80f69fcb2564479058e4d28592e095828d24aa",
   * //     "0x54945447375e25d03033099c540f0998dfa4152d",
   * //     "0x742d898d2ee28a338f03af79c47762a908281a6a",
   * //     "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   * //     "0x5c1f00ff943de649519ff1ff35ac5b4c62b90964",
   * //     "0x2a6e8c39d4e9f9152958649fc5dbdb9c68cfcb0b",
   * //     "0xc46b1935326ba2423a9f4bbabf97f74d47f37d59",
   * //     "0xbeb30b68160d845593f01aeb6ad9b6e3cc2e3277",
   * //     "0x3daddc5a590808694eb1b732636a70194ad3d98e",
   * //     "0x266ddcfdbe3ded75e0e511e6356bca052b221c6b",
   * //     "0xb9d6c1a6e52119026cb5d2a82457f5fd6bc7e0c9",
   * //     "0xb44a825eb3f0539f6593ea05740c9f2686973f3c",
   * //     "0xa4539e1bdffceb3557ffb81f87a92e2159f6d637",
   * //     "0xb64b60ba915bc16dc71ea59c9950c1538dcead9c"
   * //   ],
   * //   "epActivity":[0,1,0,1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,1,0,0],
   * //   "rpLeader":
   * //   [
   * //     "0xee1ad9c4f9d81f900221e95ee04246b6254b0c6f",
   * //     "0xaadb06ebb95f165155f12a38bdcb092ac66e0344",
   * //     "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   * //     "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   * //     "0xb44a825eb3f0539f6593ea05740c9f2686973f3c",
   * //     "0x3628bf135f36c6e26a824ec9152885505f3fbc2a",
   * //     "0x2866bca06ff1d6afe52298f9fc759ea9b80f6902",
   * //     "0x0b80f69fcb2564479058e4d28592e095828d24aa",
   * //     "0x46530055144fe9365eaae87ba623e2f91cd7eff2",
   * //     "0x36fad9acaf51a13527375b1ffc3d5a749153efdb",
   * //     "0xf8fff523fb1450942dd2cd2b29837eaec2c4c860",
   * //     "0x71d063d48ac747dd9ef455cc5a58272c04660983",
   * //     "0x1b7740df685f9d34773d5a2aba6ab3a2c1407f40",
   * //     "0xb58230a7923a6a1941016aa1682e212def899ed1",
   * //     "0x54945447375e25d03033099c540f0998dfa4152d",
   * //     "0x742d898d2ee28a338f03af79c47762a908281a6a",
   * //     "0x85bbe8f965b1719f7089ee9912e7c9b10fe0a999",
   * //     "0xbee03f252dfd38f4f8d10d0664fb50c36526a611",
   * //     "0x2f13896d55ea42b58578cd835064233f8e80a929",
   * //     "0xf543da34477455ccd0ce9b153baaf344cefd9413",
   * //     "0xef09644a88ace467475c2f333f7bb8ffc9427452",
   * //     "0x0adc1b8d04d3856b394c8a170fbaea68589c4de6",
   * //     "0xaadb06ebb95f165155f12a38bdcb092ac66e0344",
   * //     "0x38550ef70511ff71924c4b58220b54e65720384f",
   * //     "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce"
   * //   ],
   * //   "rpActivity":[1,1,1,1,0,1,1,1,1,0,1,0,0,1,0,0,1,1,0,0,0,0,1,1,1]
   * // }
   */
  getValidatorActivity(chainType: string, epochID: number, option?: any): Promise<any>;
  /**
   * Get the current highest stable block number (no rollback).
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The current highest stable block number.
   * @example
   * const ret = await sdk.getValidatorActivity("WAN", 18102);
   * console.log(ret);
   * // 4018017
   */
  getMaxStableBlkNumber(chainType: string, option?: any): Promise<number>;
  /**
   * Get the random number of the queried epochID and block number.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {number} blockNumber - The blockNumber you want to search. If blockNumber is -1, use the latest block.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current highest stable block number.
   * @example
   * const ret = await sdk.getRandom("WAN", 18102, -1);
   * console.log(ret);
   * // "0x3a4277627fa45c3bf691014d79c05da2427f8eb115a076b71af7690cdb3a0b5e"
   */
  getRandom(chainType: string, epochID: number, blockNumber: number, option?: any): Promise<string>;
  /**
   * Get the specified validator info by the validator address.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string} address - The validator address you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The specified validator info.
   * @example
   * const ret = await sdk.getValidatorInfo("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce");
   * console.log(ret);
   * // { "address": "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce", "amount": "5.01e+22", "feeRate": 1500 }
   */
  getValidatorInfo(chainType: string, address: string, option?: any): Promise<any>;
  /**
   * Get the specified validator staking info by the validator owner's address.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string} address - The validator owner address you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The specified validator staking info.
   * @example
   * const ret = await sdk.getValidatorStakeInfo("WAN", "0x086b4cfadfd9f232b068c2e8263d608baee85163");
   * console.log(ret);
   * // [
   * //   {
   * //     "partners": [],
   * //     "address": "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce",
   * //     "pubSec256": "0x04c5b937557d0f5f4d75831d746fc0197cba50c5a98cb901e941956240d45ea374c6ba5919bc3e57de69f9813f99f6658dc86433b6d1156298cbf2b7087429dcc1",
   * //     "pubBn256": "0x0effcb9cb449235ff25108e0d8968b24a52402f4c6a8c67e4c0c71ac2558369d1ccd2e2f5b90613ef05d0594b675a5b7326dce01304f3c0c0b35f5bdc4a7f930",
   * //     "amount": "0xa9bed2b4ed2de500000",
   * //     "votingPower": "0x2a4544f88e102dc6c00000",
   * //     "lockEpochs": 10,
   * //     "nextLockEpochs": 10,
   * //     "from": "0x086b4cfadfd9f232b068c2e8263d608baee85163",
   * //     "stakingEpoch": 18098,
   * //     "feeRate": 1500,
   * //     "clients":
   * //     [
   * //     {
   * //       "address": "0xf99a8bc18061812e09652f5855908e35d034154b",
   * //       "amount": "0x3635c9adc5dea00000",
   * //       "votingPower": "0xd42e876228795e400000",
   * //       "quitEpoch": 0
   * //     },
   * //     {
   * //       "address": "0xa078ecadd6011a0d8df127cb0be12b03f2db0599",
   * //       "amount": "0x3635c9adc5dea00000",
   * //       "votingPower": "0xd42e876228795e400000",
   * //       "quitEpoch": 0
   * //     },
   * //     {
   * //       "address": "0xa373c8e5cbbe161cebbaa5d44f991cd265dcf87d",
   * //       "amount": "0x431cb388cb7d980000",
   * //       "votingPower": "0x106ae56b56c7994f00000",
   * //       "quitEpoch": 0
   * //     },
   * //     {
   * //       "address": "0xe57fcb59c510354b414b2c982ae1ddc4b0f3d329",
   * //       "amount": "0x3635c9adc5dea00000",
   * //       "votingPower": "0xd42e876228795e400000",
   * //       "quitEpoch": 0
   * //     },
   * //     ... ...
   * //     ],
   * //     "maxFeeRate": 1500,
   * //     "feeRateChangedEpoch": 18098
   * //   }
   * // ]
   */
  getValidatorStakeInfo(chainType: string, address: string, option?: any): Promise<Array<any>>;
  /**
   * Get the specified validator's total incentives.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string|Array<string>} address - The validator address you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The specified validator's total incentives.
   * @example
   * const ret = await sdk.getValidatorTotalIncentive("WAN", "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce");
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0xda8fa1aee77709d37f59fb96afd4cf10ccaeb6ce",
   * //     "amount": "1.828058184231574257465e+21",
   * //     "minEpochId": 18080,
   * //     "epochCount": 21
   * //   }
   * // ]
   */
  getValidatorTotalIncentive(chainType: string, address: string, option?: any): Promise<Array<any>>;
  /**
   * Get the identified delegator's staking info.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string} address - The delegator address you want to query.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The identified delegator's staking info.
   * @example
   * const ret = await sdk.getDelegatorStakeInfo("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc");
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   * //     "amount": "0xa968163f0a57b400000",
   * //     "quitEpoch": 0
   * //   },
   * //   {
   * //     "address": "0xdfd7aa554653ca236c197ad746edc2954ca172df",
   * //     "amount": "0x3f870857a3e0e3800000",
   * //     "quitEpoch": 0
   * //   },
   * //   {
   * //     "address": "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   * //     "amount": "0xa968163f0a57b400000",
   * //     "quitEpoch": 0
   * //   },
   * //   {
   * //     "address": "0x93c8ea0326ef334bdc3011e74cd1a6d78ce0594d",
   * //     "amount": "0xa968163f0a57b400000",
   * //     "quitEpoch": 0
   * //   }
   * // ]
   */
  getDelegatorStakeInfo(chainType: string, address: string, option?: any): Promise<Array<any>>;
  /**
   * Get the identified delegator rewards over a specified range of epochs.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string} address - The delegator address you want to query.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The identified delegator rewards.
   * @example
   * const ret = await sdk.getDelegatorIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc");
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   * //     "amount": "0x3217e1b255185bf07",
   * //     "epochId": 18088
   * //   },
   * //   {
   * //     "address": "0x6fcfcd4719f110e77bef0633d31cc046616b4b34",
   * //     "amount": "0x19029a8c0503573f2",
   * //     "epochId": 18090
   * //   },
   * //   ... ...
   * // ]
   */
  getDelegatorIncentive(chainType: string, address: string, option?: any): Promise<Array<any>>;
  /**
   * Get the identified delegator's total incentives.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string} address - The delegator address you want to query.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>validatorAddress</code> - The validator's address you want to query.
   * <br>&nbsp;&nbsp;<code>from</code> - The number that starting epochID you want to query.
   * <br>&nbsp;&nbsp;<code>to</code> - The number that ending epochID you want to query.
   * @returns {Promise<Array<any>>} - The identified delegator's total incentives.
   * @example
   * const ret = await sdk.getDelegatorTotalIncentive("WAN", "0xa6de4408d9003ee992b5dc0e1bf27968e48727dc");
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "amount": "233401766511923724414",
   * //     "minEpochId": 18080,
   * //     "epochCount": 6
   * //   },
   * //   {
   * //     "address": "0x4bf9fd7308d0849a62c3a7dd71c5190e57c28756",
   * //     "amount": "516430866915939128625",
   * //     "minEpochId": 18088,
   * //     "epochCount": 12
   * //   },
   * //   ... ...
   * // ]
   */
  getDelegatorTotalIncentive(chainType: string, address: string, option?: any): Promise<Array<any>>;
  /**
   * Get the Epoch Leader and Random Number Proposer addresses and public key lists in the specified epoch.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The Epoch Leader and Random Number Proposer addresses and public key lists.
   * @example
   * const ret = await sdk.getLeaderGroupByEpochID("WAN", 18102);
   * console.log(ret);
   * // [
   * //   {
   * //     "pubBn256": "0x0342c5f001e6970037de3d9de692cb89284435df28e63657f88c8e99893be7960006f8cf93c699856ff8aeffcd64531ce0071cdf09a38d043b33bbbf4cd469ed",
   * //     "pubSec256": "0x046c0979fbcd38b7887076db6b08adbbaae45189ac4239d2c06749b634dbeaafdf2b229b6c4eda1ab6ede7e46cbd9ab3ac35df1ac2a6f650bac39fd8474d85524e",
   * //     "secAddr": "0x28c12c7b51860b9d5aec3a0ceb63c6e187c00aac",
   * //     "type": 0
   * //   },
   * //   {
   * //     "pubBn256": "0x093e87d8f1cf8d967be90fc841b73180e8185e480e5b1937c5bd0bf5b47288500598f33d4142bf226b2c8ddaf7358c3093423efdeb1b0a74bfba9d5749ecdf9c",
   * //     "pubSec256": "0x04dac7b023f0e9fb5be91b48e5d546b2f2eb91029705f6055c24b3c804a49cf83f7cd584a96346ca42a94a02456444b7df4e280d2726971bf267f8182341ff81b9",
   * //     "secAddr": "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "type": 0
   * //   },
   * //   {
   * //     "pubBn256": "0x00e0c4fae08f124f7a8fe82988a385d9723bea14c8a6e2996a684846ae8d0d4e27abedb7d2f7150bd42ba830e960774b873de74b1d91d7c5ea1ba349a849e575",
   * //     "pubSec256": "0x047aa28ac3bf36c51e7781984e2843bdb78bf7d78e3e3f2fe5522581e8f94725749d81b6f2dd3068a02f95b9dddb5e3a97f9c6e22edf5a78e25339c3c94aeb31f1",
   * //     "secAddr": "0x57dca45124e253bfa93d7571b43555a861c7455f",
   * //     "type": 1
   * //   },
   * //   {
   * //     "pubBn256": "0x2094589617397846c5125cf5922ba993643c401998ae8817d5005fe21245f4bc0fbb25158c54446757d2b03d89da10d7dfbbaa23afa38c6e87115dcebe2a8e4d",
   * //     "pubSec256": "0x04428597d2d6ab60894c592951337243424637c8b65cc0057215f481dcb78b3e96268365c9bac17bc32b6c08e2c135ca231f636653040f995e8d4e03f6d4b8d812",
   * //     "secAddr": "0x2c72d7a8c02752fcfafbaea5a63c53056cfaf547",
   * //     "type": 1
   * //   },
   * //   ... ...
   * // ]
   */
  getLeaderGroupByEpochID(chainType: string, epochID: number, option?: any): Promise<Array<any>>;
  /**
   * Get the current epoch info.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The current epoch info.
   * @example
   * const ret = await sdk.getCurrentEpochInfo("WAN");
   * console.log(ret);
   * // { "blockNumber": 3938057, "slotId": 5661, "epochId": 18102 }
   */
  getCurrentEpochInfo(chainType: string, option?: any): Promise<any>;
  /**
   * Returns an array with information on each of the current validators.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The information on each of the current validators.
   * @example
   * const ret = await sdk.getRandom("WAN", 18102, -1);
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0xa4626e2bb450204c4b34bcc7525e585e8f678c0d",
   * //     "pubSec256": "0x04b7bf8d3868333f70a30041423c7db204b80b9be2e585c344cf3f391cbf77b17fd14f3058d4475d546355bf8c2709ed9ecf5f0cee9d021c90988af0e8cf52001b",
   * //     "pubBn256": "0x289787688eb80c1e223375a71f8d17110d638a9143afa190dc11b3c1e64cf92b21feb02ab7a1dcb31892210dfda458aff890fe9e7508292099ae6256f197b325",
   * //     "amount": "0xa968163f0a57b400000",
   * //     "votingPower": "0x297116712be7b468800000",
   * //     "lockEpochs": 7,
   * //     "maxFeeRate": 1500,
   * //     "nextLockEpochs": 7,
   * //     "from": "0xdbb2d6199457d11288f0097659bcec24738e158f",
   * //     "stakingEpoch": 0,
   * //     "feeRate": 1500,
   * //     "feeRateChangedEpoch": 0,
   * //     "clients":
   * //     [
   * //       {
   * //         "address": "0xfcc3736dc29bf9af7556fcc1dea10b53edaab51d",
   * //         "amount": "0x56bc75e2d63100000",
   * //         "votingPower": "0x1537da569da5bca00000",
   * //         "quitEpoch": 18071
   * //       }
   * //     ],
   * //     "partners": []
   * //   },
   * //   ... ...
   * // ]
   */
  getCurrentStakerInfo(chainType: string, option?: any): Promise<Array<any>>;
  /**
   * Returns the total number of slots in an epoch. This is a constant.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The total number of slots in an epoch.
   * @example
   * const ret = await sdk.apiTest.getSlotCount("WAN");
   * console.log(ret);
   * // 17280
   */
  getSlotCount(chainType: string, option?: any): Promise<number>;
  /**
   * Get the time span of a slot in seconds.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The time span of a slot in seconds.
   * @example
   * const ret = await sdk.getSlotTime("WAN");
   * console.log(ret);
   * // 5
   */
  getSlotTime(chainType: string, option?: any): Promise<number>;
  /**
   * Returns the specified epoch's start time in UTC time seconds.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The specified epoch's start time in UTC time seconds.
   * @example
   * const ret = await sdk.getTimeByEpochID("WAN", 18108);
   * console.log(ret);
   * // 1564531200
   */
  getTimeByEpochID(chainType: string, epochID: number, option?: any): Promise<number>;
  /**
   * Calculates the Epoch ID according to the time. Enter the UTC time in seconds to get the corresponding Epoch ID.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} time - The UTC time seconds you want to query.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The current highest stable block number.
   * @example
   * const ret = await sdk.getEpochIDByTime("WAN", 1564550000);
   * console.log(ret);
   * // 18108
   */
  getEpochIDByTime(chainType: string, time: number, option?: any): Promise<number>;
  /**
   * Get records of registered validators information.
   * @since 1.1.0
   * @group Service
   * @param {string|Array<string>|number|undefined} [address] - The validator address you want to search.
   * @param {number|undefined} [after] - The timestamp after you want to search.
   * @returns {Promise<Array<any>>} - The records of registered validators information.
   * @example
   * const ret = await sdk.getRegisteredValidator();
   * console.log(ret);
   * // [
   * //   {
   * //     "address": "0x17d47c6ac4f72d43420f5e9533b526b2dee626a6",
   * //     "name": "MatPool",
   * //     "iconData": "iVBORw0KGgoAAAANSUhEUgAAAEwAAABQCAYAAACzg5PLAAAABGd ... ...",
   * //     "iconType": "png",
   * //     "url": "https://matpool.io/",
   * //     "updatedAt": 1563780889497
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredValidator(address?: string | Array<string> | number | undefined, after?: number | undefined): Promise<Array<any>>;
  /**
   * Get records of registered tokens information.
   * @since 1.1.0
   * @group Service
   * @param {string|Array<string>|undefined} [tokenOrigAccount] - The original token account of chain.
   * @param {number|undefined} [after] - The timestamp after you want to search.
   * @returns {Promise<Array<any>>} - The records of registered tokens information.
   * @example
   * const ret = await sdk.getRegisteredValidator();
   * console.log(ret);
   * // [
   * //   {
   * //     "tokenOrigAccount": "0x00f58d6d585f84b2d7267940cede30ce2fe6eae8",
   * //     "decimals": 18,
   * //     "deposit": "10000000000000000000",
   * //     "iconData": "/9j/4AAQSkZJ ... ...",
   * //     "iconType": "jpg",
   * //     "name": "Wanchain ZRX Crosschain Token",
   * //     "symbol": "ZRX",
   * //     "token2WanRatio": "20000",
   * //     "tokenWanAddr": "0x2a4359d8b84b270eb112b54273439ac538f32733",
   * //     "updatedAt": 1577155812722,
   * //     "withDrawDelayTime": "259200"
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredToken(tokenOrigAccount?: string, after?: number): Promise<Array<any>>;
  /**
   * Get records of registered Dapps information.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>chainType</code> - The chain type being queried. Currently supports <code>'WAN'</code>.
   * <br>&nbsp;&nbsp;<code>url</code> - The URL being queried.
   * <br>&nbsp;&nbsp;<code>language</code> - The supported language being queried.
   * <br>&nbsp;&nbsp;<code>name</code> - The name being fuzzy queried.
   * <br>&nbsp;&nbsp;<code>platform</code> - The supported platform being queried. Currently supports <code>'desktop'</code> and <code>'mobile'</code>.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>pageIndex</code> - The page index you want to search. If you want to query with the <code>pageIndex</code>, <code>page</code> is needed.
   * <br>&nbsp;&nbsp;<code>page</code> - The page size you want to search.
   * @returns {Promise<Array<any>>} - The records of registered Dapps information.
   * @example
   * const ret = await sdk.getRegisteredDapp({after:1577155812700, platform:["desktop"]});
   * console.log(ret);
   * // [
   * //   {
   * //     "langInfo": [
   * //     {
   * //       "language": "en",
   * //       "name": "WRDEX",
   * //       "summary": "A Crosschain Dex in wanchain.",
   * //       "detail": "A Crosschain Dex in wanchain."
   * //     }
   * //     ],
   * //     "platform":["desktop","mobile"],
   * //     "url": "https://exchange.wrdex.io",
   * //     "chainType": "wan",
   * //     "type": "Exchange",
   * //     "creator": "rivex.io",
   * //     "creatorWebsite": "https://wrdex.io",
   * //     "scAddress": [
   * //     "0x8786038ef9c2f659772c6c2ee8402bdfdc511bb8"
   * //     ],
   * //     "iconType": "jpg",
   * //     "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   * //     "updatedAt": 1586226464996
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredDapp(option?: any): Promise<Array<any>>;
  /**
   * Get records of registered advertisements information.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>name</code> - The advertisement name you want to search.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * @returns {Promise<Array<any>>} - The records of registered advertisements information.
   * @example
   * const ret = await sdk.getRegisteredAds();
   * console.log(ret);
   * // [
   * //   {
   * //     "name": "test",
   * //     "iconData": "iVBORw0KGgoAAAGG ... ...",
   * //     "iconType": "png",
   * //     "url": "https://test.io/",
   * //     "updatedAt": 1563780893497
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredAds(option?: any): Promise<Array<any>>;
  /**
   * Get records of registered coingecko information.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>symbol</code> - The array of coingecko symbol you want to search.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * @returns {Promise<Array<any>>} - The records of registered coingecko information.
   * @example
   * const ret = await sdk.getRegisteredCoinGecko({symbol:["wan"]});
   * console.log(ret);
   * // [
   * //    {
   * //     "id": "wanchain",
   * //     "symbol": "wan",
   * //     "name": "Wanchain",
   * //     "updatedAt": 1563780893497
   * //    },
   * //    ... ...
   * // ]
   */
  getRegisteredCoinGecko(option?: any): Promise<Array<any>>;
  /**
   * Returns the epoch ID and block number when the switch from POW to the POS protocol occurred.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - A reserved parameter
   * @returns {Promise<any>} - The POS info.
   * @example
   * const ret = await sdk.getPosInfo("WAN");
   * console.log(ret);
   * // { "firstBlockNumber": 3560000, "firstEpochId": 18078 }
   */
  getPosInfo(chainType: string, option?: any): Promise<any>;
  /**
   * Get the highest block number of the specified epoch ID(s).
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter
   * @returns {Promise<Array<any>>} - The the highest block number.
   * @example
   * const ret = await sdk.getMaxBlockNumber("WAN", [18102, 18101]);
   * console.log(ret);
   * // [ { "epochId": 18102, "blockNumber": 3938057, }, { "epochId": 18101, "blockNumber": 3933152, } ]
   */
  getMaxBlockNumber(chainType: string, epochID: number, option?: any): Promise<Array<any>>;
  /**
   * Get supplementary information for the specified validator.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string|Array<string>} address - The validator address you want to search.
   * @param {any} [option] - A reserved parameter
   * @returns {Promise<Array<any>>} - The supplementary information.
   * @example
   * const ret = await sdk.getValidatorSupStakeInfo("WAN", ["0x158bae682e6278a16d09d7c7311074585d38b54d","0x85dae7e5c7b433a1682c54eee63adf63d835d272"]);
   * console.log(ret);
   * // // [
   * //     {
   * //         "address": "0x158bae682e6278a16d09d7c7311074585d38b54d",
   * //         "stakeIn": 3778078,
   * //         "stakeInTimestamp": 1563134885
   * //     },
   * //     {
   * //         "address": "0x85dae7e5c7b433a1682c54eee63adf63d835d272",
   * //         "stakeIn": 3905210,
   * //         "stakeInTimestamp": 1563848135
   * //     }
   * // ]
   */
  getValidatorSupStakeInfo(chainType: string, address: string | Array<string>, option?: any): Promise<Array<any>>;
  /**
   * Get the specified delegator's supplementary information.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string|Array<string>} address - The delegator's address you want to query.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The supplementary information.
   * @example
   * const ret = await sdk.getDelegatorSupStakeInfo("WAN", ["0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0"]);
   * console.log(ret);
   * // // [
   * //   {
   * //     "address": "0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0",
   * //     "vAddress": "0x1a95e85e8ffcfd28eb61ee53a542dc98c57b337a",
   * //     "delegateIn": 3788629,
   * //     "delegateInTimestamp": 1563190930
   * //   },
   * //   {
   * //     "address": "0xc45089dfcf6308d80b377b0a6ffc8bd314273ce0",
   * //     "vAddress": "0x1e1e954883d02fba32fa1f7d0d6314156aa2a4e8",
   * //     "delegateIn": 3788635,
   * //     "delegateInTimestamp": 1563190970
   * //   },
   * //   ... ...
   * // ]
   */
  getDelegatorSupStakeInfo(chainType: string, address: string | Array<string>, option?: any): Promise<Array<any>>;
  /**
   * Get the block number which contains the incentives transactions for the specified epoch.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<number>} - The block number.
   * @example
   * const ret = await sdk.getEpochIncentiveBlockNumber("WAN", 18106);
   * console.log(ret);
   * // 4003788
   */
  getEpochIncentiveBlockNumber(chainType: string, epochID: number, option?: any): Promise<number>;
  /**
   * Get the record of stake out transactions for the specified epoch.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {number} epochID - The epochID you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The record of stake out infomation.
   * @example
   * const ret = await sdk.getEpochStakeOut("WAN", 18106);
   * console.log(ret);
   * // // [
   * //   {
   * //     "address": "0x74b7505ef4ee4a4783f446df8964b6cdd4c61843",
   * //     "amount": "0x8f1d5c1cae3740000"
   * //   },
   * //   ... ...
   * // ]
   */
  getEpochStakeOut(chainType: string, epochID: number, option?: any): Promise<Array<any>>;
  /**
   * Check whether the OTA address is used.
   * @since 1.1.0
   * @group Accounts
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {string} image - The OTA address.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<boolean>}
   * @example
   * const ret = await sdk.checkOTAUsed("WAN", "xxxxxxx");
   * console.log(ret);
   * // true
   */
  checkOTAUsed(chainType: string, image: string, option?: any): Promise<boolean>;
  /**
   * Fetch service API by the native http.
   * @since 1.1.0
   * @group Service
   * @param {string} srvType - The service type.
   * @param {string} funcName - The service URI.
   * @param {string} type - The http request method as string. Currently supports <code>'GET'</code> and <code>'POST'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The service infomation.
   * @example
   * const ret = await sdk.fetchService("bp", "getAddress", "POST", {});
   * console.log(ret);
   * // { "name": "test", "address":"0x3786038ef9c2f659772c6c2ee8402bdfdc511bb5" }
   */
  fetchService(srvType: string, funcName: string, type: string, option?: any): Promise<any>;
  /**
   * Fetch the special service API by the native http.
   * @since 1.1.0
   * @group Service
   * @param {string} url - The special service request url absolutely.
   * @param {string} type - The http request method as string. Currently supports <code>'GET'</code> and <code>'POST'</code>.
   * @param {any} [option] - The arguments passing to service API.
   * @returns {Promise<any>} - The service infomation.
   * @example
   * const ret = await sdk.fetchSpecialService("https://xxx.com:443/getAddress", "POST", {});
   * console.log(ret);
   * // { "name": "test", "address":"0x3786038ef9c2f659772c6c2ee8402bdfdc511bb5" }
   */
  fetchSpecialService(url: string, type: string, option?: any): Promise<any>;
  /**
   * Get records of registered tokens information of original chain.
   * @since 1.1.0
   * @group Service
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>tokenScAddr</code> - The token account of <code>'WAN'</code> chain.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>isEqual</code> - If you want to query with the <code>isEqual</code>, <code>after</code> is needed. The timestamp including <code>after</code> after you want to search.
   * <br>&nbsp;&nbsp;<code>limit</code> - The maximum token logo you want to search.
   * <br>&nbsp;&nbsp;<code>tokenTypes</code> - The multi token types logo you want to search. If <code>isAllTokenTypes</code> is <code>true</code>, using <code>isAllTokenTypes</code> first.
   * <br>&nbsp;&nbsp;<code>isAllTokenTypes</code> - Whether to get all token type logo you want to search.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>false</code> (the default) to return the default token logo.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>true</code> to return all token type logo.
   * @returns {Promise<Array<any>>} - The records of registered tokens information
   * @example
   * const ret = await sdk.getRegisteredOrigToken("WAN", {after:1577155812700});
   * console.log(ret);
   * // [
   * //   {
   * //     "tokenScAddr": "0xc6f4465a6a521124c8e3096b62575c157999d361",
   * //     "iconType": "jpg",
   * //     "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   * //     "updatedAt": 1589512354784
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredOrigToken(chainType: string, option?: any): Promise<Array<any>>;
  /**
   * Get records of registered token's logo of specified chain.
   * @since 1.1.0
   * @group Service
   * @param {string} chainType - The chain being queried. Currently supports <code>'WAN'</code>, default: <code>'WAN'</code>.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>tokenScAddr</code> - The token account of <code>'WAN'</code> chain.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>isEqual</code> - If you want to query with the <code>isEqual</code>, <code>after</code> is needed. The timestamp including <code>after</code> after you want to search.
   * <br>&nbsp;&nbsp;<code>limit</code> - The maximum token logo you want to search.
   * <br>&nbsp;&nbsp;<code>tokenTypes</code> - The multi token types logo you want to search. If <code>isAllTokenTypes</code> is true, using <code>isAllTokenTypes</code> first.
   * <br>&nbsp;&nbsp;<code>isAllTokenTypes</code> - Whether to get all token type logo you want to search.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>false</code> (the default) to return the default token logo.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>true</code> to return all token type logo.
   * @returns {Promise<Array<any>>} - The records of registered token's logo
   * @example
   * const ret = await sdk.getRegisteredTokenLogo("WAN", {after:1577155812700});
   * console.log(ret);
   * // [
   * //   {
   * //     "tokenScAddr": "0xc6f4465a6a521124c8e3096b62575c157999d361",
   * //     "iconType": "jpg",
   * //     "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   * //     "updatedAt": 1589512354784
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredTokenLogo(chainType: string, option?: any): Promise<Array<any>>;
  /**
   * Get records of registered chain logo.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>chainType</code> - The chainType you want to search.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>pageIndex</code> - The page index you want to search. If you want to query with the <code>pageIndex</code>, <code>page</code> is needed.
   * <br>&nbsp;&nbsp;<code>page</code> - The page size you want to search.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>false</code> (the default) to return the default token logo.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>true</code> to return all token type logo.
   * @returns {Promise<Array<any>>} The records of registered chain logo.
   * @example
   * const ret = await sdk.getRegisteredChainLogo({chainType:"WAN", after:1577155812700});
   * console.log(ret);
   * // [
   * //   {
   * //     "chainType": "WAN",
   * //     "iconType": "jpg",
   * //     "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   * //     "updatedAt": 1589512354784
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredChainLogo(option?: any): Promise<Array<any>>;
  /**
   * Get records of registered cross-chain token of multi-chain asset.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>chainType</code> - The chainType you want to search.
   * <br>&nbsp;&nbsp;<code>symbol</code> - The symbol you want to search.
   * @returns {Promise<Array<any>>} - The records of registered cross-chain token.
   * @example
   * const ret = await sdk.getRegisteredMultiChainOrigToken({chainType:"ETH"});
   * console.log(ret);
   * // [
   * //   {
   * //     "chainType":"ETH",
   * //     "updatedAt": :"USDT"
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredMultiChainOrigToken(option?: any): Promise<Array<any>>;
  /**
   * Get records of registered mapping tokens information of shadow chain.
   * @since 1.1.0
   * @group Service
   * @param {string} chainType - The chain being queried. Default: <code>'WAN'</code>.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>tokenScAddr</code> - The token account of <code>'WAN'</code> chain.
   * <br>&nbsp;&nbsp;<code>after</code> - The timestamp after you want to search.
   * <br>&nbsp;&nbsp;<code>pageIndex</code> - The page index you want to search. If you want to query with the <code>pageIndex</code>, <code>page</code> is needed.
   * <br>&nbsp;&nbsp;<code>page</code> - The page size you want to search.
   * @returns {Promise<Array<any>>} - The records of registered mapping tokens information.
   * @example
   * const ret = await sdk.getRegisteredMapToken("WAN", {after:1577155812700});
   * console.log(ret);
   * // [
   * //   {
   * //     "tokenScAddr": "0xc6f4465a6a521124c8e3096b62575c157999d361",
   * //     "iconType": "jpg",
   * //     "iconData": "/9j/4AAQSkZJRgABAQEBLAEsA ... ...",
   * //     "updatedAt": 1589512354784
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredMapToken(chainType: string, option?: any): Promise<Array<any>>;
  /**
   * Get records of registered subgraph info.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>chainType</code> - The chainType you want to search.
   * <br>&nbsp;&nbsp;<code>keywords</code> - The keywords you want to search.
   * @returns {Promise<Array<any>>} - The records of registered subgraph info.
   * @example
   * const ret = await sdk.getRegisteredSubgraph({chainType:"ETH", keywords:["0x..."]});
   * console.log(ret);
   * // [
   * //   {
   * //     "chainType":"ETH",
   * //     "keyword":"0x...",
   * //     "subgraph": "https://..."
   * //   },
   * //   ... ...
   * // ]
   */
  getRegisteredSubgraph(option?: any): Promise<Array<any>>;
  /**
   * Get records of registered token issuer info.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>chainType</code> - The chainType you want to search.
   * <br>&nbsp;&nbsp;<code>tokenScAddr</code> - The tokenScAddr you want to search.
   * @returns {Promise<Array<any>>} - The records of registered token issuer info.
   * @example
   * const ret = await sdk.getRegisteredTokenIssuer({chainType:"ETH", tokenScAddr:"0x0000000000000000000000000000000000000000"});
   * console.log(ret);
   * // [{"chainType":"ETH","isNativeCoin":true,"issuer":"Ethereum","tokenScAddr":"0x0000000000000000000000000000000000000000","tokenType":"erc20","updatedAt":1680000764477}]
   */
  getRegisteredTokenIssuer(option?: any): Promise<Array<any>>;
  /**
   * Get records of registered token list info.
   * @since 1.1.0
   * @group Service
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>chainType</code> - The chainType you want to search.
   * <br>&nbsp;&nbsp;<code>tags</code> - The array of tag you want to search.
   * <br>&nbsp;&nbsp;<code>tokenTypes</code> - The array of token type you want to search.
   * @returns {Promise<Array<any>>} - The records of registered token list info.
   * @example
   * const ret = await sdk.getRegisteredTokenList({chainType:"ETH", tags:["desktop"], tokenTypes:["erc20"]});
   * console.log(ret);
   * // [{"groupTag":"ETH","address":"0x0000000000000000000000000000000000000000","name":"ethereum","symbol":"ETH","decimals":"18","tokenType":"erc20","chainType":"ETH"},{"groupTag":"WAN","address":"0xdd22d37d976648071277306fbf4883cb21ea86c6","name":"WAN@ethereum","symbol":"WAN","decimals":"18","tokenType":"erc20","chainType":"ETH"},...]
   */
  getRegisteredTokenList(option?: any): Promise<Array<any>>;
  /**
   * Get all the active storemanGroups, include the info like the groupid, etc.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>chainIds</code> -  Array of chain IDs about the cross chain pair.
   * @returns {Promise<Array<any>>} - The storeman group active information.
   * @example
   * const ret = await sdk.getStoremanGroupList();
   * console.log(ret);
   * // [
   * //     {
   * //         "preGroupId": "0x0000000000000000000000000000000000000000000000000000000000000000",
   * //         "workStart": "1621497600",
   * //         "workDuration": "2678400",
   * //         "endRegisterTime": "1621490412",
   * //         "canStakeIn": false,
   * //         "groupId": "0x0000000000000000000000000000000000000000006465765f646f745f303031",
   * //         "status": "4",
   * //         "deposit": "40039999999999999996400",
   * //         "depositWeight": "60059999999999999994600",
   * //         "selectedCount": "4",
   * //         "memberCount": "6",
   * //         "whiteCount": "1",
   * //         "whiteCountAll": "11",
   * //         "startTime": "1621497600",
   * //         "endTime": "1624176000",
   * //         "registerTime": "1621397780",
   * //         "registerDuration": "92632",
   * //         "memberCountDesign": "4",
   * //         "threshold": "3",
   * //         "chain1": [
   * //             2153201998,
   * //             "WAN",
   * //             "Wanchain",
   * //             5718350
   * //         ],
   * //         "chain2": [
   * //             2147483708,
   * //             "ETH",
   * //             "Ethereum",
   * //             60
   * //         ],
   * //         "curve1": "1",
   * //         "curve2": "0",
   * //         "tickedCount": "0",
   * //         "minStakeIn": "10000000000000000000000",
   * //         "minDelegateIn": "100000000000000000000",
   * //         "minPartIn": "10000000000000000000000",
   * //         "crossIncoming": "0",
   * //         "gpk1": "0x",
   * //         "gpk2": "0x",
   * //         "delegateFee": "1000",
   * //         "algo1": "1",
   * //         "algo2": "0"
   * //     },
   * //     ... ...
   * // ]
   */
  getStoremanGroupList(option?: any): Promise<Array<any>>;
  /**
   * Get the storeman group active information.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} groupId - The storeman group ID.
   * @param {any} [option] - Optional.
   * <br>&nbsp;&nbsp;<code>fromEpoch</code> - The number that begin epochID you want to search.
   * <br>&nbsp;&nbsp;<code>toEpoch</code> - The number that end epochID you want to search.
   * @returns {Promise<any>} - The storeman group active information.
   * @example
   * const ret = await sdk.getStoremanGroupActivity("0x0000000000000000000000000000000000000000000031353937383131313430");
   * console.log(ret);
   * // {
   * //   "0": {
   * //     "wkAddr":"0x5793e629c061e7fd642ab6a1b4d552cec0e2d606",
   * //     "activity": "90"
   * //   },
   * //   ... ...
   * // }
   */
  getStoremanGroupActivity(groupId: string, option?: any): Promise<any>;
  /**
   * Get the storeman group quota information.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} chainType - The from chain being queried, default: <code>'WAN'</code>.
   * @param {string} groupId - The storeman group ID.
   * @param {Array<string>} symbol - The array of symbol being queried.
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>targetChainType</code> - The target chain being queried.
   * <br>&nbsp;&nbsp;<code>ignoreReservation</code> - Optional. Whether to ignore the reservation quota:
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>false</code> (the default) to return the quota that deducts the reserved amount.
   * <br>&nbsp;&nbsp;&nbsp;&nbsp;
   * Set to <code>true</code> to return the quota without deducting the reservation amount.
   * @returns {Promise<Array<any>>} - The storeman group quota information.
   * @example
   * const ret = await sdk.getStoremanInfo("0x13F5c27b1475a61A5fdEaF4e547D9611417c7375");
   * console.log(ret);
   * // [ { "symbol": "BTC", "minQuota": "2", "maxQuota": "3312485144" } ]
   */
  getStoremanGroupQuota(chainType: string, groupId: string, symbol: Array<string>, option: any): Promise<Array<any>>;
  /**
   * Get the detail info of one certain storemanGroup, include the info like the deposit, memberCount etc.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} groupId - The storeman group ID.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The detail info of one certain storemanGroup.
   * @example
   * const ret = await sdk.getStoremanGroupInfo("0x000000000000000000000000000000000000000000000000006465765f323631");
   * console.log(ret);
   * // {"groupId":"0x000000000000000000000000000000000000000000000000006465765f323631","status":"7","deposit":"1360409999999999999936800","depositWeight":"1506809999999999999905200","selectedCount":"29","memberCount":"29","whiteCount":"1","whiteCountAll":"10","startTime":"1764129600","endTime":"1764734400","registerTime":"1763957830","registerDuration":"779","memberCountDesign":"29","threshold":"21","chain1":"2153201998","chain2":"2147483708","curve1":"1","curve2":"0","tickedCount":"0","minStakeIn":"10000000000000000000000","minDelegateIn":"100000000000000000000","minPartIn":"10000000000000000000000","crossIncoming":"0","gpk1":"0x0bcf65cefe1f016f6578317be6ba72d37d4ff2b79430eec2ca35fd3413fa9ca420d50eedf68f78432982c09bd19043c41ccee1e018ffe5bd474ee535e110ab2f","gpk2":"0x1ac23caa6723194a943e257f294d14308d12055286a1ecb59fd46bcccb9ac56d9451ce3d5a17f3322ebb646f32b5e1823951615d8b32893b220eae27a3126022","delegateFee":"1000","algo1":"1","algo2":"0","gpk3":"0xacafdcc977e4672bf1252eb2d2ba96f8f97c6828c092b6b3dac17c7f2c991fdc4621506ce12f995a464405ad23f9a719cdc650be636ad60dd517a6dfaa7694dc","curve3":"0","algo3":"2"}
   */
  getStoremanGroupInfo(groupId: string, option?: any): Promise<any>;
  /**
   * Get the detail info of multi-storemanGroup, include the info like the deposit, memberCount etc.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {Array<string>} groupId - The Array of storeman group ID.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The detail info of multi-storemanGroup.
   * @example
   * const ret = await sdk.getMultiStoremanGroupInfo(["0x000000000000000000000000000000000000000000000000006465765f323631"]);
   * console.log(ret);
   * // [{"groupId":"0x000000000000000000000000000000000000000000000000006465765f323631","status":"7","deposit":"1360409999999999999936800","depositWeight":"1506809999999999999905200","selectedCount":"29","memberCount":"29","whiteCount":"1","whiteCountAll":"10","startTime":"1764129600","endTime":"1764734400","registerTime":"1763957830","registerDuration":"779","memberCountDesign":"29","threshold":"21","chain1":"2153201998","chain2":"2147483708","curve1":"1","curve2":"0","tickedCount":"0","minStakeIn":"10000000000000000000000","minDelegateIn":"100000000000000000000","minPartIn":"10000000000000000000000","crossIncoming":"0","gpk1":"0x0bcf65cefe1f016f6578317be6ba72d37d4ff2b79430eec2ca35fd3413fa9ca420d50eedf68f78432982c09bd19043c41ccee1e018ffe5bd474ee535e110ab2f","gpk2":"0x1ac23caa6723194a943e257f294d14308d12055286a1ecb59fd46bcccb9ac56d9451ce3d5a17f3322ebb646f32b5e1823951615d8b32893b220eae27a3126022","delegateFee":"1000","algo1":"1","algo2":"0","gpk3":"0xacafdcc977e4672bf1252eb2d2ba96f8f97c6828c092b6b3dac17c7f2c991fdc4621506ce12f995a464405ad23f9a719cdc650be636ad60dd517a6dfaa7694dc","curve3":"0","algo3":"2"}]
   */
  getMultiStoremanGroupInfo(groupId: Array<string>, option?: any): Promise<Array<any>>;
  /**
   * Get the detail config of one certain storemanGroup, include the info like the chain1/curve1/gpk1/chain2/curve2/gpk2, etc.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} groupId - The storeman group ID.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The detail config of one certain storemanGroup.
   * @example
   * const ret = await sdk.getStoremanGroupConfig("0x000000000000000000000000000000000000000000000000006465765f323631");
   * console.log(ret);
   * // {"groupId":"0x000000000000000000000000000000000000000000000000006465765f323631","status":"7","deposit":"1360409999999999999936800","chain1":"2153201998","chain2":"2147483708","curve1":"1","curve2":"0","gpk1":"0x0bcf65cefe1f016f6578317be6ba72d37d4ff2b79430eec2ca35fd3413fa9ca420d50eedf68f78432982c09bd19043c41ccee1e018ffe5bd474ee535e110ab2f","gpk2":"0x1ac23caa6723194a943e257f294d14308d12055286a1ecb59fd46bcccb9ac56d9451ce3d5a17f3322ebb646f32b5e1823951615d8b32893b220eae27a3126022","startTime":"1764129600","endTime":"1764734400"}
   */
  getStoremanGroupConfig(groupId: string, option?: any): Promise<any>;
  /**
   * Get the detail info of one certain storeman, include the info like the groupid, deposit, delegatorDeposit, incentive, etc.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} wkAddr - The storeman wkAddr being queried.
   * @param {any} [option] - A reserved parameter
   * @returns {Promise<any>} - The detail info of one certain storeman.
   * @example
   * const ret = await sdk.getStoremanInfo("0x13F5c27b1475a61A5fdEaF4e547D9611417c7375");
   * console.log(ret);
   * // {"sender":"0xAf840473fDd273fB1e3347F8e6e555cb8F2a240F","enodeID":"0x39c0251b5f6b8acf1458d14cb6a0c237fdc88460832c441b02b0fa3abb21dc7bbab2698e0800035bbf4e0c3c4c210f30ec400273a7ae985200bff2a7a8ad6972","PK":"0x20490b3a57ca48824c496307a5c8c8b23fed70b8304defd936200ff6d3efffa7bb8395ff73da3bdd4240f73d20c55e95dc0b3971595a652bb893fc7eca2eeb13","wkAddr":"0x13F5c27b1475a61A5fdEaF4e547D9611417c7375","isWhite":false,"quited":false,"delegatorCount":"2","delegateDeposit":"200000000000000000000","partnerCount":"0","partnerDeposit":"0","crossIncoming":"34482758620689655","slashedCount":"0","incentivedDelegator":"0","incentivedDay":"20531","groupId":"0x000000000000000000000000000000000000000000000000006465765f323737","nextGroupId":"0x0000000000000000000000000000000000000000000000000000000000000000","deposit":"10099999999999999998600","incentive":"3794897724406368827197","delegatorInCount":"1","delegateInDeposit":"100000000000000000000"}
   */
  getStoremanInfo(wkAddr: string, option?: any): Promise<any>;
  /**
   * Get the detail info of multi certain storeman, include the info like the groupid, deposit, delegatorDeposit, incentive, etc.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} wkAddr - The storeman wkAddr being queried.
   * @param {any} [option] - A reserved parameter
   * @returns {Promise<Array<any>>} - The detail info of multi certain storeman.
   * @example
   * const ret = await sdk.getMultiStoremanInfo(["0x13F5c27b1475a61A5fdEaF4e547D9611417c7375"]);
   * console.log(ret);
   * // [{"sender":"0xAf840473fDd273fB1e3347F8e6e555cb8F2a240F","enodeID":"0x39c0251b5f6b8acf1458d14cb6a0c237fdc88460832c441b02b0fa3abb21dc7bbab2698e0800035bbf4e0c3c4c210f30ec400273a7ae985200bff2a7a8ad6972","PK":"0x20490b3a57ca48824c496307a5c8c8b23fed70b8304defd936200ff6d3efffa7bb8395ff73da3bdd4240f73d20c55e95dc0b3971595a652bb893fc7eca2eeb13","wkAddr":"0x13F5c27b1475a61A5fdEaF4e547D9611417c7375","isWhite":false,"quited":false,"delegatorCount":"2","delegateDeposit":"200000000000000000000","partnerCount":"0","partnerDeposit":"0","crossIncoming":"34482758620689655","slashedCount":"0","incentivedDelegator":"0","incentivedDay":"20531","groupId":"0x000000000000000000000000000000000000000000000000006465765f323737","nextGroupId":"0x0000000000000000000000000000000000000000000000000000000000000000","deposit":"10099999999999999998600","incentive":"3794897724406368827197","delegatorInCount":"1","delegateInDeposit":"100000000000000000000"}]
   */
  getMultiStoremanInfo(wkAddr: Array<string>, option?: any): Promise<Array<any>>;
  /**
   * Get the conf info of one certain storeman, include the info about backupCount, standaloneWeight, delegatorDeposit and delegationMulti.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - A reserved parameter
   * @returns {Promise<any>} - The conf info.
   * @example
   * const ret = await sdk.getStoremanConf();
   * console.log(ret);
   * // {"backupCount":"9","standaloneWeight":"15000","delegationMulti":"10"}
   */
  getStoremanConf(option?: any): Promise<any>;
  /**
   * Get the storeman candidates info of one certain storeman group.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} groupId - The storeman group ID.
   * @param {any} [option] - A reserved parameter
   * @returns {Promise<Arr<any>>} - The storeman candidates info.
   * @example
   * const ret = await sdk.getStoremanCandidates("0x0000000000000000000000000000000000000000000000003133323936333039");
   * console.log(ret);
   * // [
   * //   {
   * //     "sender": "0x4Eb7Cb5411D13014A69EDc089AA75a6E1fd0Aa68",
   * //     "PK": "0xbe3b7fd88613dc272a36f4de570297f5f33b87c26de3060ad04e2ea697e13125a2454acd296e1879a7ddd0084d9e4e724fca9ef610b21420978476e2632a1782",
   * //     "wkAddr": "0x23DcbE0323605A7A00ce554baBCFF197bAF99B10",
   * //     "quited": false,
   * //     "deposit": "2000",
   * //     "delegateDeposit": "0",
   * //     "incentive": "0",
   * //     "delegatorCount": "0",
   * //     "groupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
   * //     "nextGroupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
   * //     "incentivedDay": "13319374",
   * //     "slashedCount": "0"
   * //   },
   * //   ... ...
   * // ]
   */
  getStoremanCandidates(groupId: string, option?: any): Promise<Array<any>>;
  /**
  * @ignore
  */
  getStoremanCandidatesV2(groupId: string, option?: any): Promise<Array<any>>;
  /**
   * Get the storeman member info of one certain storeman group.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} groupId - The storeman group ID being queried.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The storeman member info.
   * @example
   * const ret = await sdk.getStoremanGroupMember("0x0000000000000000000000000000000000000000000031353938353934383939");
   * console.log(ret);
   * // [
   * //   {
   * //     "isWhite": true,
   * //     "sender": "0x7F1d642DbfD62aD4A8fA9810eA619707d09825D0",
   * //     "PK": "0x25fa6a4190ddc87d9f9dd986726cafb901e15c21aafd2ed729efed1200c73de89f1657726631d29733f4565a97dc00200b772b4bc2f123a01e582e7e56b80cf8",
   * //     "wkAddr": "0x5793e629c061e7FD642ab6A1b4d552CeC0e2D606",
   * //     "quited": false,
   * //     "deposit": "2000",
   * //     "delegateDeposit": "0",
   * //     "incentive": "0",
   * //     "delegatorCount": "0",
   * //     "groupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
   * //     "nextGroupId": "0x0000000000000000000000000000000000000000000031353938353934383939",
   * //     "incentivedDay": "13319374",
   * //     "slashedCount": "0",
   * //     "name": "phorest.xyz",
   * //     "url": "https://phorest.xyz/wan",
   * //     "iconData": "...",
   * //     "iconType": "png"
   * //   },
   * //   ... ...
   * // ]
   */
  getStoremanGroupMember(groupId: string, option?: any): Promise<Array<any>>;
  /**
  * @ignore
  */
  getStoremanGroupMemberV2(groupId: string, option?: any): Promise<Array<any>>;
  /**
   * Get the stake info of certain storeman.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>address</code> - The array of storeman from address being queried.
   * <br>&nbsp;&nbsp;<code>wkAddr</code> - The string of storeman work address being queried.
   * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * @returns {Promise<Array<any>>} - The stake info.
   * @example
   * const ret = await sdk.getSupportedChainInfo();
   * console.log(ret);
   * // [{"enodeID":"0x39c0251b5f6b8acf1458d14cb6a0c237fdc88460832c441b02b0fa3abb21dc7bbab2698e0800035bbf4e0c3c4c210f30ec400273a7ae985200bff2a7a8ad6972","PK":"0x20490b3a57ca48824c496307a5c8c8b23fed70b8304defd936200ff6d3efffa7bb8395ff73da3bdd4240f73d20c55e95dc0b3971595a652bb893fc7eca2eeb13","wkAddr":"0x13F5c27b1475a61A5fdEaF4e547D9611417c7375","isWhite":false,"quited":false,"delegatorCount":"2","delegateDeposit":"100000000000000000000","partnerCount":"0","partnerDeposit":"0","crossIncoming":"34482758620689655","slashedCount":"0","incentivedDelegator":"0","incentivedDay":"20531","groupId":"0x000000000000000000000000000000000000000000000000006465765f323737","nextGroupId":"0x0000000000000000000000000000000000000000000000000000000000000000","deposit":"10099999999999999998600","incentive":"3794897724406368827197","canStakeOut":true,"canStakeClaim":false,"selectedCount":29,"rank":19,"activity":1,"from":"0xAf840473fDd273fB1e3347F8e6e555cb8F2a240F"}]
   */
  getStoremanStakeInfo(option?: any): Promise<Array<any>>;
  /**
   * Get the total incentive info of certain storeman stake.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>address</code> - Optional, the array of storeman from address being queried.
   * <br>&nbsp;&nbsp;<code>wkAddr</code> - Optional, the string of storeman work address being queried.
   * <br>&nbsp;&nbsp;<code>groupId</code> - Optional, the string of storeman group ID being queried.
   * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
   * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @returns {Promise<Array<any>>} - The total incentive info.
   * @example
   * const ret = await sdk.getStoremanStakeTotalIncentive({wkAddr: "0xe1e90b389ACB31c4C16aC5a2b5BBfFA927823c69"});
   * console.log(ret);
   * // [{"wkAddr":"0xe1e90b389ACB31c4C16aC5a2b5BBfFA927823c69","amount":"0","from":"0x0F02ac5D6015521b4fC33eE45Dce87870489781b","timestamp":1602319385},{"wkAddr":"0x2bbCf2f1F8F0BB3dC2E68dEcc292836E91f1BDF1","amount":"14444518831464769629339","from":"0x0F02ac5D6015521b4fC33eE45Dce87870489781b","timestamp":1650425785}]
   */
  getStoremanStakeTotalIncentive(option: any): Promise<Array<any>>;
  /**
   * Get the delegator info on certain storeman.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>address</code> - Optional, the array of delegator's address being queried.
   * <br>&nbsp;&nbsp;<code>wkAddr</code> - Optional, the array of storeman work address being queried.
   * @returns {Promise<Array<any>>} - The total incentive info.
   * @example
   * const ret = await sdk.getStoremanDelegatorInfo({wkAddr: ["0xef1Df88aB86Ce47baCB01ccB52818E87DdE08137"]});
   * console.log(ret);
   * // [{"from":"0x3Bc3048da78D305613482ef4199015d899bb4A01","wkAddr":"0xef1Df88aB86Ce47baCB01ccB52818E87DdE08137","deposit":"100000000000000000000","incentive":"2091483709531610240","groupId":"0x000000000000000000000000000000000000000000746573746e65745f303836","wkStake":{"deposit":"1889000000000000000000000","delegateDeposit":"136232000000000000000000","partnerDeposit":"10001000000000000000000"},"chain1":[2153201998,"WAN","Wanchain",5718350],"chain2":[2147483708,"ETH","Ethereum",60],"quited":true,"canDelegateOut":false,"canDelegateClaim":true}]
   */
  getStoremanDelegatorInfo(option: any): Promise<Array<any>>;
  /**
   * Get the delegator total incentive info.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>address</code> - The array of storeman from address being queried.
   * <br>&nbsp;&nbsp;<code>wkAddr</code> - The string of storeman work address being queried.
   * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default `0`.
   * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default `latest`.
   * @returns {Promise<Array<any>>} - The total incentive info.
   * @example
   * const ret = await sdk.getStoremanDelegatorTotalIncentive({"wkAddr":"0x5c770cbf582d770b93ca90adad7e6bd33fabc44c"});
   * console.log(ret);
   * // [
   * //   {
   * //     "wkAddr": "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c",
   * //     "amount": "2070283666843429698",
   * //     "from": "0x9930893f7c5febcd48b61dc8987e3e9fcc5ad0c9",
   * //     "timestamp": 1602323725
   * //   },
   * //   ... ...
   * // ]
   */
  getStoremanDelegatorTotalIncentive(option: any): Promise<Array<any>>;
  /**
   * Get the gpk slash info of certain storeman.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>wkAddr</code> - The array of storeman work address being queried.
   * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
   * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @returns {Promise<Array<any>>} - The gpk slash info.
   * @example
   * const ret = await sdk.getStoremanGpkSlashInfo({"wkAddr":["0x2EBE3b8D6019AFb1ee724F56081D91b803e8553f"]});
   * console.log(ret);
   * // [
   * //   {
   * //     "groupId": "0x000000000000000000000000000000000000000000000041726965735f303031",
   * //     "slashType": "1",
   * //     "slashed": "0x2ebe3b8d6019afb1ee724f56081d91b803e8553f",
   * //     "partner": "0x0000000000000000000000000000000000000000",
   * //     "round": "0",
   * //     "curveIndex": "0",
   * //     "timestamp": 1602904015
   * //   }
   * // ]
   */
  getStoremanGpkSlashInfo(option: any): Promise<Array<any>>;
  /**
   * Get the sign slash info of certain storeman.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>wkAddr</code> - The array of storeman work address being queried.
   * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * <br>&nbsp;&nbsp;<code>fromBlock</code> - Optional, the number of the earliest block (latest may be given to mean the most recent, block). By default 0.
   * <br>&nbsp;&nbsp;<code>toBlock</code> - Optional, the number of the latest block (latest may be given to mean the most recent, block). By default latest.
   * @returns {Promise<Array<any>>} - The sign slash info.
   * @example
   * const ret = await sdk.getStoremanSignSlashInfo({groupId:"0x000000000000000000000000000000000000000000746573746e65745f303032", "wkAddr":["0x5793e629c061e7fd642ab6a1b4d552cec0e2d606"]});
   * console.log(ret);
   * // [
   * //   {
   * //     "groupId": "0x000000000000000000000000000000000000000000000041726965735f303031",
   * //     "slashType": "1",
   * //     "slashed": "0x2ebe3b8d6019afb1ee724f56081d91b803e8553f",
   * //     "partner": "0x0000000000000000000000000000000000000000",
   * //     "round": "0",
   * //     "curveIndex": "0",
   * //     "timestamp": 1602904015
   * //   }
   * // ]
   */
  getStoremanSignSlashInfo(option: any): Promise<Array<any>>;
  /**
   * Get the info of all register tokenPairs, like fromChainID, toChainID, tokenAddress.
   * @since 1.1.0
   * @group TokensV2
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>chainIds</code> - Optional, the array of two chain IDs of cross chain pair.
   * <br>&nbsp;&nbsp;<code>tags</code> - Optional, the array of tag of cross chain pair, should be in [<code>"desktop"</code>, <code>"bridge"</code>, <code>"bridgeBeta"</code>].
   * <br>&nbsp;&nbsp;<code>isAllTokenPairs</code> - Optional, the boolean flag of cross chain pair, using true to return all token pairs, include not yet online token pairs.
   * @returns {Promise<Array<any>>} - The token pairs.
   * @example
   * const ret = await sdk.getSupportedChainInfo();
   * console.log(ret);
   * // [
   * //   {
   * //     "id": "1",
   * //     "ancestorChainID": "2147483708",
   * //     "fromChainID": "2147483708",
   * //     "toChainID": "2153201998",
   * //     "ancestorAccount": "0x0000000000000000000000000000000000000000",
   * //     "fromAccount": "0x0000000000000000000000000000000000000000",
   * //     "toAccount": "0x48344649b9611a891987b2db33faada3ac1d05ec",
   * //     "ancestorName": "ethereum",
   * //     "ancestorSymbol": "ETH",
   * //     "ancestorDecimals": "18",
   * //     "fromName": "ethereum",
   * //     "fromSymbol": "ETH",
   * //     "fromDecimals": "18",
   * //     "name": "wanETH@wanchain",
   * //     "symbol": "wanETH",
   * //     "decimals": "18",
   * //     "fromAccountType": "Erc20",
   * //     "toAccountType": "Erc20",
   * //     "fromAccountIsLayer2": false,
   * //     "toAccountIsLayer2": false
   * //   },
   * //   ... ...
   * // ]
   */
  getTokenPairs(option?: any): Promise<Array<any>>;
  /**
   * Get the info of tokenPair of certain tokenPairId, like fromChainID, toChainID, tokenAddress.
   * @since 1.1.0
   * @group TokensV2
   * @param {string} id - The ID of tokenPair being queried.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The token pair infomation.
   * @example
   * const ret = await sdk.getTokenPairInfo("1"));
   * console.log(ret);
   * // {
   * //   id: '1',
   * //   ancestorChainID: '2147483708',
   * //   fromChainID: '2147483708',
   * //   toChainID: '2153201998',
   * //   ancestorAccount: '0x0000000000000000000000000000000000000000',
   * //   fromAccount: '0x0000000000000000000000000000000000000000',
   * //   toAccount: '0x48344649b9611a891987b2db33faada3ac1d05ec',
   * //   ancestorName: 'ethereum',
   * //   ancestorSymbol: 'ETH',
   * //   ancestorDecimals: '18',
   * //   fromName: 'ethereum',
   * //   fromSymbol: 'ETH',
   * //   fromDecimals: '18',
   * //   name: 'wanETH@wanchain',
   * //   symbol: 'wanETH',
   * //   decimals: '18',
   * //   fromAccountType: 'Erc20',
   * //   toAccountType: 'Erc20'
   * // }
   */
  getTokenPairInfo(id: string, option?: any): Promise<any>;
  /**
   * Get the info of tokenPair Ancestor of certain tokenPairId, like symbol, decimals.
   * @since 1.1.0
   * @group TokensV2
   * @param {string} id - The ID of tokenPair being queried.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The info of tokenPair Ancestor.
   * @example
   * const ret = await sdk.getTokenPairAncestorInfo("1"));
   * console.log(ret);
   * // {
   * //   account: '0x0000000000000000000000000000000000000000',
   * //   name: 'ethereum',
   * //   symbol: 'ETH',
   * //   decimals: '18',
   * //   chainId: '2147483708'
   * // }
   */
  getTokenPairAncestorInfo(id: string, option?: any): Promise<any>;
  /**
   * Get all register tokenPairIDs.
   * @since 1.1.0
   * @group TokensV2
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>chainIds</code> - Optional, the array of two chain IDs of cross chain pair.
   * @returns {Promise<Array<string>>} - The token pairs.
   * @example
   * const ret = await sdk.getTokenPairIDs();
   * console.log(ret);
   * // [ '1',   '2',   '3', ... ]
   */
  getTokenPairIDs(option?: any): Promise<Array<string>>;
  /**
   * Get the chainInfo by the chain id which is used as hardened derivation in BIP44.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>chainId</code> - The chain id that you want to search, should like <code>"2153201998"</code>. Adding it to 2^31 to get the final hardened key index, 0x80000000 + 5718350(chain index) = 0x8057414e.
   * <br>&nbsp;&nbsp;<code>symbol</code> - The chain symbol that you want to search, should like <code>"WAN"</code>.
   * <br>&nbsp;&nbsp;<code>index</code> - The chain index that you want to search, should like <code>"5718350"</code>.
   * @returns {Promise<Array<string|number>>} - The chain infomation.
   * @example
   * const ret = await sdk.getChainConstantInfo({"chainId":"2153201998"});
   * console.log(ret);
   * // [
   * //   2153201998, // chain ID
   * //   "WAN", // chain symbol
   * //   "Wanchain", // chain name
   * //   "5718350" // chainIndex
   * // ]
   */
  getChainConstantInfo(option: any): Promise<Array<string | number>>;
  /**
   * Get the supported chain info.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The supported chain info.
   * @example
   * const ret = await sdk.getSupportedChainInfo();
   * console.log(ret);
   * // [
   * //   {
   * //     chainType: 'WAN',
   * //     chainID: '2153201998',
   * //     chainName: 'Wanchain',
   * //     chainSymbol: 'WAN',
   * //     chainDecimals: 18,
   * //     transChainID: '999',
   * //     crossScAddr: '0x62dE27e16f6f31d9Aa5B02F4599Fc6E21B339e79',
   * //     multicallAddr: '0xFe3359b5C97191c4E2543dC7aC675d8BD947dE57',
   * //     chainCoingeckoID: 'wanchain'
   * //   },
   * //   ... ...
   * // ]
   */
  getSupportedChainInfo(option?: any): Promise<Array<any>>;
  /**
   * Get incentive count of all store man during special epochs.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * <br>&nbsp;&nbsp;<code>fromEpoch</code> - Optional, the number of start epoch ID being queried.
   * <br>&nbsp;&nbsp;<code>toEpoch</code> - Optional, the number of end epoch ID being queried.
   * @returns {Promise<Array<string>>} - The incentive count.
   * @example
   * const ret = await sdk.getPrdInctMetric({groupId: "0x000000000000000000000000000000000000000000000000006465765f323736"});
   * console.log(ret);
   * // ["4","4","4", ... ]
   */
  getPrdInctMetric(option: any): Promise<Array<string>>;
  /**
   * Get the selected storeman information of the specified index, including wkAddr, PK, enodeId, etc.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * <br>&nbsp;&nbsp;<code>index</code> - The number of index being queried.
   * @returns {Promise<any>} - The selected storeman information.
   * @example
   * const ret = await sdk.getSelectedSmInfo({groupId: "0x000000000000000000000000000000000000000000000000006465765f323736", index: 0});
   * console.log(ret);
   * // {"wkAddr":"0x6f72Ca2ee51b765baEB744dc59734DE68134f7e9","PK":"0xcbadd190d961a8ec5b990cc1f2c1f6478cdc1f914aa3d85e86febc9ad8cd939183175e91a2b7fdf7db57ad6c877bf8d149f67a2a31638b35249d949c74157e85","enodeId":"0xcb715d7e634dc428beed2ecabf8bc9600cb32a7566866cfeb412b0caf80bfebd03712e75a788e6716f633eaa7defb3fa85079ca9b5573df45ede836c0b38ac8d"}
   */
  getSelectedSmInfo(option: any): Promise<any>;
  /**
   * Get all the selected storeman.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>groupId</code> - The string of storeman group ID being queried.
   * @returns {Promise<Array<string>>} - The array of all selected storeman information.
   * @example
   * const ret = await sdk.getSelectedStoreman({groupId: "0x000000000000000000000000000000000000000000000000006465765f323736"});
   * console.log(ret);
   * // [
   * //   "0x6f72Ca2ee51b765baEB744dc59734DE68134f7e9",
   * //   "0x832141a92c844827f051Dd0cF24c107e76270E54",
   * //   "0xeEA88f80391Ce67016B2aEd38090765c4DA9B6c8",
   * //   "0x12c91Cfbe155f3c57DCbE7ca6AFf09b42d9a216E",
   * //   "0x2fE3653Bc36f45BD3B87cd7C909826a475BD85ee",
   * //   "0x6E901535C85968e8feB951039726B621E9c14899",
   * //   "0xd2a5af5Fda3ba0297B414e13FAb2CFCC611B2f31",
   * //   "0xb99F93d84e10a4967C280F9455415E4E8003A651",
   * //   "0x12EAf2f63F10E00dDa98B26b83b7b5C4719EeF3b",
   * //   "0xc66cc0dEbC9c8dd77ACB05f28A554dbDe79dBA97",
   * //   "0xBF5220c0C8A3Aa8a8535bf680F309Cc9BBA99A86",
   * //   "0xB344B621E1c80c452eee7dCBDB1Ee6071Fe5b4eE",
   * //   "0xb8433591D0D89ba20D62628085fB12Bd177bA7b3",
   * //   "0x77E9AE721c6EfcB22470DB5B6C38d7a979b6F8e7",
   * //   "0xfcB86CAD65bab310A6Dc392626f70486Cbe03f11",
   * //   "0x4E58f4A04B0ee697732b0499B81463e69Cd80474",
   * //   "0xa0C597f71286979F3c246DEAC08e8Cd22Ae0FD6b",
   * //   "0x498A4890297E664DdEcE8296f7cFEA2ec6Db67E8",
   * //   "0x13F5c27b1475a61A5fdEaF4e547D9611417c7375",
   * //   "0x45b8A0A91C3D976AEA513A4dA60bF83B074E24a7",
   * //   "0xC54a5Af242190ff9e3363f0c56e3F40dA4E80720",
   * //   "0x1E83dB0a7D166C288Bc927256eDA7dEba2A06AdB",
   * //   "0xc0cD6e60989060e751Ccb4731AED277fC74877AB",
   * //   "0xc99bd9CB8FB583bE24dFc222fcd7BE755B6306eD",
   * //   "0x39eFB9820eb5792AFB9312d678380Ba92e7E91a4",
   * //   "0xB5A3C69758a5ecbDDa47062358481DF0Fff8a062",
   * //   "0x57FeE9e46D614Db0e6Ef92f84A43d42972B4099C",
   * //   "0xAF76F8d1eEdB8bE7588E601486b66b9933Fc1408",
   * //   "0x0ca7D37367898a2eb2a7B3bD0Bc1e95AA26779b6"
   * // ]
   */
  getSelectedStoreman(option: any): Promise<Array<string>>;
  /**
   * Get the information delegated to certain storeman.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>address</code> - Optional, the array of delegator's address being queried.
   * <br>&nbsp;&nbsp;<code>wkAddr</code> - The string of storeman work address being queried.
   * @returns {Promise<any>} - The information delegated to certain storeman.
   * @example
   * const ret = await sdk.getSmDelegatorInfo({address:"0x713668d2a4dfb3bb8265054615cfe83217c07d8b",wkAddr:"0x5a82fbfc7d85fed5e30387f1b3df7cc24e282591"});
   * console.log(ret);
   * // {"sender":"0x713668D2a4dfB3Bb8265054615cFe83217c07d8b","deposit":"0","incentive":"0","quited":false}
   */
  getSmDelegatorInfo(option: any): Promise<any>;
  /**
   * Get the reward ratio.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The reward ratio.
   * @example
   * const ret = await sdk.getRewardRatio();
   * console.log(ret);
   * // "0.1000"
   */
  getRewardRatio(option?: any): Promise<string>;
  /**
   * Get result of contract via multicall.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {Array<any>} calls - The array of call data.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The code at a specific address.
   * @example
   * const ret = await sdk.multiCall("XDC", [{"target":"0xd4b5f10d61916bd6e0860144a91ac658de8a1437","call":["symbol()(string)"],"returns":[["token_symbol"]]}]);
   * console.log(ret);
   * // {"results":{"blockNumber":{"_hex":"0x04c358f8"},"original":{"token_symbol":"USDT"},"transformed":{"token_symbol":"USDT"}},"keyToArgMap":{}}
   */
  multiCall(chainType: string, calls: Array<any>, option?: any): Promise<any>;
  /**
   * Get result of contract via multicall2.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {Array<any>} calls - The array of call data.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The code at a specific address.
   * @example
   * var targetInfo = [{
        address:"0xd4b5f10d61916bd6e0860144a91ac658de8a1437"
        ,funcName:"symbol"
        ,inputTypes:[]
        ,outputTypes:[{"internalType":"string","name":"symbol","type":"string"}]
        ,outputNames:[`token_symbol`]
        ,args:[]
    }]
   * const ret = await sdk.multiCall2("XDC", targetInfo);
   * console.log(ret);
   * // [{"result":[{"token_symbol":"USDT"}],"status":[true]}]
   */
  multiCall2(chainType: string, calls: Array<any>, option?: any): Promise<any>;
  /**
   * Get the code at a specific address.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other EVM chains.
   * @param {string} address - The account being queried.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The code at a specific address.
   * @example
   * const ret = await sdk.getCode("WAN", "0x5543C66182209CDB5d3763a25990781853461610");
   * console.log(ret);
   * // "0x608060..."
   */
  getCode(chainType: string, address: string, option?: any): Promise<string>;
  /**
   * Executes transaction network fee.
   * @since 1.1.0
   * @group PrivateTrans
   * @param {string} chainType - The chain being queried. Currently supports <code>'BTC'</code>.
   * @param {string} feeType - The type of fee that you want to search, should be <code>"lock"</code> or <code>"release"</code>.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>target</code> - The numeric of confirmation target in blocks (1 - 1008), use 1 as default.
   * <br>&nbsp;&nbsp;<code>mode</code> - The string of fee estimate mode, use "CONSERVATIVE" as default.
   * <br>&nbsp;&nbsp;<code>feeRate</code> - The numeric of estimate fee rate.
   * @returns {Promise<string|number>} - The network fee.
   * @example
   * const ret = await sdk.estimateNetworkFee("BTC", "lock", {feeRate: 34});
   * console.log(ret);
   * // "16864"
   */
  estimateNetworkFee(chainType: string, feeType: 'lock' | 'release', option?: any): Promise<string | number>;
  /**
   * Get the current latest ledger version.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried. Currently supports <code>"XRP"</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The current latest ledger version.
   * @example
   * const ret = await sdk.getLedgerVersion("XRP");
   * console.log(ret);
   * // 15905577
   */
  getLedgerVersion(chainType: string, option?: any): Promise<string | number>;
  /**
   * Get the ledger information about a ledger by ledger version or hash on certain chain.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried. Currently supports <code>"XRP"</code>.
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>ledgerHash</code> - Optional, the ledger hash you want to search.
   * <br>&nbsp;&nbsp;<code>ledgerVersion</code> - Optional, the ledger version you want to search.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search.
   * @returns {Promise<any>} - The ledger information.
   * @example
   * const ret = await sdk.getLedger("XRP", {ledgerHash: "8319E0F8538525840EBE2E709A48659BB2A4783C9996ECDE93DE2E387C6F5183"});
   * // const ret = await sdk.getLedger("XRP", {ledgerVersion: 15905577});
   * console.log(ret);
   * // {
   * //   "stateHash": "0A13E07F0C26450C5EED0F85531F0A62890488EA00459E1ADB19C7B7D41FF42B",
   * //   "closeTime": "2026-03-23T03:41:00.000Z",
   * //   "closeTimeResolution": 10,
   * //   "closeFlags": 0,
   * //   "ledgerHash": "8319E0F8538525840EBE2E709A48659BB2A4783C9996ECDE93DE2E387C6F5183",
   * //   "ledgerVersion": 15905577,
   * //   "parentLedgerHash": "3CF57BFA1831A125541AA26C8D2040D53906976549382D8A8B6A47CDBE91E85A",
   * //   "parentCloseTime": "2026-03-23T03:40:52.000Z",
   * //   "totalDrops": "99999908454544992",
   * //   "transactionHash": "C11B3DBC37B45FACF573F500CB09B1FA11A73DBFB223866A7780326633D08CC8",
   * //   "transactionHashes": [
   * //     "CA0CE976EABDA3C01F5F1963CB3D5539678A8F47C709C4093198C18A9E550DC3",
   * //     "DB37AAC914910BC00B2AF2DF810FD7477012A0B1960F9D71A66F3811D56CEBA9"
   * //   ]
   * // }
   */
  getLedger(chainType: string, option: any): Promise<any>;
  /**
   * Get server information.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried. Currently supports <code>"XRP"</code>.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search.
   * @returns {Promise<any>} - The server information.
   * @example
   * const ret = await sdk.getServerInfo('XRP', {version: 'v2'});
   * console.log(ret);
   * // {
   * //   "build_version": "3.1.2",
   * //   "complete_ledgers": "13073099-15905720",
   * //   "hostid": "MUFF",
   * //   "initial_sync_duration_us": "179168513",
   * //   "io_latency_ms": 1,
   * //   "jq_trans_overflow": "0",
   * //   "last_close": {
   * //     "converge_time_s": 2,
   * //     "proposers": 6
   * //   },
   * //   "load_factor": 1,
   * //   "network_id": 1,
   * //   "peer_disconnects": "80474",
   * //   "peer_disconnects_resources": "1590",
   * //   "peers": 108,
   * //   "ports": [
   * //     {
   * //       "port": "2459",
   * //       "protocol": [
   * //         "peer"
   * //       ]
   * //     },
   * //     {
   * //       "port": "50051",
   * //       "protocol": [
   * //         "grpc"
   * //       ]
   * //     }
   * //   ],
   * //   "pubkey_node": "n94fvDin1mzPPqyK6cm6DWKpvYzVavSwvCRijCWwYiKkmaADHNED",
   * //   "server_state": "full",
   * //   "server_state_duration_us": "873761238759",
   * //   "state_accounting": {
   * //     "connected": {
   * //       "duration_us": "172084963",
   * //       "transitions": "2"
   * //     },
   * //     "disconnected": {
   * //       "duration_us": "1079076",
   * //       "transitions": "2"
   * //     },
   * //     "full": {
   * //       "duration_us": "873761238759",
   * //       "transitions": "1"
   * //     },
   * //     "syncing": {
   * //       "duration_us": "6004467",
   * //       "transitions": "1"
   * //     },
   * //     "tracking": {
   * //       "duration_us": "5",
   * //       "transitions": "1"
   * //     }
   * //   },
   * //   "time": "2026-Mar-23 03:48:31.951954 UTC",
   * //   "uptime": 873940,
   * //   "validated_ledger": {
   * //     "age": 1,
   * //     "base_fee_xrp": 0.00001,
   * //     "hash": "2DFE71CED41F59BADF266335EB50D06B00739E91A2E0B9F65D3FBEBE81F05CEE",
   * //     "reserve_base_xrp": 1,
   * //     "reserve_inc_xrp": 0.2,
   * //     "seq": 15905720
   * //   },
   * //   "validation_quorum": 5
   * // }
   */
  getServerInfo(chainType: string, option?: any): Promise<any>;
  /**
   * Get cross chain fees.
   * @since 1.1.0
   * @group CrossChain
   * @deprecated Use {@link estimateCrossChainNetworkFee} instead.
   * @param {string} chainType - The chain being queried. Currently supports <code>"XRP"</code>.
   * @param {[number|string, number|string]} chainIds - Array of chain pair IDs about cross chain.
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>tokenPairID</code> - The ID of token pair you want to search.
   * <br>&nbsp;&nbsp;<code>version</code> - The result format version you want to search.
   * @returns {Promise<any>} - The cross chain fees.
   * @example
   * const ret = await sdk.getCrossChainFees("WAN", ["2153201998", "2147483708"], {tokenPairID:"1", version: "v2"});
   * console.log(ret);
   * // {"contractFee":"8583910607716746438","agentFee":"0"}
   */
  getCrossChainFees(chainType: string, chainIds: [number | string, number | string], option: any): Promise<any>;
  /**
   * Get minimum cross-chain amount.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} crossChain - The destination chainType that you want to search.
   * @param {string} symbol - The symbol that you want to search.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The minimum cross-chain amount.
   * @example
   * const ret = await sdk.getMinCrossChainAmount("ETH", ["BTC"]);
   * console.log(ret);
   * // {"BTC":"100"}
   */
  getMinCrossChainAmount(crossChain: string, symbol: string, option?: any): Promise<any>;
  /**
   * Get cross chain operation fee.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} targetChainType - The target chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>tokenPairID</code> - The ID of token pair you want to search.
   * <br>&nbsp;&nbsp;<code>address</code> - The array of address being queried.
   * <br>&nbsp;&nbsp;<code>bridge</code> - The supported third-party bridge. Currently supports 'CCTPV1' and 'CCTPV2'.
   * <br>&nbsp;&nbsp;<code>includeAtaCreation</code> - Include rent fee for creating Associated Token Account on Solana or not.
   * @returns {Promise<any>} - The operation fee.
   * @example
   * const ret = await sdk.estimateCrossChainOperationFee("ARETH", "OETH", {bridge: "CCTPV2", tokenPairID: "...", address:["0x1...","0x2..."]}));
   * console.log(ret);
   * // { value: '0.00013', isPercent: true, forwardFee: '200828', discountPercent: '1' }
   */
  estimateCrossChainOperationFee(chainType: string, targetChainType: string, option: any): Promise<any>;
  /**
   * Get cross chain network fee.
   * @since 1.1.0
   * @group CrossChain
   * @param {string} chainType - The chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {string} targetChainType - The target chain being queried, should be <code>"ETH"</code>,  <code>"WAN"</code>, and other chains.
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>tokenPairID</code> - The ID of token pair you want to search.
   * <br>&nbsp;&nbsp;<code>address</code> - Optional, the array of address being queried.
   * <br>&nbsp;&nbsp;<code>bridge</code> - Optional, the supported third-party bridge. Currently supports 'CCTPV1' and 'CCTPV2'.
   * @returns {Promise<any>} - The network fee.
   * @example
   * const ret = await sdk.estimateCrossChainNetworkFee("ARETH", "OETH", {bridge: "CCTPV2", tokenPairID: "...", address:["0x1...","0x2..."]});
   * console.log(ret);
   * // { value: '69074274557747', isPercent: false, discountPercent: '1' }
   */
  estimateCrossChainNetworkFee(chainType: string, targetChainType: string, option: any): Promise<any>;
  /**
   * Get the latest block information on certain chain.
   * @since 1.1.0
   * @group Blocks
   * @param {string} chainType - The chain being queried, should be <code>"ADA"</code>,  and other chains.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<any>} - The latest block information.
   * @example
   * const ret = await sdk.getLatestBlock("ADA");
   * console.log(ret);
   * // {
   * //   "time": 1641956199,
   * //   "height": 3230335,
   * //   "hash": "8c5789337cdd540fed8fc57f07d93740100af974f471a58ccb446c0fa76a8d56",
   * //   "slot": 47586983,
   * //   "epoch": 180,
   * //   "epoch_slot": 196583,
   * //   "slot_leader": "pool10k7t5kp6etvj95ma0q3c8tugx05dlfwly3lcdfgke4gjkhdx0ej",
   * //   "size": 16699,
   * //   "tx_count": 7,
   * //   "output": "38941298302128",
   * //   "fees": "2110816",
   * //   "block_vrf": "vrf_vk1yl2d9rfaeht0m9l8x0y9a3j9rapepz04yr4jlxrr2aw2ulpsyahs5mv4cx",
   * //   "previous_block": "f0b44052ff43386d10b8e81303961a96f8bd79e2362842619700d536964cf5d4",
   * //   "next_block": null,
   * //   "confirmations": 0
   * // }
   */
  getLatestBlock(chainType: string, option?: any): Promise<any>;
  /**
   * Get epoch parameters about a epoch by block ID on certain chain.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>"ADA"</code>.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>epochID</code> - The ID of epoch you want to search.
   * @returns {Promise<any>} - The epoch parameters.
   * @example
   * const ret = await sdk.getEpochParameters("ADA", {"epochID":180});
   * console.log(ret);
   * // {
   * //   "min_fee_a": "44",
   * //   "min_fee_b": "155381",
   * //   "min_utxo": "1000000",
   * //   "coins_per_utxo_word": "8620",
   * //   "coins_per_utxo_byte": "4310",
   * //   "price_mem": "\"577/10000\"",
   * //   "price_step": "\"721/10000000\"",
   * //   "collateral_percent": "150",
   * //   "max_collateral_inputs": "3",
   * //   "pool_deposit": "500000000",
   * //   "key_deposit": "2000000",
   * //   "max_tx_size": "16384",
   * //   "max_val_size": "5000",
   * //   "min_fee_ref_script_cost_per_byte": "15",
   * //   "minFeeRefScriptCostPerByte": "15"
   * // }
   */
  getEpochParameters(chainType: string, option?: any): Promise<any>;
  /**
   * Get epoch mofrl parameters about a epoch by block ID on certain chain.
   * @since 1.1.0
   * @group POS
   * @param {string} chainType - The chain being queried. Currently supports <code>"ADA"</code>.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>epochID</code> - The ID of epoch you want to search.
   * @returns {Promise<any>} - The epoch mofrl parameters.
   * @example
   * const ret = await sdk.getCostModelParameters("ADA", {"epochID":180});
   * console.log(ret);
   * // {"minFeeCoefficient":44,"minFeeConstant":155381,"maxBlockBodySize":90112,"maxBlockHeaderSize":1100,"maxTxSize":16384,"stakeKeyDeposit":2000000,"poolDeposit":500000000,"poolRetirementEpochBound":18,"desiredNumberOfPools":500,"poolInfluence":"3/10","monetaryExpansion":"3/1000","treasuryExpansion":"1/5","protocolVersion":{"major":10,"minor":0},"minPoolCost":170000000,"coinsPerUtxoByte":4310,"prices":{"memory":"577/10000","steps":"721/10000000"},"maxExecutionUnitsPerTransaction":{"memory":16500000,"steps":10000000000},"maxExecutionUnitsPerBlock":{"memory":72000000,"steps":20000000000},"maxValueSize":5000,"collateralPercentage":150,"maxCollateralInputs":3,"range":25600,"minFeeRefScriptCostPerByte":15,"base":15,"multiplier":1.2,"costModels":{"PlutusV1":{"addInteger-cpu-arguments-intercept":100788,"addInteger-cpu-arguments-slope":420,"addInteger-memory-arguments-intercept":1,"addInteger-memory-arguments-slope":1,"appendByteString-cpu-arguments-intercept":1000,"appendByteString-cpu-arguments-slope":173,"appendByteString-memory-arguments-intercept":0,"appendByteString-memory-arguments-slope":1,"appendString-cpu-arguments-intercept":1000,"appendString-cpu-arguments-slope":59957,"appendString-memory-arguments-intercept":4,"appendString-memory-arguments-slope":1,"bData-cpu-arguments":11183,"bData-memory-arguments":32,"blake2b_256-cpu-arguments-intercept":201305,"blake2b_256-cpu-arguments-slope":8356,"blake2b_256-memory-arguments":4,"cekApplyCost-exBudgetCPU":16000,"cekApplyCost-exBudgetMemory":100,"cekBuiltinCost-exBudgetCPU":16000,"cekBuiltinCost-exBudgetMemory":100,"cekConstCost-exBudgetCPU":16000,"cekConstCost-exBudgetMemory":100,"cekDelayCost-exBudgetCPU":16000,"cekDelayCost-exBudgetMemory":100,"cekForceCost-exBudgetCPU":16000,"cekForceCost-exBudgetMemory":100,"cekLamCost-exBudgetCPU":16000,"cekLamCost-exBudgetMemory":100,"cekStartupCost-exBudgetCPU":100,"cekStartupCost-exBudgetMemory":100,"cekVarCost-exBudgetCPU":16000,"cekVarCost-exBudgetMemory":100,"chooseData-cpu-arguments":94375,"chooseData-memory-arguments":32,"chooseList-cpu-arguments":132994,"chooseList-memory-arguments":32,"chooseUnit-cpu-arguments":61462,"chooseUnit-memory-arguments":4,"consByteString-cpu-arguments-intercept":72010,"consByteString-cpu-arguments-slope":178,"consByteString-memory-arguments-intercept":0,"consByteString-memory-arguments-slope":1,"constrData-cpu-arguments":22151,"constrData-memory-arguments":32,"decodeUtf8-cpu-arguments-intercept":91189,"decodeUtf8-cpu-arguments-slope":769,"decodeUtf8-memory-arguments-intercept":4,"decodeUtf8-memory-arguments-slope":2,"divideInteger-cpu-arguments-constant":85848,"divideInteger-cpu-arguments-model-arguments-intercept":228465,"divideInteger-cpu-arguments-model-arguments-slope":122,"divideInteger-memory-arguments-intercept":0,"divideInteger-memory-arguments-minimum":1,"divideInteger-memory-arguments-slope":1,"encodeUtf8-cpu-arguments-intercept":1000,"encodeUtf8-cpu-arguments-slope":42921,"encodeUtf8-memory-arguments-intercept":4,"encodeUtf8-memory-arguments-slope":2,"equalsByteString-cpu-arguments-constant":24548,"equalsByteString-cpu-arguments-intercept":29498,"equalsByteString-cpu-arguments-slope":38,"equalsByteString-memory-arguments":1,"equalsData-cpu-arguments-intercept":898148,"equalsData-cpu-arguments-slope":27279,"equalsData-memory-arguments":1,"equalsInteger-cpu-arguments-intercept":51775,"equalsInteger-cpu-arguments-slope":558,"equalsInteger-memory-arguments":1,"equalsString-cpu-arguments-constant":39184,"equalsString-cpu-arguments-intercept":1000,"equalsString-cpu-arguments-slope":60594,"equalsString-memory-arguments":1,"fstPair-cpu-arguments":141895,"fstPair-memory-arguments":32,"headList-cpu-arguments":83150,"headList-memory-arguments":32,"iData-cpu-arguments":15299,"iData-memory-arguments":32,"ifThenElse-cpu-arguments":76049,"ifThenElse-memory-arguments":1,"indexByteString-cpu-arguments":13169,"indexByteString-memory-arguments":4,"lengthOfByteString-cpu-arguments":22100,"lengthOfByteString-memory-arguments":10,"lessThanByteString-cpu-arguments-intercept":28999,"lessThanByteString-cpu-arguments-slope":74,"lessThanByteString-memory-arguments":1,"lessThanEqualsByteString-cpu-arguments-intercept":28999,"lessThanEqualsByteString-cpu-arguments-slope":74,"lessThanEqualsByteString-memory-arguments":1,"lessThanEqualsInteger-cpu-arguments-intercept":43285,"lessThanEqualsInteger-cpu-arguments-slope":552,"lessThanEqualsInteger-memory-arguments":1,"lessThanInteger-cpu-arguments-intercept":44749,"lessThanInteger-cpu-arguments-slope":541,"lessThanInteger-memory-arguments":1,"listData-cpu-arguments":33852,"listData-memory-arguments":32,"mapData-cpu-arguments":68246,"mapData-memory-arguments":32,"mkCons-cpu-arguments":72362,"mkCons-memory-arguments":32,"mkNilData-cpu-arguments":7243,"mkNilData-memory-arguments":32,"mkNilPairData-cpu-arguments":7391,"mkNilPairData-memory-arguments":32,"mkPairData-cpu-arguments":11546,"mkPairData-memory-arguments":32,"modInteger-cpu-arguments-constant":85848,"modInteger-cpu-arguments-model-arguments-intercept":228465,"modInteger-cpu-arguments-model-arguments-slope":122,"modInteger-memory-arguments-intercept":0,"modInteger-memory-arguments-minimum":1,"modInteger-memory-arguments-slope":1,"multiplyInteger-cpu-arguments-intercept":90434,"multiplyInteger-cpu-arguments-slope":519,"multiplyInteger-memory-arguments-intercept":0,"multiplyInteger-memory-arguments-slope":1,"nullList-cpu-arguments":74433,"nullList-memory-arguments":32,"quotientInteger-cpu-arguments-constant":85848,"quotientInteger-cpu-arguments-model-arguments-intercept":228465,"quotientInteger-cpu-arguments-model-arguments-slope":122,"quotientInteger-memory-arguments-intercept":0,"quotientInteger-memory-arguments-minimum":1,"quotientInteger-memory-arguments-slope":1,"remainderInteger-cpu-arguments-constant":85848,"remainderInteger-cpu-arguments-model-arguments-intercept":228465,"remainderInteger-cpu-arguments-model-arguments-slope":122,"remainderInteger-memory-arguments-intercept":0,"remainderInteger-memory-arguments-minimum":1,"remainderInteger-memory-arguments-slope":1,"sha2_256-cpu-arguments-intercept":270652,"sha2_256-cpu-arguments-slope":22588,"sha2_256-memory-arguments":4,"sha3_256-cpu-arguments-intercept":1457325,"sha3_256-cpu-arguments-slope":64566,"sha3_256-memory-arguments":4,"sliceByteString-cpu-arguments-intercept":20467,"sliceByteString-cpu-arguments-slope":1,"sliceByteString-memory-arguments-intercept":4,"sliceByteString-memory-arguments-slope":0,"sndPair-cpu-arguments":141992,"sndPair-memory-arguments":32,"subtractInteger-cpu-arguments-intercept":100788,"subtractInteger-cpu-arguments-slope":420,"subtractInteger-memory-arguments-intercept":1,"subtractInteger-memory-arguments-slope":1,"tailList-cpu-arguments":81663,"tailList-memory-arguments":32,"trace-cpu-arguments":59498,"trace-memory-arguments":32,"unBData-cpu-arguments":20142,"unBData-memory-arguments":32,"unConstrData-cpu-arguments":24588,"unConstrData-memory-arguments":32,"unIData-cpu-arguments":20744,"unIData-memory-arguments":32,"unListData-cpu-arguments":25933,"unListData-memory-arguments":32,"unMapData-cpu-arguments":24623,"unMapData-memory-arguments":32,"verifyEd25519Signature-cpu-arguments-intercept":53384111,"verifyEd25519Signature-cpu-arguments-slope":14333,"verifyEd25519Signature-memory-arguments":10},"PlutusV2":{"addInteger-cpu-arguments-intercept":100788,"addInteger-cpu-arguments-slope":420,"addInteger-memory-arguments-intercept":1,"addInteger-memory-arguments-slope":1,"appendByteString-cpu-arguments-intercept":1000,"appendByteString-cpu-arguments-slope":173,"appendByteString-memory-arguments-intercept":0,"appendByteString-memory-arguments-slope":1,"appendString-cpu-arguments-intercept":1000,"appendString-cpu-arguments-slope":59957,"appendString-memory-arguments-intercept":4,"appendString-memory-arguments-slope":1,"bData-cpu-arguments":11183,"bData-memory-arguments":32,"blake2b_256-cpu-arguments-intercept":201305,"blake2b_256-cpu-arguments-slope":8356,"blake2b_256-memory-arguments":4,"cekApplyCost-exBudgetCPU":16000,"cekApplyCost-exBudgetMemory":100,"cekBuiltinCost-exBudgetCPU":16000,"cekBuiltinCost-exBudgetMemory":100,"cekConstCost-exBudgetCPU":16000,"cekConstCost-exBudgetMemory":100,"cekDelayCost-exBudgetCPU":16000,"cekDelayCost-exBudgetMemory":100,"cekForceCost-exBudgetCPU":16000,"cekForceCost-exBudgetMemory":100,"cekLamCost-exBudgetCPU":16000,"cekLamCost-exBudgetMemory":100,"cekStartupCost-exBudgetCPU":100,"cekStartupCost-exBudgetMemory":100,"cekVarCost-exBudgetCPU":16000,"cekVarCost-exBudgetMemory":100,"chooseData-cpu-arguments":94375,"chooseData-memory-arguments":32,"chooseList-cpu-arguments":132994,"chooseList-memory-arguments":32,"chooseUnit-cpu-arguments":61462,"chooseUnit-memory-arguments":4,"consByteString-cpu-arguments-intercept":72010,"consByteString-cpu-arguments-slope":178,"consByteString-memory-arguments-intercept":0,"consByteString-memory-arguments-slope":1,"constrData-cpu-arguments":22151,"constrData-memory-arguments":32,"decodeUtf8-cpu-arguments-intercept":91189,"decodeUtf8-cpu-arguments-slope":769,"decodeUtf8-memory-arguments-intercept":4,"decodeUtf8-memory-arguments-slope":2,"divideInteger-cpu-arguments-constant":85848,"divideInteger-cpu-arguments-model-arguments-intercept":228465,"divideInteger-cpu-arguments-model-arguments-slope":122,"divideInteger-memory-arguments-intercept":0,"divideInteger-memory-arguments-minimum":1,"divideInteger-memory-arguments-slope":1,"encodeUtf8-cpu-arguments-intercept":1000,"encodeUtf8-cpu-arguments-slope":42921,"encodeUtf8-memory-arguments-intercept":4,"encodeUtf8-memory-arguments-slope":2,"equalsByteString-cpu-arguments-constant":24548,"equalsByteString-cpu-arguments-intercept":29498,"equalsByteString-cpu-arguments-slope":38,"equalsByteString-memory-arguments":1,"equalsData-cpu-arguments-intercept":898148,"equalsData-cpu-arguments-slope":27279,"equalsData-memory-arguments":1,"equalsInteger-cpu-arguments-intercept":51775,"equalsInteger-cpu-arguments-slope":558,"equalsInteger-memory-arguments":1,"equalsString-cpu-arguments-constant":39184,"equalsString-cpu-arguments-intercept":1000,"equalsString-cpu-arguments-slope":60594,"equalsString-memory-arguments":1,"fstPair-cpu-arguments":141895,"fstPair-memory-arguments":32,"headList-cpu-arguments":83150,"headList-memory-arguments":32,"iData-cpu-arguments":15299,"iData-memory-arguments":32,"ifThenElse-cpu-arguments":76049,"ifThenElse-memory-arguments":1,"indexByteString-cpu-arguments":13169,"indexByteString-memory-arguments":4,"lengthOfByteString-cpu-arguments":22100,"lengthOfByteString-memory-arguments":10,"lessThanByteString-cpu-arguments-intercept":28999,"lessThanByteString-cpu-arguments-slope":74,"lessThanByteString-memory-arguments":1,"lessThanEqualsByteString-cpu-arguments-intercept":28999,"lessThanEqualsByteString-cpu-arguments-slope":74,"lessThanEqualsByteString-memory-arguments":1,"lessThanEqualsInteger-cpu-arguments-intercept":43285,"lessThanEqualsInteger-cpu-arguments-slope":552,"lessThanEqualsInteger-memory-arguments":1,"lessThanInteger-cpu-arguments-intercept":44749,"lessThanInteger-cpu-arguments-slope":541,"lessThanInteger-memory-arguments":1,"listData-cpu-arguments":33852,"listData-memory-arguments":32,"mapData-cpu-arguments":68246,"mapData-memory-arguments":32,"mkCons-cpu-arguments":72362,"mkCons-memory-arguments":32,"mkNilData-cpu-arguments":7243,"mkNilData-memory-arguments":32,"mkNilPairData-cpu-arguments":7391,"mkNilPairData-memory-arguments":32,"mkPairData-cpu-arguments":11546,"mkPairData-memory-arguments":32,"modInteger-cpu-arguments-constant":85848,"modInteger-cpu-arguments-model-arguments-intercept":228465,"modInteger-cpu-arguments-model-arguments-slope":122,"modInteger-memory-arguments-intercept":0,"modInteger-memory-arguments-minimum":1,"modInteger-memory-arguments-slope":1,"multiplyInteger-cpu-arguments-intercept":90434,"multiplyInteger-cpu-arguments-slope":519,"multiplyInteger-memory-arguments-intercept":0,"multiplyInteger-memory-arguments-slope":1,"nullList-cpu-arguments":74433,"nullList-memory-arguments":32,"quotientInteger-cpu-arguments-constant":85848,"quotientInteger-cpu-arguments-model-arguments-intercept":228465,"quotientInteger-cpu-arguments-model-arguments-slope":122,"quotientInteger-memory-arguments-intercept":0,"quotientInteger-memory-arguments-minimum":1,"quotientInteger-memory-arguments-slope":1,"remainderInteger-cpu-arguments-constant":85848,"remainderInteger-cpu-arguments-model-arguments-intercept":228465,"remainderInteger-cpu-arguments-model-arguments-slope":122,"remainderInteger-memory-arguments-intercept":0,"remainderInteger-memory-arguments-minimum":1,"remainderInteger-memory-arguments-slope":1,"serialiseData-cpu-arguments-intercept":955506,"serialiseData-cpu-arguments-slope":213312,"serialiseData-memory-arguments-intercept":0,"serialiseData-memory-arguments-slope":2,"sha2_256-cpu-arguments-intercept":270652,"sha2_256-cpu-arguments-slope":22588,"sha2_256-memory-arguments":4,"sha3_256-cpu-arguments-intercept":1457325,"sha3_256-cpu-arguments-slope":64566,"sha3_256-memory-arguments":4,"sliceByteString-cpu-arguments-intercept":20467,"sliceByteString-cpu-arguments-slope":1,"sliceByteString-memory-arguments-intercept":4,"sliceByteString-memory-arguments-slope":0,"sndPair-cpu-arguments":141992,"sndPair-memory-arguments":32,"subtractInteger-cpu-arguments-intercept":100788,"subtractInteger-cpu-arguments-slope":420,"subtractInteger-memory-arguments-intercept":1,"subtractInteger-memory-arguments-slope":1,"tailList-cpu-arguments":81663,"tailList-memory-arguments":32,"trace-cpu-arguments":59498,"trace-memory-arguments":32,"unBData-cpu-arguments":20142,"unBData-memory-arguments":32,"unConstrData-cpu-arguments":24588,"unConstrData-memory-arguments":32,"unIData-cpu-arguments":20744,"unIData-memory-arguments":32,"unListData-cpu-arguments":25933,"unListData-memory-arguments":32,"unMapData-cpu-arguments":24623,"unMapData-memory-arguments":32,"verifyEcdsaSecp256k1Signature-cpu-arguments":43053543,"verifyEcdsaSecp256k1Signature-memory-arguments":10,"verifyEd25519Signature-cpu-arguments-intercept":53384111,"verifyEd25519Signature-cpu-arguments-slope":14333,"verifyEd25519Signature-memory-arguments":10,"verifySchnorrSecp256k1Signature-cpu-arguments-intercept":43574283,"verifySchnorrSecp256k1Signature-cpu-arguments-slope":26308,"verifySchnorrSecp256k1Signature-memory-arguments":10},"PlutusV3":{"addInteger-cpu-arguments-intercept":100788,"addInteger-cpu-arguments-slope":420,"addInteger-memory-arguments-intercept":1,"addInteger-memory-arguments-slope":1,"appendByteString-cpu-arguments-intercept":1000,"appendByteString-cpu-arguments-slope":173,"appendByteString-memory-arguments-intercept":0,"appendByteString-memory-arguments-slope":1,"appendString-cpu-arguments-intercept":1000,"appendString-cpu-arguments-slope":59957,"appendString-memory-arguments-intercept":4,"appendString-memory-arguments-slope":1,"bData-cpu-arguments":11183,"bData-memory-arguments":32,"blake2b_256-cpu-arguments-intercept":201305,"blake2b_256-cpu-arguments-slope":8356,"blake2b_256-memory-arguments":4,"cekApplyCost-exBudgetCPU":16000,"cekApplyCost-exBudgetMemory":100,"cekBuiltinCost-exBudgetCPU":16000,"cekBuiltinCost-exBudgetMemory":100,"cekConstCost-exBudgetCPU":16000,"cekConstCost-exBudgetMemory":100,"cekDelayCost-exBudgetCPU":16000,"cekDelayCost-exBudgetMemory":100,"cekForceCost-exBudgetCPU":16000,"cekForceCost-exBudgetMemory":100,"cekLamCost-exBudgetCPU":16000,"cekLamCost-exBudgetMemory":100,"cekStartupCost-exBudgetCPU":100,"cekStartupCost-exBudgetMemory":100,"cekVarCost-exBudgetCPU":16000,"cekVarCost-exBudgetMemory":100,"chooseData-cpu-arguments":94375,"chooseData-memory-arguments":32,"chooseList-cpu-arguments":132994,"chooseList-memory-arguments":32,"chooseUnit-cpu-arguments":61462,"chooseUnit-memory-arguments":4,"consByteString-cpu-arguments-intercept":72010,"consByteString-cpu-arguments-slope":178,"consByteString-memory-arguments-intercept":0,"consByteString-memory-arguments-slope":1,"constrData-cpu-arguments":22151,"constrData-memory-arguments":32,"decodeUtf8-cpu-arguments-intercept":91189,"decodeUtf8-cpu-arguments-slope":769,"decodeUtf8-memory-arguments-intercept":4,"decodeUtf8-memory-arguments-slope":2,"divideInteger-cpu-arguments-constant":85848,"divideInteger-cpu-arguments-model-arguments-c00":123203,"divideInteger-cpu-arguments-model-arguments-c01":7305,"divideInteger-cpu-arguments-model-arguments-c02":-900,"divideInteger-cpu-arguments-model-arguments-c10":1716,"divideInteger-cpu-arguments-model-arguments-c11":549,"divideInteger-cpu-arguments-model-arguments-c20":57,"divideInteger-cpu-arguments-model-arguments-minimum":85848,"divideInteger-memory-arguments-intercept":0,"divideInteger-memory-arguments-minimum":1,"divideInteger-memory-arguments-slope":1,"encodeUtf8-cpu-arguments-intercept":1000,"encodeUtf8-cpu-arguments-slope":42921,"encodeUtf8-memory-arguments-intercept":4,"encodeUtf8-memory-arguments-slope":2,"equalsByteString-cpu-arguments-constant":24548,"equalsByteString-cpu-arguments-intercept":29498,"equalsByteString-cpu-arguments-slope":38,"equalsByteString-memory-arguments":1,"equalsData-cpu-arguments-intercept":898148,"equalsData-cpu-arguments-slope":27279,"equalsData-memory-arguments":1,"equalsInteger-cpu-arguments-intercept":51775,"equalsInteger-cpu-arguments-slope":558,"equalsInteger-memory-arguments":1,"equalsString-cpu-arguments-constant":39184,"equalsString-cpu-arguments-intercept":1000,"equalsString-cpu-arguments-slope":60594,"equalsString-memory-arguments":1,"fstPair-cpu-arguments":141895,"fstPair-memory-arguments":32,"headList-cpu-arguments":83150,"headList-memory-arguments":32,"iData-cpu-arguments":15299,"iData-memory-arguments":32,"ifThenElse-cpu-arguments":76049,"ifThenElse-memory-arguments":1,"indexByteString-cpu-arguments":13169,"indexByteString-memory-arguments":4,"lengthOfByteString-cpu-arguments":22100,"lengthOfByteString-memory-arguments":10,"lessThanByteString-cpu-arguments-intercept":28999,"lessThanByteString-cpu-arguments-slope":74,"lessThanByteString-memory-arguments":1,"lessThanEqualsByteString-cpu-arguments-intercept":28999,"lessThanEqualsByteString-cpu-arguments-slope":74,"lessThanEqualsByteString-memory-arguments":1,"lessThanEqualsInteger-cpu-arguments-intercept":43285,"lessThanEqualsInteger-cpu-arguments-slope":552,"lessThanEqualsInteger-memory-arguments":1,"lessThanInteger-cpu-arguments-intercept":44749,"lessThanInteger-cpu-arguments-slope":541,"lessThanInteger-memory-arguments":1,"listData-cpu-arguments":33852,"listData-memory-arguments":32,"mapData-cpu-arguments":68246,"mapData-memory-arguments":32,"mkCons-cpu-arguments":72362,"mkCons-memory-arguments":32,"mkNilData-cpu-arguments":7243,"mkNilData-memory-arguments":32,"mkNilPairData-cpu-arguments":7391,"mkNilPairData-memory-arguments":32,"mkPairData-cpu-arguments":11546,"mkPairData-memory-arguments":32,"modInteger-cpu-arguments-constant":85848,"modInteger-cpu-arguments-model-arguments-c00":123203,"modInteger-cpu-arguments-model-arguments-c01":7305,"modInteger-cpu-arguments-model-arguments-c02":-900,"modInteger-cpu-arguments-model-arguments-c10":1716,"modInteger-cpu-arguments-model-arguments-c11":549,"modInteger-cpu-arguments-model-arguments-c20":57,"modInteger-cpu-arguments-model-arguments-minimum":85848,"modInteger-memory-arguments-intercept":0,"modInteger-memory-arguments-slope":1,"multiplyInteger-cpu-arguments-intercept":90434,"multiplyInteger-cpu-arguments-slope":519,"multiplyInteger-memory-arguments-intercept":0,"multiplyInteger-memory-arguments-slope":1,"nullList-cpu-arguments":74433,"nullList-memory-arguments":32,"quotientInteger-cpu-arguments-constant":85848,"quotientInteger-cpu-arguments-model-arguments-c00":123203,"quotientInteger-cpu-arguments-model-arguments-c01":7305,"quotientInteger-cpu-arguments-model-arguments-c02":-900,"quotientInteger-cpu-arguments-model-arguments-c10":1716,"quotientInteger-cpu-arguments-model-arguments-c11":549,"quotientInteger-cpu-arguments-model-arguments-c20":57,"quotientInteger-cpu-arguments-model-arguments-minimum":85848,"quotientInteger-memory-arguments-intercept":0,"quotientInteger-memory-arguments-slope":1,"remainderInteger-cpu-arguments-constant":1,"remainderInteger-cpu-arguments-model-arguments-c00":85848,"remainderInteger-cpu-arguments-model-arguments-c01":123203,"remainderInteger-cpu-arguments-model-arguments-c02":7305,"remainderInteger-cpu-arguments-model-arguments-c10":-900,"remainderInteger-cpu-arguments-model-arguments-c11":1716,"remainderInteger-cpu-arguments-model-arguments-c20":549,"remainderInteger-cpu-arguments-model-arguments-minimum":57,"remainderInteger-memory-arguments-intercept":85848,"remainderInteger-memory-arguments-minimum":0,"remainderInteger-memory-arguments-slope":1,"serialiseData-cpu-arguments-intercept":955506,"serialiseData-cpu-arguments-slope":213312,"serialiseData-memory-arguments-intercept":0,"serialiseData-memory-arguments-slope":2,"sha2_256-cpu-arguments-intercept":270652,"sha2_256-cpu-arguments-slope":22588,"sha2_256-memory-arguments":4,"sha3_256-cpu-arguments-intercept":1457325,"sha3_256-cpu-arguments-slope":64566,"sha3_256-memory-arguments":4,"sliceByteString-cpu-arguments-intercept":20467,"sliceByteString-cpu-arguments-slope":1,"sliceByteString-memory-arguments-intercept":4,"sliceByteString-memory-arguments-slope":0,"sndPair-cpu-arguments":141992,"sndPair-memory-arguments":32,"subtractInteger-cpu-arguments-intercept":100788,"subtractInteger-cpu-arguments-slope":420,"subtractInteger-memory-arguments-intercept":1,"subtractInteger-memory-arguments-slope":1,"tailList-cpu-arguments":81663,"tailList-memory-arguments":32,"trace-cpu-arguments":59498,"trace-memory-arguments":32,"unBData-cpu-arguments":20142,"unBData-memory-arguments":32,"unConstrData-cpu-arguments":24588,"unConstrData-memory-arguments":32,"unIData-cpu-arguments":20744,"unIData-memory-arguments":32,"unListData-cpu-arguments":25933,"unListData-memory-arguments":32,"unMapData-cpu-arguments":24623,"unMapData-memory-arguments":32,"verifyEcdsaSecp256k1Signature-cpu-arguments":43053543,"verifyEcdsaSecp256k1Signature-memory-arguments":10,"verifyEd25519Signature-cpu-arguments-intercept":53384111,"verifyEd25519Signature-cpu-arguments-slope":14333,"verifyEd25519Signature-memory-arguments":10,"verifySchnorrSecp256k1Signature-cpu-arguments-intercept":43574283,"verifySchnorrSecp256k1Signature-cpu-arguments-slope":26308,"verifySchnorrSecp256k1Signature-memory-arguments":10,"cekConstrCost-exBudgetCPU":16000,"cekConstrCost-exBudgetMemory":100,"cekCaseCost-exBudgetCPU":16000,"cekCaseCost-exBudgetMemory":100,"bls12_381_G1_add-cpu-arguments":962335,"bls12_381_G1_add-memory-arguments":18,"bls12_381_G1_compress-cpu-arguments":2780678,"bls12_381_G1_compress-memory-arguments":6,"bls12_381_G1_equal-cpu-arguments":442008,"bls12_381_G1_equal-memory-arguments":1,"bls12_381_G1_hashToGroup-cpu-arguments-intercept":52538055,"bls12_381_G1_hashToGroup-cpu-arguments-slope":3756,"bls12_381_G1_hashToGroup-memory-arguments":18,"bls12_381_G1_neg-cpu-arguments":267929,"bls12_381_G1_neg-memory-arguments":18,"bls12_381_G1_scalarMul-cpu-arguments-intercept":76433006,"bls12_381_G1_scalarMul-cpu-arguments-slope":8868,"bls12_381_G1_scalarMul-memory-arguments":18,"bls12_381_G1_uncompress-cpu-arguments":52948122,"bls12_381_G1_uncompress-memory-arguments":18,"bls12_381_G2_add-cpu-arguments":1995836,"bls12_381_G2_add-memory-arguments":36,"bls12_381_G2_compress-cpu-arguments":3227919,"bls12_381_G2_compress-memory-arguments":12,"bls12_381_G2_equal-cpu-arguments":901022,"bls12_381_G2_equal-memory-arguments":1,"bls12_381_G2_hashToGroup-cpu-arguments-intercept":166917843,"bls12_381_G2_hashToGroup-cpu-arguments-slope":4307,"bls12_381_G2_hashToGroup-memory-arguments":36,"bls12_381_G2_neg-cpu-arguments":284546,"bls12_381_G2_neg-memory-arguments":36,"bls12_381_G2_scalarMul-cpu-arguments-intercept":158221314,"bls12_381_G2_scalarMul-cpu-arguments-slope":26549,"bls12_381_G2_scalarMul-memory-arguments":36,"bls12_381_G2_uncompress-cpu-arguments":74698472,"bls12_381_G2_uncompress-memory-arguments":36,"bls12_381_finalVerify-cpu-arguments":333849714,"bls12_381_finalVerify-memory-arguments":1,"bls12_381_millerLoop-cpu-arguments":254006273,"bls12_381_millerLoop-memory-arguments":72,"bls12_381_mulMlResult-cpu-arguments":2174038,"bls12_381_mulMlResult-memory-arguments":72,"keccak_256-cpu-arguments-intercept":2261318,"keccak_256-cpu-arguments-slope":64571,"keccak_256-memory-arguments":4,"blake2b_224-cpu-arguments-intercept":207616,"blake2b_224-cpu-arguments-slope":8310,"blake2b_224-memory-arguments":4,"integerToByteString-cpu-arguments-c0":1293828,"integerToByteString-cpu-arguments-c1":28716,"integerToByteString-cpu-arguments-c2":63,"integerToByteString-memory-arguments-intercept":0,"integerToByteString-memory-arguments-slope":1,"byteStringToInteger-cpu-arguments-c0":1006041,"byteStringToInteger-cpu-arguments-c1":43623,"byteStringToInteger-cpu-arguments-c2":251,"byteStringToInteger-memory-arguments-intercept":0,"byteStringToInteger-memory-arguments-slope":1}}}
   */
  getCostModelParameters(chainType: string, option?: any): Promise<any>;
  /**
   * Get token pairs hash.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<string>} - The token pairs hash.
   * @example
   * const ret = await sdk.getTokenPairsHash();
   * console.log(ret);
   * // "352bef4b54d176c31520d89a148c4b38"
   */
  getTokenPairsHash(option?: any): Promise<string>;
  /**
   * Calculates the total balances issued by a given account, optionally excluding amounts held by operational addresses.
   * @since 1.1.0
   * @group XRP
   * @param {string} chainType - The chain being queried. Currently supports <code>'XRP'</code>.
   * @param {string} address - The Address to check. This should be the issuing address.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>excludeAddresses</code> - Optional, the array of addresses to exclude from the balances issued.
   * @returns {Promise<any>} - The total balances issued by a given account.
   * @example
   * const ret = await sdk.getGateWayBalances("XRP", "rLZGBrdXNvS1RPjjJB7Z4FeA4w5Hggtt7t");
   * console.log(ret);
   * // {"account":"rLZGBrdXNvS1RPjjJB7Z4FeA4w5Hggtt7t","ledger_hash":"16452CB42D4CC620541CB343195146D2C0E447ECD60A30E4034727799ECBD0DC","ledger_index":15906583,"validated":true}
   */
  getGateWayBalances(chainType: string, address: string, option?: any): Promise<any>;
  /**
   * Returns information about an account's trust lines, including balances in all non-XRP currencies and assets.
   * @since 1.1.0
   * @group XRP
   * @param {string} chainType - The chain being queried. Currently supports <code>'XRP'</code>.
   * @param {string} address - A unique identifier for the account, most commonly the account's Address.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>peer</code> - Optional, the Address of a second account. If provided, show only lines of trust connecting the two accounts.
   * <br>&nbsp;&nbsp;<code>ledgerVersion</code> - Optional, the ledger version of the ledger to use.
   * @returns {Promise<Array<any>>} - The infomation of account's trust lines.
   * @example
   * const ret = await sdk.getTrustLines("XRP", "rKFgsDG5mqxaMG45GR8J1CeESFCJ3xpqHS");
   * console.log(ret);
   * // [{"account":"rnqc3LJgN6E2Ern7G4tdciihoFtcatm7FX","balance":"1000000000","currency":"BAR","limit":"1000000000","limit_peer":"0","quality_in":0,"quality_out":0},{"account":"rh1FqPEZ4AvptV6vXr3WUgPHCgpkS2nb9G","balance":"0","currency":"FOO","limit":"100000","limit_peer":"0","no_ripple_peer":true,"quality_in":0,"quality_out":0}]
   */
  getTrustLines(chainType: string, address: string, option?: any): Promise<Array<any>>;
  /**
   * Get cross chain reserved quota.
   * @since 1.1.0
   * @group Accounts
   * @param {any} option - Object:
   * <br>&nbsp;&nbsp;<code>targetChainType</code> - The target chain being queried.
   * <br>&nbsp;&nbsp;<code>symbols</code> - The array of token symbol being queried.
   * @returns {Promise<any>} - The cross chain reserved quota.
   * @example
   * const ret = await sdk.getCrossChainReservedQuota({"targetChainType":"BTC", symbols:["BTC"]});
   * console.log(ret);
   * // {"BTC":"0.5"}
   */
  getCrossChainReservedQuota(option: any): Promise<any>;
  /**
   * Check if address list contrains hacker account.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {Array<string>} address - The Array of address you want to check.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<boolean>} - The token pairs hash.
   * @example
   * const ret = await sdk.hasHackerAccount(["0x..."]);
   * console.log(ret);
   * // false
   */
  hasHackerAccount(address: Array<string>, option?: any): Promise<boolean>;
  /**
   * Get the parameters of the blockchain used for witnessses to create a proposal.
   * @since 1.1.0
   * @group Contracts
   * @param {string} chainType - The chain being queried. Currently supports <code>'TRX'</code>.
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The parameters.
   * @example
   * const ret = await sdk.getChainParameters("TRX");
   * console.log(ret);
   * // [{"key":"getMaintenanceTimeInterval","value":1800000},{"key":"getAccountUpgradeCost","value":9999000000},{"key":"getCreateAccountFee","value":100000},{"key":"getTransactionFee","value":1000},{"key":"getAssetIssueFee","value":1024000000},{"key":"getWitnessPayPerBlock","value":8000000},{"key":"getWitnessStandbyAllowance","value":100000000},{"key":"getCreateNewAccountFeeInSystemContract","value":1000000},{"key":"getCreateNewAccountBandwidthRate","value":1},{"key":"getAllowCreationOfContracts","value":1},{"key":"getRemoveThePowerOfTheGr","value":-1},{"key":"getEnergyFee","value":100},{"key":"getExchangeCreateFee","value":1024000000},{"key":"getMaxCpuTimeOfOneTx","value":160},{"key":"getAllowUpdateAccountName"},{"key":"getAllowSameTokenName","value":1},{"key":"getAllowDelegateResource","value":1},{"key":"getTotalEnergyLimit","value":180000000000},{"key":"getAllowTvmTransferTrc10","value":1},{"key":"getTotalEnergyCurrentLimit","value":180000000000},{"key":"getAllowMultiSign","value":1},{"key":"getAllowAdaptiveEnergy"},{"key":"getTotalEnergyTargetLimit","value":12500000},{"key":"getTotalEnergyAverageUsage"},{"key":"getUpdateAccountPermissionFee","value":100000000},{"key":"getMultiSignFee","value":1000000},{"key":"getAllowAccountStateRoot"},{"key":"getAllowProtoFilterNum"},{"key":"getAllowTvmConstantinople","value":1},{"key":"getAllowTvmSolidity059","value":1},{"key":"getAllowTvmIstanbul","value":1},{"key":"getAllowShieldedTRC20Transaction","value":1},{"key":"getForbidTransferToContract"},{"key":"getAdaptiveResourceLimitTargetRatio","value":10},{"key":"getAdaptiveResourceLimitMultiplier","value":1000},{"key":"getChangeDelegation","value":1},{"key":"getWitness127PayPerBlock","value":128000000},{"key":"getAllowMarketTransaction"},{"key":"getMarketSellFee"},{"key":"getMarketCancelFee"},{"key":"getAllowPBFT","value":1},{"key":"getAllowTransactionFeePool"},{"key":"getMaxFeeLimit","value":15000000000},{"key":"getAllowOptimizeBlackHole","value":1},{"key":"getAllowNewResourceModel"},{"key":"getAllowTvmFreeze","value":1},{"key":"getAllowTvmVote","value":1},{"key":"getAllowTvmLondon","value":1},{"key":"getAllowTvmCompatibleEvm"},{"key":"getAllowAccountAssetOptimization"},{"key":"getFreeNetLimit","value":600},{"key":"getTotalNetLimit","value":43200000000},{"key":"getAllowHigherLimitForMaxCpuTimeOfOneTx","value":1},{"key":"getAllowAssetOptimization","value":1},{"key":"getAllowNewReward","value":1},{"key":"getMemoFee","value":1000000},{"key":"getAllowDelegateOptimization","value":1},{"key":"getUnfreezeDelayDays","value":1},{"key":"getAllowOptimizedReturnValueOfChainId","value":1},{"key":"getAllowDynamicEnergy","value":1},{"key":"getDynamicEnergyThreshold","value":5000000000},{"key":"getDynamicEnergyIncreaseFactor","value":2000},{"key":"getDynamicEnergyMaxFactor","value":34000},{"key":"getAllowTvmShangHai","value":1},{"key":"getAllowCancelAllUnfreezeV2","value":1},{"key":"getMaxDelegateLockPeriod","value":144000},{"key":"getAllowOldRewardOpt","value":1},{"key":"getAllowEnergyAdjustment","value":1},{"key":"getMaxCreateAccountTxSize","value":1000},{"key":"getAllowStrictMath","value":1},{"key":"getConsensusLogicOptimization","value":1},{"key":"getAllowTvmCancun","value":1},{"key":"getAllowTvmBlob","value":1},{"key":"getAllowTvmSelfdestructRestriction","value":1},{"key":"getProposalExpireTime","value":600000}]
   */
  getChainParameters(chainType: string, option?: any): Promise<Array<any>>;
  /**
   * Get cross chain quota hidden flags.
   * @since 1.1.0
   * @group CrossChainV2
   * @deprecated use {@link getChainQuotaHiddenFlagDirectionally} instead.
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>chainIds</code> -  Array of chain IDs about the cross chain pair.
   * @returns {Promise<any>} - The cross chain quota hidden flags.
   * @example
   * const ret = await sdk.getChainQuotaHiddenFlags({chainIds:["1073741834", "2147484458", "2153201998"]});
   * console.log(ret);
   * // {}
   */
  getChainQuotaHiddenFlags(option?: any): Promise<any>;
  /**
   * Get cross chain quota hidden flags.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - Optional:
   * <br>&nbsp;&nbsp;<code>chainIds</code> -  Array of chain bip44 IDs about the cross chain pair.
   * @returns {Promise<any>} - The cross chain quota hidden flags.
   * @example
   * const ret = await sdk.getChainQuotaHiddenFlagDirectionally({chainIds:["1073741834", "2147484458", "2153201998"]});
   * console.log(ret);
   * // {"2153201998":{"hiddenSourceChainQuota":false,"hiddenTargetChainQuota":false}}
   */
  getChainQuotaHiddenFlagDirectionally(option?: any): Promise<any>;
  /**
   * Get discount info.
   * @since 1.1.0
   * @group CrossChainV2
   * @param {any} [option] - A reserved parameter.
   * @returns {Promise<Array<any>>} - The discount info.
   * @example
   * const ret = await sdk.getWanBridgeDiscounts();
   * console.log(ret);
   * // [
   * //   {
   * //     "amount": "10000000000000000000000",
   * //     "discount": "900000000000000000"
   * //   },
   * //   {
   * //     "amount": "25000000000000000000000",
   * //     "discount": "750000000000000000"
   * //   },
   * //   {
   * //     "amount": "50000000000000000000000",
   * //     "discount": "500000000000000000"
   * //   },
   * //   {
   * //     "amount": "100000000000000000000000",
   * //     "discount": "400000000000000000"
   * //   },
   * //   {
   * //     "amount": "500000000000000000000000",
   * //     "discount": "300000000000000000"
   * //   },
   * //   {
   * //     "amount": "1000000000000000000000000",
   * //     "discount": "200000000000000000"
   * //   }
   * // ]
   */
  getWanBridgeDiscounts(option?: any): Promise<Array<any>>;
}
//#endregion
export { IwanClientOptions, IwanClient as default };
//# sourceMappingURL=index.d.ts.map