'use strict';

const assert = require('assert');

/**
 * Helper for multiplexing promise implementations
 */

const store = {
  _promise: null
};

/**
 * Get the current promise constructor
 */

store.get = function() {
  return store._promise;
};

/**
 * Set the current promise constructor
 */

store.set = function(lib) {
  assert.ok(typeof lib === 'function',
    `iwan-js-sdk.Promise must be a function, got ${lib}`);
  store._promise = lib;
};

/*!
 * Use native promises by default
 */

store.set(global.Promise);

module.exports = store;
